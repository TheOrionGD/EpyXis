using System;
using System.Windows.Forms;
using EpyxisAgentTray.Forms;

namespace EpyxisAgentTray
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // ------------------------------------------------------------------
            // Check registry: has the user acknowledged the disclosure notice?
            // ------------------------------------------------------------------
            bool firstRunComplete = ReadFirstRunComplete();

            if (!firstRunComplete)
            {
                // Show the mandatory disclosure notice.
                // This form cannot be dismissed without clicking "I understand."
                using var notice = new FirstRunNoticeForm();
                var noticeResult = notice.ShowDialog();

                if (noticeResult != DialogResult.OK)
                {
                    // The user never acknowledged (shouldn't happen — the only
                    // close path sets OK — but guard defensively).
                    Application.Exit();
                    return;
                }

                // Proceed immediately to enrollment
                using var enroll = new EnrollmentForm();
                var enrollResult = enroll.ShowDialog();

                if (enrollResult == DialogResult.OK)
                {
                    // Show brief success confirmation, then fall through to tray
                    using var success = new SuccessForm(enroll.EnrolledHostname);
                    success.ShowDialog();
                }
                // If the user closed enrollment without completing, the tray still
                // runs — the enrollment form is accessible again via the tray context
                // menu if needed (or the agent will prompt again on next login until
                // FirstRunComplete is set by the service).
            }

            // ------------------------------------------------------------------
            // Run the persistent tray app
            // ------------------------------------------------------------------
            Application.Run(new TrayApp());
        }

        // -----------------------------------------------------------------------
        // Registry helper — read-only, tray app side.
        // The service owns writes; we just read.
        // -----------------------------------------------------------------------

        private static bool ReadFirstRunComplete()
        {
            try
            {
                using var key = Microsoft.Win32.Registry.LocalMachine
                    .OpenSubKey(@"SOFTWARE\Epyxis\Agent", writable: false);
                if (key == null) return false;
                return (int)(key.GetValue("FirstRunComplete", 0) ?? 0) == 1;
            }
            catch
            {
                // If we can't read the registry at all (e.g. service hasn't created
                // the key yet), treat as first run so the notice is shown.
                return false;
            }
        }
    }
}
