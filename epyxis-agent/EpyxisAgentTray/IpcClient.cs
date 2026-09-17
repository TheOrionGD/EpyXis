using System;
using System.IO;
using System.IO.Pipes;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace EpyxisAgentTray
{
    /// <summary>
    /// Connects to the EpyxisAgentService named pipe, sends one JSON command,
    /// and returns the JSON response.  Each call opens and closes its own
    /// connection — keeps it stateless and avoids stale-pipe issues.
    /// </summary>
    internal static class IpcClient
    {
        private const string PipeName          = "EpyxisAgentIPC";
        private const int    ConnectTimeoutMs  = 5000;

        // -----------------------------------------------------------------------
        // Public typed helpers
        // -----------------------------------------------------------------------

        public static async Task<StateResponse?> GetStateAsync()
        {
            string json = await SendAsync(new { command = "getState" }).ConfigureAwait(false);
            return TryDeserialize<StateResponse>(json);
        }

        public static async Task<BasicResponse?> AcknowledgeDisclosureAsync(DateTime utcTimestamp)
        {
            string json = await SendAsync(new
            {
                command   = "acknowledgeDisclosure",
                timestamp = utcTimestamp.ToString("o")
            }).ConfigureAwait(false);
            return TryDeserialize<BasicResponse>(json);
        }

        public static async Task<EnrollResponse?> EnrollAsync(string token, string hostname)
        {
            string json = await SendAsync(new
            {
                command  = "enroll",
                token,
                hostname
            }).ConfigureAwait(false);
            return TryDeserialize<EnrollResponse>(json);
        }

        // -----------------------------------------------------------------------
        // Core send/receive
        // -----------------------------------------------------------------------

        private static async Task<string> SendAsync(object command)
        {
            try
            {
                using var pipe = new NamedPipeClientStream(
                    ".",           // local machine
                    PipeName,
                    PipeDirection.InOut,
                    PipeOptions.Asynchronous);

                await pipe.ConnectAsync(ConnectTimeoutMs).ConfigureAwait(false);

                var writer = new StreamWriter(pipe, Encoding.UTF8) { AutoFlush = true };
                var reader = new StreamReader(pipe, Encoding.UTF8);

                await writer.WriteLineAsync(JsonSerializer.Serialize(command)).ConfigureAwait(false);

                string? line = await reader.ReadLineAsync().ConfigureAwait(false);
                return line ?? """{"ok":false,"error":"Empty response from service"}""";
            }
            catch (TimeoutException)
            {
                return """{"ok":false,"error":"Service not reachable — is EpyxisAgentService running?"}""";
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { ok = false, error = ex.Message });
            }
        }

        // -----------------------------------------------------------------------
        // Deserialization helpers
        // -----------------------------------------------------------------------

        private static T? TryDeserialize<T>(string json)
        {
            try { return JsonSerializer.Deserialize<T>(json); }
            catch { return default; }
        }

        // -----------------------------------------------------------------------
        // Response DTOs
        // -----------------------------------------------------------------------

        public class BasicResponse
        {
            public bool   Ok        { get; set; }
            public string Error     { get; set; } = string.Empty;
            public string Timestamp { get; set; } = string.Empty;
        }

        public class StateResponse
        {
            public bool   Ok                      { get; set; }
            public bool   FirstRunComplete         { get; set; }
            public bool   Enrolled                 { get; set; }
            public string DeviceId                 { get; set; } = string.Empty;
            public string Hostname                 { get; set; } = string.Empty;
            public string TenantId                 { get; set; } = string.Empty;
            public string Status                   { get; set; } = string.Empty;
            public string LastSeenAt               { get; set; } = string.Empty;
            public string EnrolledAt               { get; set; } = string.Empty;
            public string DisclosureAcknowledgedAt { get; set; } = string.Empty;
            public string Error                    { get; set; } = string.Empty;
        }

        public class EnrollResponse
        {
            public bool   Ok       { get; set; }
            public string DeviceId { get; set; } = string.Empty;
            public string Hostname { get; set; } = string.Empty;
            public string Error    { get; set; } = string.Empty;
        }
    }
}
