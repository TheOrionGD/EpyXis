namespace EpyxisAgentService
{
    /// <summary>
    /// Central configuration constants for the agent service.
    /// In a production deployment these could be read from a machine-scoped
    /// config file (not roaming — lives next to the service binary), but
    /// constants are sufficient until Module 1 adds more moving parts.
    /// </summary>
    internal static class AgentConfig
    {
        /// <summary>
        /// Base URL of the Epyxis backend. Update this before packaging for prod.
        /// No trailing slash.
        /// </summary>
        public const string BackendBaseUrl = "http://localhost:5000";

        /// <summary>
        /// The named pipe that the Tray app connects to.
        /// Full path: \\.\pipe\EpyxisAgentIPC
        /// </summary>
        public const string PipeName = "EpyxisAgentIPC";

        /// <summary>
        /// How often (in seconds) the StatusPoller calls GET /api/devices/me/status.
        /// The spec says "one check-in cycle" for revocation to surface; 60 s is the
        /// configured window.
        /// </summary>
        public const int StatusPollIntervalSeconds = 60;

        /// <summary>
        /// Registry root for all agent state.
        /// Written as LocalMachine so the service (SYSTEM) can reach it, and
        /// the tray app (logged-in user) can read it.
        /// </summary>
        public const string RegistryRoot = @"SOFTWARE\Epyxis\Agent";
    }
}
