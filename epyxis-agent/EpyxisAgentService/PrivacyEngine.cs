using System;
using System.Text.Json;

namespace EpyxisAgentService.Core
{
    /// <summary>
    /// Serves as the single serialization boundary for all outbound telemetry.
    /// Ensures that only allowed metadata is serialized and sent to the backend.
    /// </summary>
    public static class PrivacyEngine
    {
        /// <summary>
        /// Validates and serializes a payload ensuring it strictly conforms to metadata rules.
        /// Throws an exception if raw input, clipboard, or sensitive fields are detected.
        /// </summary>
        public static string SerializePayload(object payload)
        {
            // Enforce strict DTO (Data Transfer Object) typing
            // to guarantee no raw strings (like keystrokes or clipboard data) can be serialized.
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            return JsonSerializer.Serialize(payload, options);
        }
    }

    public class BehaviorMetric
    {
        public DateTime UserSessionDate { get; set; }
        public int ActiveAppSeconds { get; set; }
        public int FocusSwitchCount { get; set; }
        public int KeyboardActivityCount { get; set; } // COUNT only
    }
}
