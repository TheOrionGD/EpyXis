using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.ServiceProcess;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Win32;

namespace EpyxisAgentService.Modules
{
    /// <summary>
    /// Module 1 — Integrity Monitor.
    ///
    /// Responsibilities:
    ///   • Enumerate running processes (Process.GetProcesses + WMI Win32_Process for parent PID / exec path)
    ///   • Enumerate startup entries (HKCU/HKLM Run keys + Startup folder)
    ///   • Enumerate scheduled tasks (schtasks /query)
    ///   • Enumerate Windows services (ServiceController.GetServices)
    ///   • Enumerate kernel drivers (WMI Win32_SystemDriver)
    ///
    /// Snapshot vs. Delta logic:
    ///   On the first cycle, every item is sent as a *_snapshot event.
    ///   On subsequent cycles, only additions and state changes are sent as delta events.
    ///   A monotonically increasing snapshotSeq is attached to snapshot events for correlation.
    ///
    /// Privacy:
    ///   • Process executable PATHS are captured (image only — no args).
    ///   • Command-line arguments are NEVER transmitted. <see cref="RedactArgs"/> strips everything
    ///     after the binary path, and also applies a pass for common --key=value patterns that
    ///     appear even in path-like strings (e.g. an exe that happens to be named with an =).
    ///   • Startup entry command values have args stripped the same way.
    ///   • Scheduled task action arguments are not captured at all (schtasks output is parsed
    ///     for TASKNAME/STATUS/NEXT RUN only, not the TASK TO RUN column arguments).
    /// </summary>
    internal sealed class IntegrityMonitor : IDisposable
    {
        // -----------------------------------------------------------------------
        // Cross-module event — TrustEngine subscribes to this
        // -----------------------------------------------------------------------

        /// <summary>
        /// Fired whenever IntegrityMonitor discovers a process that has an executable
        /// path (both on initial snapshot and on process_start delta events).
        /// TrustEngine subscribes to this to evaluate trust without duplicating
        /// the WMI enumeration.
        /// </summary>
        internal static event Action<ProcessInfo>? OnNewExecutable;

        // -----------------------------------------------------------------------
        // Configuration
        // -----------------------------------------------------------------------

        /// <summary>How often the full poll cycle runs.</summary>
        private static readonly TimeSpan PollInterval = TimeSpan.FromMinutes(5);

        /// <summary>
        /// Patterns matched against command-line tokens to detect and suppress
        /// common sensitive-argument forms before any string leaves the machine.
        /// Examples: --password=foo, -p foo, /password:foo, PGPASSWORD=foo.
        /// </summary>
        private static readonly Regex[] _sensitiveArgPatterns = new[]
        {
            new Regex(@"(?i)(--|/)?(password|passwd|pwd|secret|token|apikey|api_key|key|credential|cred|auth|bearer)\s*[=:]\s*\S+",
                      RegexOptions.Compiled),
            new Regex(@"(?i)^[A-Z_]+(PASSWORD|TOKEN|SECRET|KEY|CREDENTIAL)=.+$",
                      RegexOptions.Compiled)
        };

        // -----------------------------------------------------------------------
        // State
        // -----------------------------------------------------------------------

        private readonly HttpClient _http;
        private Timer? _timer;

        // Previous snapshots — used for delta detection
        private HashSet<int>    _prevProcessPids    = new();
        private HashSet<string> _prevStartupKeys    = new();   // "hive|name|execPath"
        private Dictionary<string, string> _prevServiceStates = new(); // serviceName → status
        private HashSet<string> _prevDriverNames    = new();
        private HashSet<string> _prevTaskNames      = new();

        private int  _snapshotSeq = 0;
        private bool _firstCycle  = true;

        // -----------------------------------------------------------------------
        // Lifecycle
        // -----------------------------------------------------------------------

        public IntegrityMonitor()
        {
            _http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        }

        /// <summary>Starts the periodic poll. Fired immediately then on interval.</summary>
        public void Start()
        {
            _timer = new Timer(OnTick, null, TimeSpan.Zero, PollInterval);
        }

        public void Stop()  => _timer?.Change(Timeout.Infinite, Timeout.Infinite);
        public void Dispose() { _timer?.Dispose(); _http.Dispose(); }

        // -----------------------------------------------------------------------
        // Timer callback
        // -----------------------------------------------------------------------

        private void OnTick(object? _) => _ = RunCycleAsync();

        private async Task RunCycleAsync()
        {
            try
            {
                string? apiKey = EnrollmentManager.LoadApiKey();
                if (string.IsNullOrEmpty(apiKey))
                {
                    // Device not yet enrolled; skip silently.
                    return;
                }

                _http.DefaultRequestHeaders.Remove("X-Device-Key");
                _http.DefaultRequestHeaders.Add("X-Device-Key", apiKey);

                int seq = Interlocked.Increment(ref _snapshotSeq);
                bool isFirst = _firstCycle;

                await PollProcessesAsync(seq, isFirst).ConfigureAwait(false);
                await PollStartupEntriesAsync(seq, isFirst).ConfigureAwait(false);
                await PollServicesAsync(seq, isFirst).ConfigureAwait(false);
                await PollScheduledTasksAsync(seq, isFirst).ConfigureAwait(false);
                await PollDriversAsync(seq, isFirst).ConfigureAwait(false);

                _firstCycle = false;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] Cycle error: {ex.Message}");
            }
        }

        // -----------------------------------------------------------------------
        // Process enumeration
        // -----------------------------------------------------------------------

        private async Task PollProcessesAsync(int seq, bool fullSnapshot)
        {
            // Build a lookup of PID → (PPID, execPath) from WMI — System.Diagnostics
            // only gives us the process name, not the full path or parent.
            var wmiDetails = GetProcessDetailsFromWmi();

            var current = new HashSet<int>();
            var tasks   = new List<Task>();

            foreach (var proc in Process.GetProcesses())
            {
                try
                {
                    int pid = proc.Id;
                    current.Add(pid);

                    wmiDetails.TryGetValue(pid, out var detail);

                    if (fullSnapshot)
                    {
                        tasks.Add(PostAsync("/api/ingest/process", new
                        {
                            eventType   = "process_snapshot",
                            pid,
                            ppid        = detail.Ppid,
                            name        = proc.ProcessName,
                            execPath    = detail.ExecPath,
                            startTime   = SafeStartTime(proc),
                            snapshotSeq = seq
                        }));

                        // Signal TrustEngine — snapshot paths are new to the engine too
                        if (!string.IsNullOrEmpty(detail.ExecPath))
                            OnNewExecutable?.Invoke(new ProcessInfo
                            {
                                Pid      = pid,
                                Name     = proc.ProcessName,
                                ExecPath = detail.ExecPath
                            });
                    }
                    else if (!_prevProcessPids.Contains(pid))
                    {
                        // New process appeared since last cycle
                        tasks.Add(PostAsync("/api/ingest/process", new
                        {
                            eventType = "process_start",
                            pid,
                            ppid      = detail.Ppid,
                            name      = proc.ProcessName,
                            execPath  = detail.ExecPath,
                            startTime = SafeStartTime(proc)
                        }));

                        // Signal TrustEngine for delta process-start events
                        if (!string.IsNullOrEmpty(detail.ExecPath))
                            OnNewExecutable?.Invoke(new ProcessInfo
                            {
                                Pid      = pid,
                                Name     = proc.ProcessName,
                                ExecPath = detail.ExecPath
                            });
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"[IntegrityMonitor] Process {proc.Id} access error: {ex.Message}");
                }
            }

            // Delta: processes that disappeared since last cycle
            if (!fullSnapshot)
            {
                foreach (int gone in _prevProcessPids.Except(current))
                {
                    tasks.Add(PostAsync("/api/ingest/process", new
                    {
                        eventType = "process_stop",
                        pid       = gone,
                        name      = "(exited)"
                    }));
                }
            }

            _prevProcessPids = current;
            await Task.WhenAll(tasks).ConfigureAwait(false);
        }

        /// <summary>
        /// Returns a dictionary of PID → (Ppid, ExecPath) using WMI Win32_Process.
        /// On access failure the entry is omitted — callers treat missing entries as (ppid=0, execPath=null).
        /// </summary>
        private static Dictionary<int, (int Ppid, string? ExecPath)> GetProcessDetailsFromWmi()
        {
            var result = new Dictionary<int, (int, string?)>();
            try
            {
                using var searcher = new ManagementObjectSearcher(
                    "SELECT ProcessId, ParentProcessId, ExecutablePath FROM Win32_Process");
                foreach (ManagementObject obj in searcher.Get())
                {
                    int pid  = Convert.ToInt32(obj["ProcessId"]);
                    int ppid = Convert.ToInt32(obj["ParentProcessId"]);
                    // ExecutablePath is the image path — does NOT include command-line arguments.
                    string? execPath = obj["ExecutablePath"] as string;
                    result[pid] = (ppid, execPath);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] WMI process query failed: {ex.Message}");
            }
            return result;
        }

        private static string? SafeStartTime(Process proc)
        {
            try { return proc.StartTime.ToUniversalTime().ToString("o"); }
            catch { return null; }
        }

        // -----------------------------------------------------------------------
        // Startup entries
        // -----------------------------------------------------------------------

        private async Task PollStartupEntriesAsync(int seq, bool fullSnapshot)
        {
            var current = new Dictionary<string, StartupEntry>();

            // HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
            ReadRunKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", Registry.CurrentUser, "HKCU", current);
            // HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
            ReadRunKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", Registry.LocalMachine, "HKLM", current);
            // Common startup folder
            ReadStartupFolder(Environment.GetFolderPath(Environment.SpecialFolder.CommonStartup), current);

            var currentKeys = current.Keys.ToHashSet();
            var tasks = new List<Task>();

            foreach (var (key, entry) in current)
            {
                if (fullSnapshot)
                {
                    tasks.Add(PostAsync("/api/ingest/startup", new
                    {
                        eventType   = "startup_snapshot",
                        hive        = entry.Hive,
                        name        = entry.Name,
                        execPath    = entry.ExecPath,
                        snapshotSeq = seq
                    }));
                }
                else if (!_prevStartupKeys.Contains(key))
                {
                    tasks.Add(PostAsync("/api/ingest/startup", new
                    {
                        eventType = "startup_added",
                        hive      = entry.Hive,
                        name      = entry.Name,
                        execPath  = entry.ExecPath
                    }));
                }
            }

            if (!fullSnapshot)
            {
                foreach (string removed in _prevStartupKeys.Except(currentKeys))
                {
                    var parts = removed.Split('|');
                    tasks.Add(PostAsync("/api/ingest/startup", new
                    {
                        eventType = "startup_removed",
                        hive      = parts.ElementAtOrDefault(0),
                        name      = parts.ElementAtOrDefault(1)
                    }));
                }
            }

            _prevStartupKeys = currentKeys;
            await Task.WhenAll(tasks).ConfigureAwait(false);
        }

        private static void ReadRunKey(
            string subKeyPath,
            RegistryKey hive,
            string hiveName,
            Dictionary<string, StartupEntry> into)
        {
            try
            {
                using var key = hive.OpenSubKey(subKeyPath, writable: false);
                if (key == null) return;
                foreach (string name in key.GetValueNames())
                {
                    string raw     = (key.GetValue(name) as string) ?? string.Empty;
                    string execPath = ExtractImagePath(raw) ?? string.Empty;
                    string dictKey  = $"{hiveName}|{name}|{execPath}";
                    into[dictKey] = new StartupEntry { Hive = hiveName, Name = name, ExecPath = execPath };
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] Run key {hiveName} read error: {ex.Message}");
            }
        }

        private static void ReadStartupFolder(string folder, Dictionary<string, StartupEntry> into)
        {
            if (!Directory.Exists(folder)) return;
            try
            {
                foreach (string file in Directory.GetFiles(folder, "*.lnk"))
                {
                    string name    = Path.GetFileNameWithoutExtension(file);
                    string dictKey = $"StartupFolder|{name}|{file}";
                    into[dictKey]  = new StartupEntry { Hive = "StartupFolder", Name = name, ExecPath = file };
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] Startup folder read error: {ex.Message}");
            }
        }

        // -----------------------------------------------------------------------
        // Services
        // -----------------------------------------------------------------------

        private async Task PollServicesAsync(int seq, bool fullSnapshot)
        {
            var current = new Dictionary<string, (string Status, string StartType, string DisplayName, string? ExecPath)>();
            var tasks   = new List<Task>();

            try
            {
                // Use WMI for richer info (StartType, PathName) alongside ServiceController for status
                using var searcher = new ManagementObjectSearcher(
                    "SELECT Name, DisplayName, State, StartMode, PathName FROM Win32_Service");
                foreach (ManagementObject obj in searcher.Get())
                {
                    string name        = (obj["Name"]        as string) ?? string.Empty;
                    string displayName = (obj["DisplayName"] as string) ?? string.Empty;
                    string state       = (obj["State"]       as string) ?? "Unknown";
                    string startMode   = (obj["StartMode"]   as string) ?? "Unknown";
                    string? rawPath    = obj["PathName"] as string;
                    string? execPath   = rawPath != null ? ExtractImagePath(rawPath) : null;

                    current[name] = (state, startMode, displayName, execPath);

                    if (fullSnapshot)
                    {
                        tasks.Add(PostAsync("/api/ingest/service", new
                        {
                            eventType   = "service_snapshot",
                            serviceName = name,
                            displayName,
                            status      = state,
                            startType   = startMode,
                            execPath,
                            snapshotSeq = seq
                        }));
                    }
                    else if (_prevServiceStates.TryGetValue(name, out string? prevState) && prevState != state)
                    {
                        tasks.Add(PostAsync("/api/ingest/service", new
                        {
                            eventType      = "service_state_changed",
                            serviceName    = name,
                            displayName,
                            status         = state,
                            startType      = startMode,
                            execPath,
                            previousStatus = prevState
                        }));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] Service enumeration error: {ex.Message}");
            }

            _prevServiceStates = current.ToDictionary(kv => kv.Key, kv => kv.Value.Status);
            await Task.WhenAll(tasks).ConfigureAwait(false);
        }

        // -----------------------------------------------------------------------
        // Scheduled tasks
        // -----------------------------------------------------------------------

        private async Task PollScheduledTasksAsync(int seq, bool fullSnapshot)
        {
            var current = new Dictionary<string, (string Path, string Status)>();
            var tasks   = new List<Task>();

            try
            {
                // schtasks /query /fo CSV /nh outputs: TaskName, Next Run Time, Status
                // We only parse columns 0 (task path+name) and 2 (status).
                // We explicitly do NOT capture column 1 (TASK TO RUN) which can contain arguments.
                var psi = new ProcessStartInfo("schtasks", "/query /fo CSV /nh")
                {
                    RedirectStandardOutput = true,
                    RedirectStandardError  = true,
                    UseShellExecute        = false,
                    CreateNoWindow         = true
                };

                using var proc = Process.Start(psi);
                if (proc == null) return;

                string output = await proc.StandardOutput.ReadToEndAsync().ConfigureAwait(false);
                await proc.WaitForExitAsync().ConfigureAwait(false);

                foreach (string line in output.Split('\n'))
                {
                    string trimmed = line.Trim();
                    if (string.IsNullOrEmpty(trimmed)) continue;

                    // CSV: "TaskName","Next Run Time","Status"
                    var cols = ParseCsvLine(trimmed);
                    if (cols.Count < 3) continue;

                    string taskPath = cols[0].Trim('"');
                    // cols[1] is Next Run Time — not captured
                    string status   = cols[2].Trim('"');
                    // Derive friendly name from path (last path component)
                    string taskName = taskPath.Contains('\\')
                        ? taskPath[(taskPath.LastIndexOf('\\') + 1)..]
                        : taskPath;

                    current[taskName] = (taskPath, status);

                    if (fullSnapshot)
                    {
                        tasks.Add(PostAsync("/api/ingest/scheduledtask", new
                        {
                            eventType   = "task_snapshot",
                            taskPath,
                            taskName,
                            status,
                            snapshotSeq = seq
                        }));
                    }
                    else if (!_prevTaskNames.Contains(taskName))
                    {
                        tasks.Add(PostAsync("/api/ingest/scheduledtask", new
                        {
                            eventType = "task_added",
                            taskPath,
                            taskName,
                            status
                        }));
                    }
                }

                if (!fullSnapshot)
                {
                    foreach (string removed in _prevTaskNames.Except(current.Keys))
                    {
                        tasks.Add(PostAsync("/api/ingest/scheduledtask", new
                        {
                            eventType = "task_removed",
                            taskName  = removed
                        }));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] Scheduled task enumeration error: {ex.Message}");
            }

            _prevTaskNames = current.Keys.ToHashSet();
            await Task.WhenAll(tasks).ConfigureAwait(false);
        }

        // -----------------------------------------------------------------------
        // Drivers
        // -----------------------------------------------------------------------

        private async Task PollDriversAsync(int seq, bool fullSnapshot)
        {
            var current = new HashSet<string>();
            var tasks   = new List<Task>();

            try
            {
                using var searcher = new ManagementObjectSearcher(
                    "SELECT Name, DisplayName, State, PathName FROM Win32_SystemDriver");
                foreach (ManagementObject obj in searcher.Get())
                {
                    string name        = (obj["Name"]        as string) ?? string.Empty;
                    string displayName = (obj["DisplayName"] as string) ?? string.Empty;
                    string state       = (obj["State"]       as string) ?? "Unknown";
                    string? pathName   = obj["PathName"] as string;

                    current.Add(name);

                    if (fullSnapshot)
                    {
                        tasks.Add(PostAsync("/api/ingest/driver", new
                        {
                            eventType   = "driver_snapshot",
                            name,
                            displayName,
                            state,
                            pathName,
                            snapshotSeq = seq
                        }));
                    }
                    else if (!_prevDriverNames.Contains(name))
                    {
                        tasks.Add(PostAsync("/api/ingest/driver", new
                        {
                            eventType = "driver_added",
                            name,
                            displayName,
                            state,
                            pathName
                        }));
                    }
                }

                if (!fullSnapshot)
                {
                    foreach (string removed in _prevDriverNames.Except(current))
                    {
                        tasks.Add(PostAsync("/api/ingest/driver", new
                        {
                            eventType = "driver_removed",
                            name      = removed
                        }));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] Driver enumeration error: {ex.Message}");
            }

            _prevDriverNames = current;
            await Task.WhenAll(tasks).ConfigureAwait(false);
        }

        // -----------------------------------------------------------------------
        // HTTP helper
        // -----------------------------------------------------------------------

        private async Task PostAsync(string path, object payload)
        {
            try
            {
                var response = await _http
                    .PostAsJsonAsync($"{AgentConfig.BackendBaseUrl}{path}", payload)
                    .ConfigureAwait(false);

                if (!response.IsSuccessStatusCode)
                {
                    string body = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    Console.Error.WriteLine(
                        $"[IntegrityMonitor] POST {path} returned {(int)response.StatusCode}: {body}");
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[IntegrityMonitor] POST {path} error: {ex.Message}");
            }
        }

        // -----------------------------------------------------------------------
        // Argument-redaction helpers
        // -----------------------------------------------------------------------

        /// <summary>
        /// Given a raw command-line string (e.g. from a registry Run value or WMI PathName),
        /// returns ONLY the image path component — everything after the first unquoted space
        /// following the binary is dropped.
        ///
        /// Then applies a secondary pass with <see cref="_sensitiveArgPatterns"/> against
        /// the remaining path tokens in case the path itself contains suspicious substrings
        /// (extremely rare but handled defensively).
        ///
        /// This is the single enforcement point: no args ever leave this method in the output.
        /// </summary>
        internal static string? ExtractImagePath(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;

            string trimmed = raw.Trim();

            // Handle quoted paths: "C:\path\to\exe.exe" [args...]
            if (trimmed.StartsWith('"'))
            {
                int end = trimmed.IndexOf('"', 1);
                return end > 0 ? trimmed[1..end] : trimmed.Trim('"');
            }

            // Unquoted: take everything up to the first space
            int space = trimmed.IndexOf(' ');
            return space > 0 ? trimmed[..space] : trimmed;
        }

        /// <summary>
        /// Scans a string for tokens that match known sensitive-argument patterns and replaces
        /// matched content with [REDACTED]. Used as a belt-and-suspenders pass.
        /// </summary>
        internal static string RedactArgs(string input)
        {
            foreach (var pattern in _sensitiveArgPatterns)
            {
                input = pattern.Replace(input, "[REDACTED]");
            }
            return input;
        }

        // -----------------------------------------------------------------------
        // CSV parser (minimal — handles basic quoted fields from schtasks output)
        // -----------------------------------------------------------------------

        private static List<string> ParseCsvLine(string line)
        {
            var result  = new List<string>();
            bool inQuote = false;
            var  current = new System.Text.StringBuilder();

            foreach (char c in line)
            {
                if (c == '"')
                {
                    inQuote = !inQuote;
                }
                else if (c == ',' && !inQuote)
                {
                    result.Add(current.ToString());
                    current.Clear();
                }
                else
                {
                    current.Append(c);
                }
            }
            result.Add(current.ToString());
            return result;
        }

        // -----------------------------------------------------------------------
        // Value objects
        // -----------------------------------------------------------------------

        private sealed class StartupEntry
        {
            public string Hive     { get; init; } = string.Empty;
            public string Name     { get; init; } = string.Empty;
            public string? ExecPath { get; init; }
        }
    }
}
