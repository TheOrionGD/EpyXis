using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace EpyxisAgentService.Modules
{
    /// <summary>
    /// Module 2 — Application Trust Engine.
    ///
    /// Subscribes to <see cref="IntegrityMonitor.OnNewExecutable"/> and evaluates
    /// each unique executable (keyed by SHA-256 hash) exactly once per service lifetime:
    ///
    ///   1. Hash the file (SHA-256) — also the cache key.
    ///   2. Authenticode check via WinVerifyTrust P/Invoke (chain validation,
    ///      not just "does a cert exist").
    ///   3. Publisher validation against the tenant's configured allowlist.
    ///   4. Installation path heuristics (temp path, publisher/path mismatch).
    ///   5. Compute a weighted Trust Score (0–100) and categorise.
    ///   6. POST result to /api/ingest/trust.
    ///
    /// Cache: ConcurrentDictionary keyed by SHA-256 hex — results survive for the
    /// lifetime of the service process.  Re-evaluation on restart is intentional:
    /// cheap, and self-correcting if a publisher's cert status changed.
    ///
    /// Publisher allowlist: fetched from GET /api/tenants/trusted-publishers at
    /// startup and refreshed every 6 hours.  Falls back to an empty list on failure
    /// (conservative — publisherTrusted will be false, but scoring still runs).
    /// </summary>
    internal sealed class TrustEngine : IDisposable
    {
        // -----------------------------------------------------------------------
        // Configuration
        // -----------------------------------------------------------------------

        private static readonly TimeSpan PublisherRefreshInterval = TimeSpan.FromHours(6);

        // Known suspicious path prefixes (lowercased for case-insensitive compare)
        private static readonly string[] TempPathPrefixes = BuildTempPrefixes();

        // -----------------------------------------------------------------------
        // State
        // -----------------------------------------------------------------------

        private readonly HttpClient _http;
        private readonly ConcurrentDictionary<string, TrustResult> _cache = new();

        // Atomically-replaceable publisher list
        private volatile IReadOnlyList<string> _trustedPublishers = Array.Empty<string>();

        private Timer? _refreshTimer;
        private bool   _started;

        // -----------------------------------------------------------------------
        // Lifecycle
        // -----------------------------------------------------------------------

        public TrustEngine()
        {
            _http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        }

        /// <summary>
        /// Fetches the initial publisher list and subscribes to IntegrityMonitor events.
        /// Safe to call multiple times — only the first call has effect.
        /// </summary>
        public void Start()
        {
            if (_started) return;
            _started = true;

            // Subscribe before the first fetch so we don't miss events during startup.
            IntegrityMonitor.OnNewExecutable += OnNewExecutable;

            // Kick off the first publisher fetch on the thread pool.
            _ = Task.Run(() => RefreshPublishersAsync());

            // Schedule periodic refresh — fires after the first interval.
            _refreshTimer = new Timer(
                _ => _ = Task.Run(() => RefreshPublishersAsync()),
                null,
                PublisherRefreshInterval,
                PublisherRefreshInterval);
        }

        public void Stop()  => _refreshTimer?.Change(Timeout.Infinite, Timeout.Infinite);

        public void Dispose()
        {
            IntegrityMonitor.OnNewExecutable -= OnNewExecutable;
            _refreshTimer?.Dispose();
            _http.Dispose();
        }

        // -----------------------------------------------------------------------
        // Event handler
        // -----------------------------------------------------------------------

        private void OnNewExecutable(ProcessInfo proc)
        {
            // Dispatch evaluation on the thread pool — never block the monitor cycle.
            _ = Task.Run(() => EvaluateAsync(proc));
        }

        // -----------------------------------------------------------------------
        // Core evaluation pipeline
        // -----------------------------------------------------------------------

        private async Task EvaluateAsync(ProcessInfo proc)
        {
            if (string.IsNullOrEmpty(proc.ExecPath)) return;

            // ── Step 1: Hash ────────────────────────────────────────────────────
            string hash;
            try
            {
                byte[] bytes = File.ReadAllBytes(proc.ExecPath);
                byte[] hashBytes = SHA256.HashData(bytes);
                hash = Convert.ToHexString(hashBytes).ToLowerInvariant();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(
                    $"[TrustEngine] trust_eval_skipped pid={proc.Pid} " +
                    $"path={proc.ExecPath} reason={ex.Message}");
                return;
            }

            // ── Cache check ─────────────────────────────────────────────────────
            if (_cache.ContainsKey(hash))
            {
                Console.Error.WriteLine($"[TrustEngine] Cache hit: {hash[..12]}… ({proc.Name})");
                return;
            }

            Console.Error.WriteLine($"[TrustEngine] Evaluating: {hash[..12]}… ({proc.ExecPath})");

            // ── Step 2: Authenticode ────────────────────────────────────────────
            bool    isSigned       = false;
            bool    signatureValid = false;
            string? publisherName  = null;

            try
            {
                // Phase 1: does a certificate even exist?
                var cert = X509Certificate.CreateFromSignedFile(proc.ExecPath);
                isSigned = true;

                // Extract publisher CN from the subject field.
                // Subject format: "CN=Microsoft Corporation, O=..., L=..., ..."
                publisherName = ExtractCN(cert.Subject);

                // Phase 2: build and validate the chain.
                // "Certificate exists" ≠ "chain is valid" — they are separate checks.
                using var cert2 = new X509Certificate2(cert);
                using var chain = new X509Chain();
                chain.ChainPolicy.RevocationMode  = X509RevocationMode.Online;
                chain.ChainPolicy.VerificationFlags = X509VerificationFlags.NoFlag;

                signatureValid = chain.Build(cert2);

                // Phase 3: WinTrust for the definitive Authenticode verdict.
                // WinVerifyTrust validates the entire trust chain including
                // timestamp countersignatures and catalogue trust — this is what
                // Windows SmartScreen/AppLocker/Defender actually use.
                uint winTrustResult = WinTrust.Verify(proc.ExecPath);
                if (winTrustResult != 0) // 0 = TRUST_E_NOSIGNATURE is NOT 0; ERROR_SUCCESS = 0
                {
                    // Non-zero from WinVerifyTrust overrides X509Chain result.
                    signatureValid = false;
                }
            }
            catch (CryptographicException)
            {
                // File has no embedded certificate — unsigned binary, not an error.
                isSigned = false;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(
                    $"[TrustEngine] Authenticode check failed for {proc.ExecPath}: {ex.Message}");
            }

            // ── Step 3: Publisher validation ────────────────────────────────────
            bool publisherTrusted = signatureValid &&
                                    !string.IsNullOrEmpty(publisherName) &&
                                    IsPublisherTrusted(publisherName);

            // ── Step 4: Path heuristics ─────────────────────────────────────────
            bool runningFromTempPath = IsFromTempPath(proc.ExecPath);
            bool pathMismatch        = HasPathMismatch(proc.ExecPath, publisherName);

            // ── Step 5: Score ───────────────────────────────────────────────────
            int score = 100;
            if (!isSigned)                               score -= 40;
            if (isSigned && !signatureValid)             score -= 50; // chain invalid is worse
            if (isSigned && signatureValid && !publisherTrusted) score -= 15;
            if (runningFromTempPath)                     score -= 20;
            if (pathMismatch)                            score -= 15;
            score = Math.Clamp(score, 0, 100);

            string category = score >= 80 ? "trusted" : score >= 40 ? "caution" : "untrusted";

            var result = new TrustResult
            {
                Sha256             = hash,
                IsSigned           = isSigned,
                SignatureValid     = signatureValid,
                PublisherName      = publisherName,
                PublisherTrusted   = publisherTrusted,
                RunningFromTempPath = runningFromTempPath,
                PathMismatch       = pathMismatch,
                Score              = score,
                Category           = category,
                ExecutablePath     = proc.ExecPath
            };

            // ── Store in cache before posting (idempotent if POST fails) ────────
            _cache[hash] = result;

            // ── Step 6: POST to backend ─────────────────────────────────────────
            await PostTrustResultAsync(result).ConfigureAwait(false);
        }

        // -----------------------------------------------------------------------
        // Publisher helpers
        // -----------------------------------------------------------------------

        private async Task RefreshPublishersAsync()
        {
            string? apiKey = EnrollmentManager.LoadApiKey();
            if (string.IsNullOrEmpty(apiKey)) return;

            const int maxAttempts = 3;
            for (int attempt = 1; attempt <= maxAttempts; attempt++)
            {
                try
                {
                    using var request = new HttpRequestMessage(
                        HttpMethod.Get,
                        $"{AgentConfig.BackendBaseUrl}/api/tenants/trusted-publishers");
                    request.Headers.Add("X-Device-Key", apiKey);

                    var response = await _http.SendAsync(request).ConfigureAwait(false);
                    if (!response.IsSuccessStatusCode)
                    {
                        Console.Error.WriteLine(
                            $"[TrustEngine] trusted-publishers fetch returned {(int)response.StatusCode} " +
                            $"(attempt {attempt}/{maxAttempts})");
                        await BackoffAsync(attempt).ConfigureAwait(false);
                        continue;
                    }

                    var body = await response.Content
                        .ReadFromJsonAsync<TrustedPublishersResponse>()
                        .ConfigureAwait(false);

                    if (body?.TrustedPublishers != null)
                    {
                        _trustedPublishers = body.TrustedPublishers;
                        Console.Error.WriteLine(
                            $"[TrustEngine] Loaded {_trustedPublishers.Count} trusted publisher(s).");
                    }
                    return;
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(
                        $"[TrustEngine] trusted-publishers fetch error " +
                        $"(attempt {attempt}/{maxAttempts}): {ex.Message}");
                    await BackoffAsync(attempt).ConfigureAwait(false);
                }
            }

            Console.Error.WriteLine(
                "[TrustEngine] Could not fetch trusted-publishers list after 3 attempts. " +
                "publisherTrusted will be false for all publishers until next refresh.");
        }

        private bool IsPublisherTrusted(string publisherName)
        {
            IReadOnlyList<string> list = _trustedPublishers;
            foreach (string trusted in list)
            {
                if (publisherName.Contains(trusted, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }

        // -----------------------------------------------------------------------
        // Path heuristics
        // -----------------------------------------------------------------------

        private static bool IsFromTempPath(string path)
        {
            string lower = path.ToLowerInvariant();
            foreach (string prefix in TempPathPrefixes)
            {
                if (lower.StartsWith(prefix, StringComparison.Ordinal))
                    return true;
            }
            return false;
        }

        private static bool HasPathMismatch(string execPath, string? publisherName)
        {
            if (string.IsNullOrEmpty(publisherName)) return false;

            // If the publisher name looks like a Microsoft binary but isn't
            // running from the expected system directories, flag it.
            bool claimsMicrosoft = publisherName.Contains("Microsoft", StringComparison.OrdinalIgnoreCase);
            if (!claimsMicrosoft) return false;

            string lower = execPath.ToLowerInvariant();
            bool inExpectedPath =
                lower.StartsWith(@"c:\windows\",      StringComparison.Ordinal) ||
                lower.StartsWith(@"c:\program files\", StringComparison.Ordinal) ||
                lower.StartsWith(@"c:\program files (x86)\", StringComparison.Ordinal);

            return !inExpectedPath;
        }

        private static string[] BuildTempPrefixes()
        {
            var prefixes = new System.Collections.Generic.List<string>();

            // Expand well-known environment variables at class init time.
            void Add(string raw)
            {
                string expanded = Environment.ExpandEnvironmentVariables(raw).ToLowerInvariant();
                if (!string.IsNullOrEmpty(expanded) && expanded != raw.ToLowerInvariant())
                    prefixes.Add(expanded);
            }

            Add(@"%TEMP%\");
            Add(@"%TMP%\");
            Add(@"%LOCALAPPDATA%\Temp\");
            Add(@"%APPDATA%\");

            // Hard-coded fallbacks that are always suspicious regardless of env
            prefixes.Add(@"c:\users\public\");
            prefixes.Add(@"c:\programdata\");  // not always suspicious but worth noting

            return prefixes.ToArray();
        }

        // -----------------------------------------------------------------------
        // Cert subject CN extraction
        // -----------------------------------------------------------------------

        private static string? ExtractCN(string? subject)
        {
            if (string.IsNullOrEmpty(subject)) return null;

            // Subject is a comma-separated Distinguished Name: "CN=Foo, O=Bar, ..."
            foreach (string part in subject.Split(','))
            {
                string trimmed = part.Trim();
                if (trimmed.StartsWith("CN=", StringComparison.OrdinalIgnoreCase))
                    return trimmed["CN=".Length..].Trim();
            }
            return subject;
        }

        // -----------------------------------------------------------------------
        // HTTP helper
        // -----------------------------------------------------------------------

        private async Task PostTrustResultAsync(TrustResult r)
        {
            string? apiKey = EnrollmentManager.LoadApiKey();
            if (string.IsNullOrEmpty(apiKey)) return;

            try
            {
                using var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{AgentConfig.BackendBaseUrl}/api/ingest/trust");
                request.Headers.Add("X-Device-Key", apiKey);
                request.Content = JsonContent.Create(new
                {
                    sha256              = r.Sha256,
                    isSigned            = r.IsSigned,
                    signatureValid      = r.SignatureValid,
                    publisherName       = r.PublisherName,
                    publisherTrusted    = r.PublisherTrusted,
                    runningFromTempPath = r.RunningFromTempPath,
                    pathMismatch        = r.PathMismatch,
                    score               = r.Score,
                    category            = r.Category,
                    executablePath      = r.ExecutablePath
                });

                var response = await _http.SendAsync(request).ConfigureAwait(false);
                if (!response.IsSuccessStatusCode)
                {
                    string body = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    Console.Error.WriteLine(
                        $"[TrustEngine] POST /api/ingest/trust returned " +
                        $"{(int)response.StatusCode}: {body}");
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[TrustEngine] POST /api/ingest/trust error: {ex.Message}");
            }
        }

        private static Task BackoffAsync(int attempt) =>
            Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));

        // -----------------------------------------------------------------------
        // Value objects
        // -----------------------------------------------------------------------

        private sealed class TrustResult
        {
            public string  Sha256              { get; init; } = string.Empty;
            public bool    IsSigned            { get; init; }
            public bool    SignatureValid       { get; init; }
            public string? PublisherName        { get; init; }
            public bool    PublisherTrusted     { get; init; }
            public bool    RunningFromTempPath  { get; init; }
            public bool    PathMismatch         { get; init; }
            public int     Score                { get; init; }
            public string  Category             { get; init; } = string.Empty;
            public string? ExecutablePath       { get; init; }
        }

        private sealed class TrustedPublishersResponse
        {
            [JsonPropertyName("trustedPublishers")]
            public List<string>? TrustedPublishers { get; set; }
        }

        // -----------------------------------------------------------------------
        // WinTrust P/Invoke
        // -----------------------------------------------------------------------

        /// <summary>
        /// Minimal WinVerifyTrust surface.  Validates the Authenticode signature of
        /// a file including chain trust, revocation, and timestamp countersignature.
        /// This is the same call Windows Defender / SmartScreen makes — it is the
        /// authoritative verdict, not the X509Chain.Build() result alone.
        ///
        /// Return value: 0 = ERROR_SUCCESS (signature valid), anything else = not valid.
        ///   Common values: 0x800B0100 (TRUST_E_NOSIGNATURE),
        ///                  0x800B0101 (CERT_E_EXPIRED),
        ///                  0x800B010A (CERT_E_CHAINING).
        /// </summary>
        private static class WinTrust
        {
            // GUID for generic Authenticode policy
            private static readonly Guid WinTrustActionGenericVerifyV2 =
                new Guid("{00AAC56B-CD44-11d0-8CC2-00C04FC295EE}");

            public static uint Verify(string filePath)
            {
                var fileInfo = new WINTRUST_FILE_INFO
                {
                    cbStruct       = (uint)Marshal.SizeOf<WINTRUST_FILE_INFO>(),
                    pcwszFilePath  = filePath,
                    hFile          = IntPtr.Zero,
                    pgKnownSubject = IntPtr.Zero
                };

                IntPtr pFile = Marshal.AllocHGlobal(Marshal.SizeOf<WINTRUST_FILE_INFO>());
                try
                {
                    Marshal.StructureToPtr(fileInfo, pFile, false);

                    var data = new WINTRUST_DATA
                    {
                        cbStruct            = (uint)Marshal.SizeOf<WINTRUST_DATA>(),
                        pPolicyCallbackData = IntPtr.Zero,
                        pSIPClientData      = IntPtr.Zero,
                        dwUIChoice          = 2,   // WTD_UI_NONE
                        fdwRevocationChecks = 0,   // WTD_REVOKE_NONE — avoid network latency in service
                        dwUnionChoice       = 1,   // WTD_CHOICE_FILE
                        pFile               = pFile,
                        dwStateAction       = 0,   // WTD_STATEACTION_IGNORE
                        hWVTStateData       = IntPtr.Zero,
                        pwszURLReference    = null,
                        dwProvFlags         = 0x00000010, // WTD_CACHE_ONLY_URL_RETRIEVAL
                        dwUIContext         = 0
                    };

                    var actionId = WinTrustActionGenericVerifyV2;
                    return WinVerifyTrust(new IntPtr(-1), ref actionId, ref data);
                }
                finally
                {
                    Marshal.FreeHGlobal(pFile);
                }
            }

            [DllImport("wintrust.dll", ExactSpelling = true, SetLastError = false,
                       CharSet = CharSet.Unicode)]
            private static extern uint WinVerifyTrust(
                IntPtr hwnd,
                ref Guid pgActionID,
                ref WINTRUST_DATA pWVTData);

            [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
            private struct WINTRUST_FILE_INFO
            {
                public uint    cbStruct;
                public string  pcwszFilePath;
                public IntPtr  hFile;
                public IntPtr  pgKnownSubject;
            }

            [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
            private struct WINTRUST_DATA
            {
                public uint    cbStruct;
                public IntPtr  pPolicyCallbackData;
                public IntPtr  pSIPClientData;
                public uint    dwUIChoice;
                public uint    fdwRevocationChecks;
                public uint    dwUnionChoice;
                public IntPtr  pFile;             // union — WTD_CHOICE_FILE
                public uint    dwStateAction;
                public IntPtr  hWVTStateData;
                public string? pwszURLReference;
                public uint    dwProvFlags;
                public uint    dwUIContext;
            }
        }
    }
}
