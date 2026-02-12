import { CATEGORY_LABELS, BugCategory, Signal } from "../types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as BugCategory[];

export const classify = (signals: Signal[]): {
  predictedBugCategory: BugCategory;
  confidence: number;
  categoryLabel: string;
} => {
  const scoreMap: Record<BugCategory, number> = {
    AsyncStateRace: 0,
    StateDrift: 0,
    NullUndefinedAccess: 0,
    ValidationEdgeCases: 0,
    OffByOneErrors: 0,
    IncompleteRefactors: 0,
    TestCoverageGaps: 0,
    ConfigurationRegressions: 0
  };

  for (const signal of signals) {
    for (const [category, weight] of Object.entries(signal.weights)) {
      scoreMap[category as BugCategory] += weight ?? 0;
    }
  }

  const ranked = CATEGORIES.map((category) => ({
    category,
    score: scoreMap[category]
  })).sort((left, right) => right.score - left.score);

  const top = ranked[0];
  const total = ranked.reduce((sum, item) => sum + item.score, 0) || 1;
  const confidence = Number((top.score / total).toFixed(2));

  return {
    predictedBugCategory: top.category,
    confidence,
    categoryLabel: CATEGORY_LABELS[top.category]
  };
};
