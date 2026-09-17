using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Win32;

namespace EpyxisAgentService
{
    /// <summary>
    /// Handles device enrollment and DPAPI-based API key storage.
    ///
    /// DPAPI storage contract:
    ///   - The plaintext key is encrypted with <see cref="DataProtectionScope.LocalMachine"/>,
    ///     meaning only processes running on THIS machine can decrypt it.
    ///   - The ciphertext is stored as REG_BINARY at:
    ///       HKLM\SOFTWARE\Epyxis\Agent\ApiKeyBlob
    ///   - Even if the registry hive file is copied off-disk, the blob cannot be
    ///     decrypted without the machine's DPAPI master keys.
    ///   - The plaintext NEVER touches disk at any point.
    /// </summary>
    internal static class EnrollmentManager
    {
        private const string KeyApiKeyBlob = "ApiKeyBlob";

        private static readonly HttpClient _http = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(30)
        };

        // -----------------------------------------------------------------------
        // DPAPI helpers
        // -----------------------------------------------------------------------

        /// <summary>
        /// Encrypts the plaintext API key with DPAPI (LocalMachine scope) and
        /// writes the ciphertext blob to the registry.  Never stores plaintext.
        /// </summary>
        public static void StoreApiKey(string plaintextKey)
        {
            byte[] plainBytes  = Encoding.UTF8.GetBytes(plaintextKey);
            // LocalMachine scope — decryptable only by processes on this exact machine.
            byte[] cipherBytes = ProtectedData.Protect(plainBytes, null, DataProtectionScope.LocalMachine);

            using var key = Registry.LocalMachine.CreateSubKey(AgentConfig.RegistryRoot, writable: true);
            key?.SetValue(KeyApiKeyBlob, cipherBytes, RegistryValueKind.Binary);

            // Zero out the plaintext byte array before releasing it
            Array.Clear(plainBytes, 0, plainBytes.Length);
        }

        /// <summary>
        /// Loads and decrypts the API key from the registry.
        /// Returns null if no key has been stored yet.
        /// </summary>
        public static string? LoadApiKey()
        {
            using var key = Registry.LocalMachine.OpenSubKey(AgentConfig.RegistryRoot, writable: false);
            var blob = (byte[]?)key?.GetValue(KeyApiKeyBlob, null);
            if (blob == null || blob.Length == 0) return null;

            byte[] plainBytes = ProtectedData.Unprotect(blob, null, DataProtectionScope.LocalMachine);
            string result = Encoding.UTF8.GetString(plainBytes);
            Array.Clear(plainBytes, 0, plainBytes.Length);
            return result;
        }

        // -----------------------------------------------------------------------
        // Enrollment
        // -----------------------------------------------------------------------

        /// <summary>
        /// Calls POST /api/devices/enroll with the enrollment token, hostname,
        /// and the disclosure acknowledgment timestamp recorded by the service when
        /// the user clicked "I understand — Continue".
        ///
        /// On success:
        ///   1. The plaintext API key is encrypted and stored via DPAPI.
        ///   2. Device metadata (ID, hostname, tenantId) is written to the registry.
        ///   3. FirstRunComplete is set to 1.
        /// </summary>
        /// <returns>The EnrollResult on success, or throws on failure.</returns>
        public static async Task<EnrollResult> EnrollAsync(
            string enrollmentToken,
            string hostname,
            DateTime disclosureAcknowledgedAt)
        {
            var payload = new
            {
                enrollmentToken,
                hostname,
                // ISO-8601 with 'Z' suffix — timezone-agnostic, readable by any JSON parser
                disclosureAcknowledgedAt = disclosureAcknowledgedAt.ToUniversalTime()
                                                                    .ToString("o")
            };

            var response = await _http.PostAsJsonAsync(
                $"{AgentConfig.BackendBaseUrl}/api/devices/enroll",
                payload);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException(
                    $"Enrollment failed ({(int)response.StatusCode}): {errorBody}");
            }

            var result = await response.Content.ReadFromJsonAsync<EnrollResponse>()
                         ?? throw new InvalidOperationException("Empty response from enroll endpoint");

            // Store the key encrypted — plaintext never hits disk
            StoreApiKey(result.ApiKey);

            // Persist device metadata to registry (written by the service = runs as SYSTEM)
            RegistryState.SetEnrollmentResult(
                deviceId:   result.DeviceId,
                hostname:   hostname,
                tenantId:   string.Empty,  // tenantId not in enroll response; will be updated on first status poll
                enrolledAt: DateTime.UtcNow.ToString("o"));
            RegistryState.SetFirstRunComplete(true);

            return new EnrollResult
            {
                DeviceId = result.DeviceId,
                Hostname = hostname
            };
        }

        // -----------------------------------------------------------------------
        // Response DTOs — internal, only used here
        // -----------------------------------------------------------------------

        private class EnrollResponse
        {
            [JsonPropertyName("deviceId")]
            public string DeviceId { get; set; } = string.Empty;

            [JsonPropertyName("apiKey")]
            public string ApiKey { get; set; } = string.Empty;

            [JsonPropertyName("message")]
            public string Message { get; set; } = string.Empty;
        }
    }

    /// <summary>Public result returned to IPC callers after a successful enrollment.</summary>
    public class EnrollResult
    {
        public string DeviceId { get; set; } = string.Empty;
        public string Hostname { get; set; } = string.Empty;
    }
}
