namespace EpyxisAgentService.Modules
{
    /// <summary>
    /// Lightweight process descriptor passed from <see cref="IntegrityMonitor"/>
    /// to <see cref="TrustEngine"/> via the <c>OnNewExecutable</c> in-process event.
    ///
    /// Carries only what TrustEngine needs — no WMI objects, no handles.
    /// </summary>
    internal sealed class ProcessInfo
    {
        public int     Pid      { get; init; }
        public string? Name     { get; init; }
        public string? ExecPath { get; init; }
    }
}
