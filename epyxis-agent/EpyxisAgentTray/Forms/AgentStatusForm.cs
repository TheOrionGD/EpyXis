using System;
using System.Drawing;
using System.Windows.Forms;

namespace EpyxisAgentTray.Forms
{
    /// <summary>
    /// "Agent status" tray menu item → opens this form.
    /// Shows the current enrollment state, last check-in time, and device name
    /// as registered.  Fetches state via IPC so it always reflects what the
    /// service has most recently written to the registry.
    /// </summary>
    internal sealed class AgentStatusForm : Form
    {
        public AgentStatusForm()
        {
            BuildUi();
        }

        private async void BuildUi()
        {
            Text            = "Epyxis — Agent Status";
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox     = false;
            MinimizeBox     = false;
            Width           = 480;
            Height          = 380;
            StartPosition   = FormStartPosition.CenterScreen;
            BackColor       = Color.FromArgb(18, 18, 28);

            int pad = 28;
            int y   = pad;

            var heading = new Label
            {
                Text      = "Agent Status",
                Font      = new Font("Segoe UI", 14f, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize  = true,
                Left      = pad,
                Top       = y
            };
            Controls.Add(heading);
            y += heading.PreferredHeight + 16;

            // Show a loading indicator while we fetch state
            var loadingLbl = new Label
            {
                Text      = "Fetching status…",
                Font      = new Font("Segoe UI", 9f, FontStyle.Italic),
                ForeColor = Color.FromArgb(140, 140, 180),
                AutoSize  = true,
                Left      = pad,
                Top       = y
            };
            Controls.Add(loadingLbl);

            var state = await IpcClient.GetStateAsync();

            Controls.Remove(loadingLbl);

            if (state == null || !state.Ok)
            {
                AddRow("Error", state?.Error ?? "Could not reach EpyxisAgentService.",
                    Color.FromArgb(255, 100, 100), pad, ref y);
            }
            else if (!state.Enrolled)
            {
                AddRow("Enrollment status", "Not enrolled", Color.FromArgb(255, 160, 60), pad, ref y);
                AddRow("", "Open the tray menu and select 'Enroll device' to begin.", 
                    Color.FromArgb(150, 150, 180), pad, ref y);
            }
            else
            {
                // Status color
                Color statusColor = state.Status?.ToLowerInvariant() switch
                {
                    "active"  => Color.FromArgb(80, 210, 120),
                    "revoked" => Color.FromArgb(255, 90, 90),
                    _         => Color.FromArgb(200, 200, 200)
                };

                AddRow("Enrollment status",
                    state.Status?.ToUpperInvariant() ?? "UNKNOWN",
                    statusColor, pad, ref y);
                AddRow("Device name",  state.Hostname,  Color.White, pad, ref y);
                AddRow("Device ID",    state.DeviceId,  Color.FromArgb(160, 160, 200), pad, ref y);
                AddRow("Tenant ID",    state.TenantId,  Color.FromArgb(160, 160, 200), pad, ref y);
                AddRow("Enrolled at",  FormatTime(state.EnrolledAt),  Color.FromArgb(180, 180, 200), pad, ref y);
                AddRow("Last check-in", FormatTime(state.LastSeenAt), Color.FromArgb(180, 180, 200), pad, ref y);
                AddRow("Disclosure acknowledged", FormatTime(state.DisclosureAcknowledgedAt),
                    Color.FromArgb(160, 180, 160), pad, ref y);

                if (state.Status?.ToLowerInvariant() == "revoked")
                {
                    y += 8;
                    var revokedNote = new Label
                    {
                        Text      = "⚠  This device has been revoked by your IT administrator.\n" +
                                    "Contact your IT team to re-enroll if this is unexpected.",
                        Font      = new Font("Segoe UI", 8.5f),
                        ForeColor = Color.FromArgb(255, 130, 80),
                        Left      = pad,
                        Top       = y,
                        Width     = Width - pad * 2 - 16,
                        AutoSize  = false
                    };
                    revokedNote.Size = new Size(
                        Width - pad * 2 - 16,
                        revokedNote.GetPreferredSize(new Size(Width - pad * 2 - 16, 0)).Height);
                    Controls.Add(revokedNote);
                }
            }

            var closeBtn = new Button
            {
                Text      = "Close",
                Width     = 90,
                Height    = 34,
                Left      = (Width - 90) / 2 - 8,
                Top       = Height - 62,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(40, 40, 60),
                ForeColor = Color.White,
                Font      = new Font("Segoe UI", 9f),
                Cursor    = Cursors.Hand
            };
            closeBtn.FlatAppearance.BorderSize = 0;
            closeBtn.Click += (_, _) => Close();
            Controls.Add(closeBtn);
            CancelButton = closeBtn;
        }

        private void AddRow(string label, string value, Color valueColor, int pad, ref int y)
        {
            if (!string.IsNullOrEmpty(label))
            {
                var lbl = new Label
                {
                    Text      = label,
                    Font      = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(120, 120, 160),
                    AutoSize  = true,
                    Left      = pad,
                    Top       = y
                };
                Controls.Add(lbl);
                y += lbl.PreferredHeight + 2;
            }

            var val = new Label
            {
                Text      = value,
                Font      = new Font("Segoe UI", 9.5f),
                ForeColor = valueColor,
                AutoSize  = false,
                Width     = Width - pad * 2 - 16,
                Left      = pad,
                Top       = y
            };
            val.Size = new Size(Width - pad * 2 - 16, val.GetPreferredSize(new Size(Width - pad * 2 - 16, 0)).Height);
            Controls.Add(val);
            y += val.Height + 10;
        }

        private static string FormatTime(string? iso)
        {
            if (string.IsNullOrEmpty(iso)) return "—";
            if (DateTime.TryParse(iso, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
                return dt.ToLocalTime().ToString("ddd d MMM yyyy, HH:mm:ss");
            return iso;
        }
    }
}
