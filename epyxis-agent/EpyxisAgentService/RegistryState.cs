using Microsoft.Win32;

namespace EpyxisAgentService
{
    /// <summary>
    /// Reads and writes agent state to HKLM\SOFTWARE\Epyxis\Agent.
    /// All writes are performed by the Windows Service (running as LocalSystem),
    /// which has the required elevation to write to HKLM.
    /// The Tray app reads these values but never writes directly — it always
    /// sends commands through the named pipe so the service does the write.
    /// </summary>
    internal static class RegistryState
    {
        // --- Value names ---
        private const string KeyFirstRunComplete         = "FirstRunComplete";
        private const string KeyDisclosureAcknowledgedAt = "DisclosureAcknowledgedAt";
        private const string KeyEnrolledAt               = "EnrolledAt";
        private const string KeyDeviceId                 = "DeviceId";
        private const string KeyHostname                 = "Hostname";
        private const string KeyTenantId                 = "TenantId";
        private const string KeyStatus                   = "Status";
        private const string KeyLastSeenAt               = "LastSeenAt";
        // ApiKeyBlob is REG_BINARY and handled separately in EnrollmentManager

        // --- Read helpers ---

        public static bool GetFirstRunComplete()
        {
            using var key = OpenRead();
            return key != null && (int)(key.GetValue(KeyFirstRunComplete, 0)!) == 1;
        }

        public static bool GetIsEnrolled()
        {
            using var key = OpenRead();
            return key != null && !string.IsNullOrEmpty((string?)key.GetValue(KeyDeviceId, null));
        }

        public static string? GetDeviceId()     => ReadString(KeyDeviceId);
        public static string? GetHostname()     => ReadString(KeyHostname);
        public static string? GetTenantId()     => ReadString(KeyTenantId);
        public static string? GetStatus()       => ReadString(KeyStatus);
        public static string? GetLastSeenAt()   => ReadString(KeyLastSeenAt);
        public static string? GetEnrolledAt()   => ReadString(KeyEnrolledAt);
        public static string? GetDisclosureAcknowledgedAt() => ReadString(KeyDisclosureAcknowledgedAt);

        // --- Write helpers (called only by the service) ---

        public static void SetFirstRunComplete(bool value)
            => Write(KeyFirstRunComplete, value ? 1 : 0, RegistryValueKind.DWord);

        public static void SetDisclosureAcknowledgedAt(string iso8601)
            => Write(KeyDisclosureAcknowledgedAt, iso8601, RegistryValueKind.String);

        public static void SetEnrollmentResult(string deviceId, string hostname, string tenantId, string enrolledAt)
        {
            using var key = OpenWrite();
            if (key == null) return;
            key.SetValue(KeyDeviceId,    deviceId,    RegistryValueKind.String);
            key.SetValue(KeyHostname,    hostname,    RegistryValueKind.String);
            key.SetValue(KeyTenantId,    tenantId,    RegistryValueKind.String);
            key.SetValue(KeyEnrolledAt,  enrolledAt,  RegistryValueKind.String);
            key.SetValue(KeyStatus,      "active",    RegistryValueKind.String);
        }

        public static void SetStatus(string status)
            => Write(KeyStatus, status, RegistryValueKind.String);

        public static void SetLastSeenAt(string iso8601)
            => Write(KeyLastSeenAt, iso8601, RegistryValueKind.String);

        // --- Private helpers ---

        private static string? ReadString(string valueName)
        {
            using var key = OpenRead();
            return (string?)key?.GetValue(valueName, null);
        }

        private static void Write(string valueName, object value, RegistryValueKind kind)
        {
            using var key = OpenWrite();
            key?.SetValue(valueName, value, kind);
        }

        private static RegistryKey? OpenRead()
            => Registry.LocalMachine.OpenSubKey(AgentConfig.RegistryRoot, writable: false);

        private static RegistryKey? OpenWrite()
            => Registry.LocalMachine.CreateSubKey(AgentConfig.RegistryRoot, writable: true);
    }
}
