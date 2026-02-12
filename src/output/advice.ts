import { BugCategory } from "../types";

const ADVICE_MAP: Record<BugCategory, string> = {
  AsyncStateRace: "You modified async flow near shared state. Verify await sequencing, cancellation, and error propagation.",
  StateDrift: "State mutation behavior changed. Audit writes for ordering, immutability assumptions, and stale closure usage.",
  NullUndefinedAccess: "Guard behavior changed. Re-check nullable paths, optional chaining, and default fallback values.",
  ValidationEdgeCases: "Validation logic shifted. Add tests for boundary inputs, empty payloads, and malformed data.",
  OffByOneErrors: "Indexing/range edits detected. Verify loop bounds, slice ranges, and length-based conditions.",
  IncompleteRefactors: "Broad structural edits suggest partial migration risk. Search for old call sites and stale invariants.",
  TestCoverageGaps: "Code changed without proportional test movement. Add or update tests around affected branches.",
  ConfigurationRegressions: "Configuration files changed. Validate env defaults, script behavior, and runtime assumptions."
};

export const buildAdvice = (category: BugCategory): string => ADVICE_MAP[category];
