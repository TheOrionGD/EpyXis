using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using EpyxisAgentTray.Forms;

namespace EpyxisAgentTray
{
    /// <summary>
    /// Application context — owns the <see cref="NotifyIcon"/> for the lifetime of
    /// the process.  This is the object that keeps the message loop alive after
    /// the first-run forms have been closed.
    ///
    /// Tray icon right-click menu:
    ///   • What Epyxis monitors         → MonitoringInfoForm
    ///   • Agent status               → AgentStatusForm
    ///   • Contact your IT administrator → simple info dialog
    ///   ─────────────────────────────
    ///   (No pause/disable option — that belongs to the tenant admin via the dashboard.)
    /// </summary>
    internal sealed class TrayApp : ApplicationContext
    {
        private readonly NotifyIcon _icon;

        public TrayApp()
        {
            _icon = new NotifyIcon
            {
                Icon    = LoadIcon(),
                Text    = "Epyxis Endpoint Agent — Active",
                Visible = true,
            };

            _icon.ContextMenuStrip = BuildContextMenu();

            // Double-click also opens monitoring info (approachable, not threatening)
            _icon.DoubleClick += (_, _) => OpenMonitoringInfo();
        }

        // -----------------------------------------------------------------------
        // Context menu
        // -----------------------------------------------------------------------

        private ContextMenuStrip BuildContextMenu()
        {
            var menu = new ContextMenuStrip();
            menu.BackColor = Color.FromArgb(22, 22, 34);
            menu.ForeColor = Color.White;
            menu.RenderMode = ToolStripRenderMode.System;

            Add(menu, "What Epyxis monitors",            OpenMonitoringInfo);
            Add(menu, "Agent status",                  OpenAgentStatus);
            Add(menu, "Contact your IT administrator", OpenItContact);

            // No "Pause monitoring" — per spec, that's a tenant-admin action via dashboard
            return menu;
        }

        private static void Add(ContextMenuStrip menu, string text, Action handler)
        {
            var item = new ToolStripMenuItem(text)
            {
                Font      = new Font("Segoe UI", 9.5f),
            };
            item.Click += (_, _) => handler();
            menu.Items.Add(item);
        }

        // -----------------------------------------------------------------------
        // Menu actions
        // -----------------------------------------------------------------------

        private static void OpenMonitoringInfo()
        {
            using var f = new MonitoringInfoForm();
            f.ShowDialog();
        }

        private static void OpenAgentStatus()
        {
            using var f = new AgentStatusForm();
            f.ShowDialog();
        }

        private static void OpenItContact()
        {
            // The IT contact message is tenant-defined; Epyxis doesn't inject its own
            // support channel here.  Show the tenant ID so the user can reference it.
            var tenantId = ReadRegistryTenantId();
            var msg = string.IsNullOrEmpty(tenantId)
                ? "Contact your organization's IT administrator for support.\n\n" +
                  "Epyxis does not provide end-user support directly — " +
                  "monitoring policy is managed by your IT team."
                : $"Contact your organization's IT administrator for support.\n\n" +
                  $"Device reference: Tenant {tenantId}\n\n" +
                  "Epyxis does not provide end-user support directly — " +
                  "monitoring policy is managed by your IT team.";

            MessageBox.Show(msg, "Contact IT Administrator",
                MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        // -----------------------------------------------------------------------
        // Icon loading
        // -----------------------------------------------------------------------

        private static Icon LoadIcon()
        {
            // Try to load the bundled EpyxisIcon.ico from the binary directory first.
            // Falls back to a system shield icon so the tray is never empty.
            try
            {
                string? dir  = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
                string  path = Path.Combine(dir ?? ".", "Resources", "EpyxisIcon.ico");
                if (File.Exists(path))
                    return new Icon(path, 16, 16);
            }
            catch { /* fall through */ }

            return SystemIcons.Shield;
        }

        // -----------------------------------------------------------------------
        // Helpers
        // -----------------------------------------------------------------------

        private static string? ReadRegistryTenantId()
        {
            try
            {
                using var key = Microsoft.Win32.Registry.LocalMachine
                    .OpenSubKey(@"SOFTWARE\Epyxis\Agent", writable: false);
                return (string?)key?.GetValue("TenantId", null);
            }
            catch { return null; }
        }

        // -----------------------------------------------------------------------
        // Cleanup
        // -----------------------------------------------------------------------

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _icon.Visible = false;
                _icon.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
