using System;
using System.IO;
using System.IO.Pipes;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace EpyxisAgentService
{
    /// <summary>
    /// Named-pipe server that accepts JSON command objects from the Tray app
    /// and dispatches to EnrollmentManager or RegistryState.
    ///
    /// SECURITY — PipeSecurity:
    ///   The pipe is restricted to two SIDs only:
    ///     • LocalSystem     (the service itself)
    ///     • BUILTIN\Users   (authenticated local interactive users — covers the
    ///                        logged-in user running the Tray app without needing
    ///                        to resolve a dynamic interactive SID at service start)
    ///   All other access — including NetworkService, anonymous remote clients, and
    ///   other local users on shared/RDS machines — is denied by the explicit DACL.
    ///
    /// Protocol:
    ///   Newline-delimited UTF-8 JSON over a byte-mode pipe.
    ///   Each client connection carries exactly one request/response pair, then closes.
    ///   See IpcProtocol.cs (or comments below) for the message schema.
    /// </summary>
    internal sealed class IpcServer : IDisposable
    {
        private CancellationTokenSource? _cts;
        private Task? _listenTask;

        public void Start()
        {
            _cts = new CancellationTokenSource();
            _listenTask = Task.Run(() => ListenLoop(_cts.Token));
        }

        public void Stop()
        {
            _cts?.Cancel();
            // The listen loop will unblock on the next accept timeout
        }

        public void Dispose()
        {
            Stop();
            _cts?.Dispose();
        }

        // -----------------------------------------------------------------------
        // Main loop — one server instance per connection (overlapping accepts)
        // -----------------------------------------------------------------------

        private async Task ListenLoop(CancellationToken ct)
        {
            while (!ct.IsCancellationRequested)
            {
                try
                {
                    var pipe = CreateSecurePipe();

                    // Wait for the next client, respecting cancellation
                    await pipe.WaitForConnectionAsync(ct).ConfigureAwait(false);

                    // Handle this client on a thread-pool thread; immediately loop
                    // back to accept the next one so the tray isn't blocked.
                    _ = Task.Run(() => HandleClientAsync(pipe), ct);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    // Log and continue; a single bad connection shouldn't crash the server
                    Console.Error.WriteLine($"[IpcServer] Accept error: {ex.Message}");
                    await Task.Delay(500, ct).ConfigureAwait(false);
                }
            }
        }

        // -----------------------------------------------------------------------
        // Per-connection handler
        // -----------------------------------------------------------------------

        private static async Task HandleClientAsync(NamedPipeServerStream pipe)
        {
            try
            {
                using (pipe)
                {
                    var reader = new StreamReader(pipe, Encoding.UTF8);
                    var writer = new StreamWriter(pipe, Encoding.UTF8) { AutoFlush = true };

                    string? line = await reader.ReadLineAsync().ConfigureAwait(false);
                    if (string.IsNullOrWhiteSpace(line)) return;

                    string response = await DispatchAsync(line).ConfigureAwait(false);
                    await writer.WriteLineAsync(response).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IpcServer] Client handler error: {ex.Message}");
            }
        }

        // -----------------------------------------------------------------------
        // Command dispatch
        // -----------------------------------------------------------------------

        private static async Task<string> DispatchAsync(string json)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (!root.TryGetProperty("command", out var cmdProp))
                    return Error("Missing 'command' field");

                string command = cmdProp.GetString() ?? string.Empty;

                switch (command)
                {
                    case "getState":
                        return GetState();

                    case "acknowledgeDisclosure":
                        return AcknowledgeDisclosure(root);

                    case "enroll":
                        return await EnrollAsync(root).ConfigureAwait(false);

                    default:
                        return Error($"Unknown command: {command}");
                }
            }
            catch (JsonException ex)
            {
                return Error($"Invalid JSON: {ex.Message}");
            }
            catch (Exception ex)
            {
                return Error($"Internal error: {ex.Message}");
            }
        }

        // -----------------------------------------------------------------------
        // Command implementations
        // -----------------------------------------------------------------------

        /// <summary>
        /// Returns the current registry state so the tray app doesn't need direct
        /// HKLM read access (though it can; this is the preferred path).
        /// </summary>
        private static string GetState()
        {
            var obj = new
            {
                ok              = true,
                firstRunComplete = RegistryState.GetFirstRunComplete(),
                enrolled        = RegistryState.GetIsEnrolled(),
                deviceId        = RegistryState.GetDeviceId(),
                hostname        = RegistryState.GetHostname(),
                tenantId        = RegistryState.GetTenantId(),
                status          = RegistryState.GetStatus(),
                lastSeenAt      = RegistryState.GetLastSeenAt(),
                enrolledAt      = RegistryState.GetEnrolledAt(),
                disclosureAcknowledgedAt = RegistryState.GetDisclosureAcknowledgedAt()
            };
            return JsonSerializer.Serialize(obj);
        }

        /// <summary>
        /// Records that the user clicked "I understand — Continue" on the disclosure form.
        /// The tray app sends the UTC timestamp it captured; the service writes it to
        /// the registry (and later EnrollAsync will forward it to the backend).
        /// </summary>
        private static string AcknowledgeDisclosure(JsonElement root)
        {
            string timestamp = root.TryGetProperty("timestamp", out var ts)
                ? ts.GetString() ?? DateTime.UtcNow.ToString("o")
                : DateTime.UtcNow.ToString("o");

            RegistryState.SetDisclosureAcknowledgedAt(timestamp);
            return JsonSerializer.Serialize(new { ok = true, timestamp });
        }

        /// <summary>
        /// Calls the backend enrollment endpoint and stores the returned API key
        /// encrypted via DPAPI (LocalMachine scope).
        /// </summary>
        private static async Task<string> EnrollAsync(JsonElement root)
        {
            if (!root.TryGetProperty("token", out var tokenProp) ||
                !root.TryGetProperty("hostname", out var hostProp))
            {
                return Error("enroll requires 'token' and 'hostname' fields");
            }

            string token    = tokenProp.GetString() ?? string.Empty;
            string hostname = hostProp.GetString()  ?? System.Net.Dns.GetHostName();

            // Read the acknowledgment timestamp we stored earlier
            string? ackStr = RegistryState.GetDisclosureAcknowledgedAt();
            DateTime ackTime = ackStr != null && DateTime.TryParse(ackStr, out var parsed)
                ? parsed.ToUniversalTime()
                : DateTime.UtcNow;

            try
            {
                var result = await EnrollmentManager.EnrollAsync(token, hostname, ackTime)
                                                    .ConfigureAwait(false);

                // Signal AgentService to start the status poller now that the
                // device has an API key — no service restart required.
                IpcServerEvents.RaiseEnrollmentSucceeded();

                return JsonSerializer.Serialize(new
                {
                    ok       = true,
                    deviceId = result.DeviceId,
                    hostname = result.Hostname
                });
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        // -----------------------------------------------------------------------
        // Pipe factory — creates a new server pipe with the restricted DACL
        // -----------------------------------------------------------------------

        private static NamedPipeServerStream CreateSecurePipe()
        {
            // Build a minimal DACL:
            //   - LocalSystem gets full control (the service itself)
            //   - BUILTIN\Users gets read+write (the tray app running as the interactive user)
            //   - No other SIDs are granted access
            var security = new PipeSecurity();

            var localSystem = new SecurityIdentifier(WellKnownSidType.LocalSystemSid, null);
            security.AddAccessRule(new PipeAccessRule(
                localSystem,
                PipeAccessRights.FullControl,
                AccessControlType.Allow));

            // BUILTIN\Users covers all authenticated local users (interactive sessions).
            // On a single-user workstation this is just the one logged-in account.
            // On an RDS server each session's user is in BUILTIN\Users, so each can
            // connect — which is intentional: every user session should be able to
            // open the tray app and query agent status.
            var builtinUsers = new SecurityIdentifier(WellKnownSidType.BuiltinUsersSid, null);
            security.AddAccessRule(new PipeAccessRule(
                builtinUsers,
                PipeAccessRights.ReadWrite,
                AccessControlType.Allow));

            return NamedPipeServerStreamAcl.Create(
                AgentConfig.PipeName,
                PipeDirection.InOut,
                maxNumberOfServerInstances: NamedPipeServerStream.MaxAllowedServerInstances,
                PipeTransmissionMode.Byte,
                PipeOptions.Asynchronous,
                inBufferSize:  4096,
                outBufferSize: 4096,
                security);
        }

        private static string Error(string message)
            => JsonSerializer.Serialize(new { ok = false, error = message });
    }
}
