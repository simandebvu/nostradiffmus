export const TONES = ["tragic", "cryptic", "sarcastic", "biblical", "clinical"] as const;

export type Tone = (typeof TONES)[number];

export type BugCategory =
  | "AsyncStateRace"
  | "StateDrift"
  | "NullUndefinedAccess"
  | "ValidationEdgeCases"
  | "OffByOneErrors"
  | "IncompleteRefactors"
  | "TestCoverageGaps"
  | "ConfigurationRegressions";

export const CATEGORY_LABELS: Record<BugCategory, string> = {
  AsyncStateRace: "Async Race Conditions",
  StateDrift: "State Drift",
  NullUndefinedAccess: "Null/Undefined Access",
  ValidationEdgeCases: "Validation Edge Cases",
  OffByOneErrors: "Off-By-One Errors",
  IncompleteRefactors: "Incomplete Refactors",
  TestCoverageGaps: "Test Coverage Gaps",
  ConfigurationRegressions: "Configuration Regressions"
};

export interface CliOptions {
  staged: boolean;
  commit?: string;
  tone: Tone;
  json: boolean;
  quiet: boolean;
  help: boolean;
  installHook?: "pre-commit" | "pre-push";
  uninstallHook?: "pre-commit" | "pre-push";
}

export interface Signal {
  id: string;
  description: string;
  weights: Partial<Record<BugCategory, number>>;
}

export interface DiffMetadata {
  diffSizeChars: number;
  diffSizeKB: number;
  wasTruncatedForCopilot: boolean;
  filesChanged: number;
}

export interface Prediction {
  predictedBugCategory: BugCategory;
  confidence: number;
  signals: string[];
  advice: string;
  categoryLabel: string;
  metadata?: DiffMetadata;
}

export interface AnalysisContext {
  diff: string;
  files: string[];
  options: CliOptions;
}
