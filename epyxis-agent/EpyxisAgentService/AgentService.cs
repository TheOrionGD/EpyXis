using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using EpyxisAgentService.Modules;

namespace EpyxisAgentService
{
    /// <summary>
    /// Windows Service host. Wires IpcServer and StatusPoller into the
    /// .NET Generic Host lifecycle so start/stop is handled cleanly.
    /// </summary>
    internal sealed class AgentService : BackgroundService
    {
        private readonly IpcServer         _ipcServer        = new IpcServer();
        private readonly StatusPoller        _statusPoller     = new StatusPoller();
        private readonly IntegrityMonitor    _integrityMonitor = new IntegrityMonitor();
        private readonly TrustEngine         _trustEngine      = new TrustEngine();


        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Ensure the registry root key exists (safe to call multiple times)
            EnsureRegistryRoot();

            // Start the IPC pipe server — the tray app will connect here
            _ipcServer.Start();

            // Start status polling only if the device is already enrolled.
            // If enrollment hasn't happened yet, the poller will start after the
            // tray sends a successful 'enroll' command (the IpcServer will call
            // StartPoller() once enrollment completes).
            if (RegistryState.GetIsEnrolled())
            {
                _statusPoller.Start();
                _integrityMonitor.Start();
                _trustEngine.Start();
            }

            // Register a callback so the IPC server can wake the poller and
            // integrity monitor after a successful first enrollment.
            IpcServerEvents.OnEnrollmentSucceeded += () =>
            {
                if (!stoppingToken.IsCancellationRequested)
                {
                    _statusPoller.Start();
                    _integrityMonitor.Start();
                    _trustEngine.Start();
                }
            };

            // Block until the service is stopped
            try
            {
                await Task.Delay(Timeout.Infinite, stoppingToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown path
            }

            _integrityMonitor.Stop();
            _trustEngine.Stop();
            _statusPoller.Stop();
            _ipcServer.Stop();
        }

        public override void Dispose()
        {
            _integrityMonitor.Dispose();
            _trustEngine.Dispose();
            _ipcServer.Dispose();
            _statusPoller.Dispose();
            base.Dispose();
        }

        private static void EnsureRegistryRoot()
        {
            // CreateSubKey is idempotent — safe to call on every startup
            using var _ = Microsoft.Win32.Registry.LocalMachine
                .CreateSubKey(AgentConfig.RegistryRoot, writable: true);
        }
    }

    /// <summary>
    /// Simple event bus for intra-service signals that don't need the full
    /// complexity of a message broker.
    /// </summary>
    internal static class IpcServerEvents
    {
        public static event Action? OnEnrollmentSucceeded;
        internal static void RaiseEnrollmentSucceeded() => OnEnrollmentSucceeded?.Invoke();
    }
}
