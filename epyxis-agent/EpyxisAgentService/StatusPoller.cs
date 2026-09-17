using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace EpyxisAgentService
{
    /// <summary>
    /// Background timer that polls GET /api/devices/me/status at a configurable
    /// interval and updates the registry with the latest status and last-seen time.
    ///
    /// If the backend responds with status="revoked", the registry Status key is
    /// updated to "revoked".  The Tray app reads this on the next time the user
    /// opens "Agent status" and surfaces the change — within one poll cycle.
    /// </summary>
    internal sealed class StatusPoller : IDisposable
    {
        private Timer?     _timer;
        private readonly HttpClient _http;

        public StatusPoller()
        {
            _http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        }

        public void Start()
        {
            var interval = TimeSpan.FromSeconds(AgentConfig.StatusPollIntervalSeconds);
            // Fire immediately on start, then on the configured interval
            _timer = new Timer(OnTick, null, TimeSpan.Zero, interval);
        }

        public void Stop()
        {
            _timer?.Change(Timeout.Infinite, Timeout.Infinite);
        }

        public void Dispose()
        {
            _timer?.Dispose();
            _http.Dispose();
        }

        // -----------------------------------------------------------------------

        private void OnTick(object? state)
        {
            // Fire-and-forget on the thread-pool; exceptions are caught internally
            _ = PollAsync();
        }

        private async Task PollAsync()
        {
            try
            {
                string? apiKey = EnrollmentManager.LoadApiKey();
                if (string.IsNullOrEmpty(apiKey))
                {
                    // Not enrolled yet; nothing to poll
                    return;
                }

                var request = new HttpRequestMessage(
                    HttpMethod.Get,
                    $"{AgentConfig.BackendBaseUrl}/api/devices/me/status");
                request.Headers.Add("X-Device-Key", apiKey);

                var response = await _http.SendAsync(request).ConfigureAwait(false);

                if (!response.IsSuccessStatusCode)
                {
                    Console.Error.WriteLine(
                        $"[StatusPoller] Non-success from /me/status: {(int)response.StatusCode}");
                    return;
                }

                var body = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                var status = JsonSerializer.Deserialize<StatusResponse>(body);
                if (status == null) return;

                // Write both fields; the tray reads them on user request
                RegistryState.SetStatus(status.Status ?? "unknown");
                RegistryState.SetLastSeenAt(DateTime.UtcNow.ToString("o"));

                // If tenantId was empty at enrollment time, backfill it now
                if (!string.IsNullOrEmpty(status.TenantId) &&
                    string.IsNullOrEmpty(RegistryState.GetTenantId()))
                {
                    // Direct registry write is intentional here — this is the service,
                    // not the tray; we own HKLM writes.
                    using var regKey = Microsoft.Win32.Registry.LocalMachine
                        .CreateSubKey(AgentConfig.RegistryRoot, writable: true);
                    regKey?.SetValue("TenantId", status.TenantId,
                        Microsoft.Win32.RegistryValueKind.String);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[StatusPoller] Poll error: {ex.Message}");
            }
        }

        // -----------------------------------------------------------------------

        private class StatusResponse
        {
            [JsonPropertyName("status")]
            public string? Status { get; set; }

            [JsonPropertyName("lastSeenAt")]
            public string? LastSeenAt { get; set; }

            [JsonPropertyName("tenantId")]
            public string? TenantId { get; set; }
        }
    }
}
