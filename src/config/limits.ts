import { loadFileConfig } from "./fileConfig";

export interface DiffLimits {
  maxDiffChars: number;
  maxCopilotChars: number;
  maxLinesProcessed: number;
  warnThreshold: number;
  gitTimeoutMs: number;
  analysisTimeoutMs: number;
}

export const DEFAULT_LIMITS: DiffLimits = {
  maxDiffChars: 500_000,      // Hard limit - reject diffs larger than this
  maxCopilotChars: 4_000,     // Characters sent to Copilot
  maxLinesProcessed: 10_000,  // For signal extraction
  warnThreshold: 100_000,     // Warn user at this size
  gitTimeoutMs: 30_000,       // Git command timeout (30 seconds)
  analysisTimeoutMs: 60_000   // Overall analysis timeout (60 seconds)
};

const parseEnvInt = (key: string, defaultValue: number): number => {
  const raw = process.env[key];
  if (!raw) return defaultValue;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

export const getLimits = (): DiffLimits => {
  // Priority: env vars > file config > defaults
  const fileConfig = loadFileConfig();

  return {
    maxDiffChars: parseEnvInt(
      "NOSTRADIFFMUS_MAX_DIFF_CHARS",
      fileConfig.maxDiffChars ?? DEFAULT_LIMITS.maxDiffChars
    ),
    maxCopilotChars: parseEnvInt(
      "NOSTRADIFFMUS_COPILOT_CHARS",
      fileConfig.copilotChars ?? DEFAULT_LIMITS.maxCopilotChars
    ),
    maxLinesProcessed: parseEnvInt(
      "NOSTRADIFFMUS_MAX_LINES",
      DEFAULT_LIMITS.maxLinesProcessed
    ),
    warnThreshold: parseEnvInt(
      "NOSTRADIFFMUS_WARN_THRESHOLD",
      fileConfig.warnThreshold ?? DEFAULT_LIMITS.warnThreshold
    ),
    gitTimeoutMs: parseEnvInt(
      "NOSTRADIFFMUS_GIT_TIMEOUT_MS",
      DEFAULT_LIMITS.gitTimeoutMs
    ),
    analysisTimeoutMs: parseEnvInt(
      "NOSTRADIFFMUS_ANALYSIS_TIMEOUT_MS",
      DEFAULT_LIMITS.analysisTimeoutMs
    )
  };
};
