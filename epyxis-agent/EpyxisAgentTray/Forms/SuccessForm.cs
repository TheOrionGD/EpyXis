using System;
using System.Drawing;
using System.Windows.Forms;

namespace EpyxisAgentTray.Forms
{
    /// <summary>
    /// Brief post-enrollment confirmation shown for 3 seconds, then
    /// auto-closes so the tray app becomes the only UI surface.
    /// </summary>
    internal sealed class SuccessForm : Form
    {
        private readonly Timer _closeTimer;

        public SuccessForm(string hostname)
        {
            Text            = "Epyxis — Enrollment Complete";
            FormBorderStyle = FormBorderStyle.FixedDialog;
            ControlBox      = false;
            MaximizeBox     = false;
            MinimizeBox     = false;
            Width           = 420;
            Height          = 200;
            StartPosition   = FormStartPosition.CenterScreen;
            TopMost         = true;
            BackColor       = Color.FromArgb(18, 28, 18);

            int pad = 28;
            int y   = pad;

            var icon = new Label
            {
                Text      = "✓",
                Font      = new Font("Segoe UI", 28f, FontStyle.Bold),
                ForeColor = Color.FromArgb(80, 200, 120),
                AutoSize  = true,
                Left      = pad,
                Top       = y
            };
            Controls.Add(icon);

            var heading = new Label
            {
                Text      = "Device enrolled successfully.",
                Font      = new Font("Segoe UI", 12f, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize  = true,
                Left      = pad + 50,
                Top       = y + 4
            };
            Controls.Add(heading);
            y += 60;

            var sub = new Label
            {
                Text      = $"Epyxis is now active on {hostname}.\nThis window will close automatically.",
                Font      = new Font("Segoe UI", 9f),
                ForeColor = Color.FromArgb(160, 180, 160),
                AutoSize  = true,
                Left      = pad,
                Top       = y
            };
            Controls.Add(sub);

            // Auto-close after 3 seconds
            _closeTimer = new Timer { Interval = 3000 };
            _closeTimer.Tick += (_, _) =>
            {
                _closeTimer.Stop();
                Close();
            };
        }

        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            _closeTimer.Start();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing) _closeTimer.Dispose();
            base.Dispose(disposing);
        }
    }
}
