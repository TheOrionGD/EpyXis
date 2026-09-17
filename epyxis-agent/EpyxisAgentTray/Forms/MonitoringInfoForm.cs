using System.Drawing;
using System.Windows.Forms;

namespace EpyxisAgentTray.Forms
{
    /// <summary>
    /// "What Epyxis monitors" — always reachable from the tray right-click menu.
    /// Contains the exact same disclosure content as <see cref="FirstRunNoticeForm"/>
    /// but without any acknowledgment mechanics — this is purely informational.
    ///
    /// The user can close this with the standard X button or Escape at any time.
    /// </summary>
    internal sealed class MonitoringInfoForm : Form
    {
        public MonitoringInfoForm()
        {
            BuildUi();
        }

        private void BuildUi()
        {
            Text            = "Epyxis — What is Monitored";
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox     = false;
            MinimizeBox     = false;
            Width           = 620;
            Height          = 560;
            StartPosition   = FormStartPosition.CenterScreen;
            BackColor       = Color.FromArgb(20, 20, 32);

            int pad = 28;
            int y   = pad;

            var heading = new Label
            {
                Text      = "What Epyxis monitors on this device",
                Font      = new Font("Segoe UI", 14f, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize  = true,
                Left      = pad,
                Top       = y
            };
            Controls.Add(heading);
            y += heading.PreferredHeight + 6;

            var sub = new Label
            {
                Text      = "This information is always available from the Epyxis tray icon.",
                Font      = new Font("Segoe UI", 8.5f, FontStyle.Italic),
                ForeColor = Color.FromArgb(140, 140, 180),
                AutoSize  = true,
                Left      = pad,
                Top       = y
            };
            Controls.Add(sub);
            y += sub.PreferredHeight + 14;

            var divider = new Panel
            {
                BackColor = Color.FromArgb(50, 50, 80),
                Height    = 1,
                Width     = Width - pad * 2 - 16,
                Left      = pad,
                Top       = y
            };
            Controls.Add(divider);
            y += divider.Height + 16;

            // Scrollable body
            var scroll = new Panel
            {
                AutoScroll = true,
                Left       = pad,
                Top        = y,
                Width      = Width - pad * 2 - 16,
                Height     = Height - y - 80,
                BackColor  = Color.Transparent
            };
            Controls.Add(scroll);

            int sy = 0;

            AddSection(scroll, "What IS monitored:", Color.FromArgb(100, 210, 130), ref sy);
            AddBullets(scroll,
                "• Process activity (running applications and services)\n" +
                "• Connected USB devices (vendor and product IDs only)\n" +
                "• Installed application trust status (code-signing verification)\n" +
                "• Aggregate keyboard activity count and application-focus timing\n" +
                "• Security-relevant configuration changes (startup entries, services)",
                scroll.Width, ref sy);

            sy += 12;
            AddSection(scroll, "What is NEVER captured:", Color.FromArgb(255, 120, 120), ref sy);
            AddBullets(scroll,
                "• Passwords or credentials of any kind\n" +
                "• The content of anything you type (keystroke content or input values)\n" +
                "• Search history or browser activity\n" +
                "• Clipboard contents\n" +
                "• Chat messages or email content\n" +
                "• Screen recordings or screenshots",
                scroll.Width, ref sy);

            sy += 12;
            AddSection(scroll, "Administered by:", Color.FromArgb(180, 180, 255), ref sy);
            AddBullets(scroll,
                "This device's monitoring is configured and administered by your\n" +
                "organization's IT team. Epyxis does not independently access your data.\n" +
                "Contact your IT administrator for questions about scope or policy.",
                scroll.Width, ref sy);

            var closeBtn = new Button
            {
                Text      = "Close",
                Width     = 100,
                Height    = 36,
                Left      = (Width - 100) / 2 - 8,
                Top       = Height - 68,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(50, 50, 80),
                ForeColor = Color.White,
                Font      = new Font("Segoe UI", 9f),
                Cursor    = Cursors.Hand
            };
            closeBtn.FlatAppearance.BorderSize = 0;
            closeBtn.Click += (_, _) => Close();
            Controls.Add(closeBtn);
            CancelButton = closeBtn;
        }

        private static void AddSection(Panel parent, string text, Color color, ref int y)
        {
            var lbl = new Label
            {
                Text      = text,
                Font      = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                ForeColor = color,
                AutoSize  = true,
                Left      = 0,
                Top       = y
            };
            parent.Controls.Add(lbl);
            y += lbl.PreferredHeight + 4;
        }

        private static void AddBullets(Panel parent, string text, int width, ref int y)
        {
            var lbl = new Label
            {
                Text      = text,
                Font      = new Font("Segoe UI", 9f),
                ForeColor = Color.FromArgb(195, 195, 215),
                Left      = 8,
                Top       = y,
                Width     = width - 8,
                AutoSize  = false
            };
            lbl.Size = new Size(width - 8, lbl.GetPreferredSize(new Size(width - 8, 0)).Height);
            parent.Controls.Add(lbl);
            y += lbl.Height + 2;
        }
    }
}
