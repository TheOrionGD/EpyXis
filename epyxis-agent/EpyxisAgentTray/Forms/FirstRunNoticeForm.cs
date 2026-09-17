using System;
using System.Drawing;
using System.Windows.Forms;

namespace EpyxisAgentTray.Forms
{
    /// <summary>
    /// Mandatory full-screen disclosure notice shown on first run.
    ///
    /// Bypass-prevention measures (per spec):
    ///   • ControlBox = false          — no X button in the title bar
    ///   • FormBorderStyle = None      — no border or system menu
    ///   • WindowState = Maximized     — fills the primary screen
    ///   • TopMost = true              — always in front
    ///   • KeyPreview + OnKeyDown      — Escape and Alt+F4 are suppressed
    ///   • No CancelButton             — Enter won't dismiss unless focused on "I understand"
    ///   • Click-outside has no effect — there is no "outside"; the form IS the screen
    ///
    /// The only exit paths are:
    ///   1. User clicks "I understand — Continue" → proceeds to EnrollmentForm.
    ///   2. (No other exit path is provided.)
    /// </summary>
    internal sealed class FirstRunNoticeForm : Form
    {
        public DateTime AcknowledgedAtUtc { get; private set; }

        private Button _continueBtn = null!;

        public FirstRunNoticeForm()
        {
            BuildUi();
        }

        private void BuildUi()
        {
            // ------------------------------------------------------------------
            // Window chrome — make it impossible to dismiss accidentally
            // ------------------------------------------------------------------
            Text                = "Epyxis — Monitoring Disclosure";
            FormBorderStyle     = FormBorderStyle.None;   // No title bar at all
            ControlBox          = false;                  // Redundant with None, belt-and-suspenders
            WindowState         = FormWindowState.Maximized;
            TopMost             = true;
            ShowInTaskbar       = false;                  // Can't be clicked away via taskbar
            KeyPreview          = true;                   // Intercept keys before controls do
            BackColor           = Color.FromArgb(15, 15, 25);

            // ------------------------------------------------------------------
            // Layout — outer panel centered on screen
            // ------------------------------------------------------------------
            var outer = new Panel
            {
                Dock      = DockStyle.Fill,
                BackColor = Color.Transparent
            };

            var card = new Panel
            {
                Width     = 720,
                Height    = 640,
                BackColor = Color.FromArgb(24, 24, 38),
                // Centered programmatically in Resize handler
            };
            card.Paint += (_, e) =>
            {
                // Subtle rounded-rect border
                using var pen = new Pen(Color.FromArgb(80, 100, 200), 1.5f);
                e.Graphics.DrawRectangle(pen, 0, 0, card.Width - 1, card.Height - 1);
            };

            outer.Controls.Add(card);
            Controls.Add(outer);

            // Keep card centered on resize (e.g. display scaling changes)
            outer.Resize += (_, _) =>
            {
                card.Left = (outer.Width  - card.Width)  / 2;
                card.Top  = (outer.Height - card.Height) / 2;
            };

            // ------------------------------------------------------------------
            // Content inside the card
            // ------------------------------------------------------------------
            int pad = 36;
            int y   = pad;

            // Epyxis wordmark / badge
            var badge = new Label
            {
                Text      = "EPYXIS",
                Font      = new Font("Segoe UI", 11f, FontStyle.Bold),
                ForeColor = Color.FromArgb(110, 130, 255),
                AutoSize  = true,
                Left      = pad,
                Top       = y
            };
            card.Controls.Add(badge);
            y += badge.PreferredHeight + 10;

            // Heading
            var heading = new Label
            {
                Text      = "Epyxis is being installed on this device\nby your organization.",
                Font      = new Font("Segoe UI", 17f, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize  = false,
                Width     = card.Width - pad * 2,
                Height    = 70,
                Left      = pad,
                Top       = y
            };
            card.Controls.Add(heading);
            y += heading.Height + 16;

            // Divider
            var divider = new Panel
            {
                BackColor = Color.FromArgb(60, 60, 90),
                Height    = 1,
                Width     = card.Width - pad * 2,
                Left      = pad,
                Top       = y
            };
            card.Controls.Add(divider);
            y += divider.Height + 20;

            // Scroll area for the body text
            var scroll = new ScrollableControl
            {
                AutoScroll = true,
                Left       = pad,
                Top        = y,
                Width      = card.Width - pad * 2,
                Height     = card.Height - y - 80,
                BackColor  = Color.Transparent
            };
            card.Controls.Add(scroll);

            int sy = 0;

            scroll.Controls.Add(SectionLabel("What IS monitored:", Color.FromArgb(120, 220, 140), ref sy));
            scroll.Controls.Add(BulletBlock(
                "• Process activity (running applications and services)\n" +
                "• Connected USB devices (vendor and product IDs only)\n" +
                "• Installed application trust status (code-signing verification)\n" +
                "• Aggregate keyboard activity count and application-focus timing\n" +
                "• Security-relevant configuration changes (startup entries, services)",
                ref sy));

            sy += 12;
            scroll.Controls.Add(SectionLabel("What is NEVER captured:", Color.FromArgb(255, 130, 130), ref sy));
            scroll.Controls.Add(BulletBlock(
                "• Passwords or credentials of any kind\n" +
                "• The content of anything you type (keystroke content or input values)\n" +
                "• Search history or browser activity\n" +
                "• Clipboard contents\n" +
                "• Chat messages or email content\n" +
                "• Screen recordings or screenshots",
                ref sy));

            sy += 12;
            scroll.Controls.Add(SectionLabel("Ongoing visibility:", Color.FromArgb(180, 180, 255), ref sy));
            scroll.Controls.Add(BulletBlock(
                "A persistent system-tray icon will remain visible at all times while the\n" +
                "agent is running. You can access this disclosure notice, agent status, and\n" +
                "your IT contact at any time from the tray icon's right-click menu.\n\n" +
                "This monitoring is administered by your organization's IT team, not by Epyxis\n" +
                "directly. Questions about scope or policy should go to your IT administrator.",
                ref sy));

            // "I understand" button — only exit
            _continueBtn = new Button
            {
                Text      = "I understand — Continue",
                Width     = 240,
                Height    = 44,
                Left      = (card.Width - 240) / 2,
                Top       = card.Height - 64,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(80, 100, 220),
                ForeColor = Color.White,
                Font      = new Font("Segoe UI", 10f, FontStyle.Bold),
                Cursor    = Cursors.Hand
            };
            _continueBtn.FlatAppearance.BorderSize = 0;
            _continueBtn.Click += ContinueBtn_Click;
            card.Controls.Add(_continueBtn);

            AcceptButton = _continueBtn;
            // No CancelButton — escape is blocked in OnKeyDown
        }

        // ------------------------------------------------------------------
        // Key interception — block all keyboard escapes
        // ------------------------------------------------------------------

        protected override void OnKeyDown(KeyEventArgs e)
        {
            // Block Escape, Alt+F4, and any other dismiss-by-keyboard attempt
            if (e.KeyCode == Keys.Escape ||
               (e.Alt && e.KeyCode == Keys.F4))
            {
                e.Handled    = true;
                e.SuppressKeyPress = true;
                return;
            }
            base.OnKeyDown(e);
        }

        // Prevent the OS from closing the form via Alt+F4 at the WndProc level
        protected override void WndProc(ref Message m)
        {
            const int WM_SYSCOMMAND = 0x0112;
            const int SC_CLOSE      = 0xF060;

            if (m.Msg == WM_SYSCOMMAND && (m.WParam.ToInt32() & 0xFFF0) == SC_CLOSE)
            {
                // Swallow the close syscommand entirely
                return;
            }
            base.WndProc(ref m);
        }

        // ------------------------------------------------------------------
        // Acknowledge handler
        // ------------------------------------------------------------------

        private async void ContinueBtn_Click(object? sender, EventArgs e)
        {
            _continueBtn.Enabled = false;
            _continueBtn.Text    = "Please wait…";

            AcknowledgedAtUtc = DateTime.UtcNow;

            // Tell the service to record the timestamp (it will write to HKLM)
            var result = await IpcClient.AcknowledgeDisclosureAsync(AcknowledgedAtUtc);

            if (result == null || !result.Ok)
            {
                MessageBox.Show(
                    "Could not reach the Epyxis service. Please ensure EpyxisAgentService is running.",
                    "Epyxis — Service Unavailable",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                _continueBtn.Enabled = true;
                _continueBtn.Text    = "I understand — Continue";
                return;
            }

            // Proceed to enrollment
            DialogResult = DialogResult.OK;
            Close();
        }

        // ------------------------------------------------------------------
        // UI helpers
        // ------------------------------------------------------------------

        private static Label SectionLabel(string text, Color color, ref int y)
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
            y += lbl.PreferredHeight + 6;
            return lbl;
        }

        private static Label BulletBlock(string text, ref int y)
        {
            var lbl = new Label
            {
                Text      = text,
                Font      = new Font("Segoe UI", 9f),
                ForeColor = Color.FromArgb(200, 200, 215),
                AutoSize  = false,
                Width     = 648,   // matches scroll area width minus a little padding
                Height    = 0,
                Left      = 0,
                Top       = y
            };
            // AutoSize height after setting width
            lbl.Size = new Size(648, lbl.GetPreferredSize(new Size(648, 0)).Height);
            y += lbl.Height + 4;
            return lbl;
        }
    }
}
