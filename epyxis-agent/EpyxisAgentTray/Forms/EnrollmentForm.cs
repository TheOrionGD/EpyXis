using System;
using System.Drawing;
using System.Net;
using System.Windows.Forms;

namespace EpyxisAgentTray.Forms
{
    /// <summary>
    /// Step 2 of the first-run flow: the IT admin pastes the enrollment token
    /// generated from the tenant dashboard and confirms (or edits) the hostname.
    ///
    /// Errors are surfaced inline — no modal dialogs, no vague messages.
    /// On success, the form closes and TrayApp takes over with SuccessForm.
    /// </summary>
    internal sealed class EnrollmentForm : Form
    {
        // Populated on success for the caller to inspect
        public string EnrolledDeviceId { get; private set; } = string.Empty;
        public string EnrolledHostname { get; private set; } = string.Empty;

        private TextBox _tokenBox  = null!;
        private TextBox _hostBox   = null!;
        private Button  _enrollBtn = null!;
        private Label   _errorLbl  = null!;

        public EnrollmentForm()
        {
            BuildUi();
        }

        private void BuildUi()
        {
            Text            = "Epyxis — Enroll this Device";
            FormBorderStyle = FormBorderStyle.FixedDialog;
            ControlBox      = true;
            MaximizeBox     = false;
            MinimizeBox     = false;
            Width           = 540;
            Height          = 400;
            StartPosition   = FormStartPosition.CenterScreen;
            TopMost         = true;
            BackColor       = Color.FromArgb(20, 20, 32);

            int pad = 28;
            int y   = pad;

            AddLabel("Enroll this device", 15f, FontStyle.Bold, Color.White, pad, ref y, 340);
            AddLabel(
                "Paste the enrollment token generated from the Epyxis tenant dashboard.\n" +
                "This registers the device and activates monitoring.",
                9f, FontStyle.Regular, Color.FromArgb(180, 180, 200), pad, ref y, 480);

            y += 8;
            AddLabel("Enrollment Token", 8.5f, FontStyle.Bold,
                Color.FromArgb(150, 160, 220), pad, ref y, 200);

            _tokenBox = new TextBox
            {
                Left        = pad,
                Top         = y,
                Width       = Width - pad * 2 - 16,
                Height      = 30,
                Font        = new Font("Consolas", 9.5f),
                BackColor   = Color.FromArgb(32, 32, 50),
                ForeColor   = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                PlaceholderText = "Paste token here…"
            };
            Controls.Add(_tokenBox);
            y += _tokenBox.Height + 16;

            AddLabel("Device Label / Hostname", 8.5f, FontStyle.Bold,
                Color.FromArgb(150, 160, 220), pad, ref y, 250);

            _hostBox = new TextBox
            {
                Left        = pad,
                Top         = y,
                Width       = Width - pad * 2 - 16,
                Height      = 30,
                Font        = new Font("Segoe UI", 9.5f),
                BackColor   = Color.FromArgb(32, 32, 50),
                ForeColor   = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Text        = Dns.GetHostName()  // Pre-filled, editable
            };
            Controls.Add(_hostBox);
            y += _hostBox.Height + 20;

            _errorLbl = new Label
            {
                Left      = pad,
                Top       = y,
                Width     = Width - pad * 2 - 16,
                Height    = 36,
                ForeColor = Color.FromArgb(255, 100, 100),
                Font      = new Font("Segoe UI", 8.5f),
                Text      = string.Empty,
                AutoSize  = false
            };
            Controls.Add(_errorLbl);
            y += _errorLbl.Height + 4;

            _enrollBtn = new Button
            {
                Text      = "Enroll this device",
                Left      = pad,
                Top       = y,
                Width     = 180,
                Height    = 38,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(70, 90, 210),
                ForeColor = Color.White,
                Font      = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Cursor    = Cursors.Hand
            };
            _enrollBtn.FlatAppearance.BorderSize = 0;
            _enrollBtn.Click += EnrollBtn_Click;
            Controls.Add(_enrollBtn);
            AcceptButton = _enrollBtn;
        }

        private async void EnrollBtn_Click(object? sender, EventArgs e)
        {
            _errorLbl.Text = string.Empty;
            string token    = _tokenBox.Text.Trim();
            string hostname = _hostBox.Text.Trim();

            if (string.IsNullOrEmpty(token))
            {
                _errorLbl.Text = "Please paste an enrollment token.";
                return;
            }
            if (string.IsNullOrEmpty(hostname))
            {
                _errorLbl.Text = "Device label cannot be empty.";
                return;
            }

            _enrollBtn.Enabled = false;
            _enrollBtn.Text    = "Enrolling…";

            var result = await IpcClient.EnrollAsync(token, hostname);

            if (result == null || !result.Ok)
            {
                _errorLbl.Text = result?.Error ?? "Could not reach the Epyxis service.";
                _enrollBtn.Enabled = true;
                _enrollBtn.Text    = "Enroll this device";
                return;
            }

            EnrolledDeviceId = result.DeviceId;
            EnrolledHostname = result.Hostname;
            DialogResult     = DialogResult.OK;
            Close();
        }

        // -----------------------------------------------------------------------

        private void AddLabel(string text, float size, FontStyle style, Color color,
                              int left, ref int y, int width)
        {
            var lbl = new Label
            {
                Text      = text,
                Font      = new Font("Segoe UI", size, style),
                ForeColor = color,
                Left      = left,
                Top       = y,
                Width     = width,
                Height    = 0,
                AutoSize  = false
            };
            lbl.Size = new Size(width, lbl.GetPreferredSize(new Size(width, 0)).Height);
            Controls.Add(lbl);
            y += lbl.Height + 6;
        }
    }
}
