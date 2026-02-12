export interface DiffLimits {
  maxDiffChars: number;
  maxCopilotChars: number;
  maxLinesProcessed: number;
  warnThreshold: number;
}

export const DEFAULT_LIMITS: DiffLimits = {
  maxDiffChars: 500_000,      // Hard limit - reject diffs larger than this
  maxCopilotChars: 4_000,     // Characters sent to Copilot
  maxLinesProcessed: 10_000,  // For signal extraction
  warnThreshold: 100_000      // Warn user at this size
};

const parseEnvInt = (key: string, defaultValue: number): number => {
  const raw = process.env[key];
  if (!raw) return defaultValue;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

export const getLimits = (): DiffLimits => ({
  maxDiffChars: parseEnvInt("NOSTRADIFFMUS_MAX_DIFF_CHARS", DEFAULT_LIMITS.maxDiffChars),
  maxCopilotChars: parseEnvInt("NOSTRADIFFMUS_COPILOT_CHARS", DEFAULT_LIMITS.maxCopilotChars),
  maxLinesProcessed: parseEnvInt("NOSTRADIFFMUS_MAX_LINES", DEFAULT_LIMITS.maxLinesProcessed),
  warnThreshold: parseEnvInt("NOSTRADIFFMUS_WARN_THRESHOLD", DEFAULT_LIMITS.warnThreshold)
});
