import { BugCategory, Tone } from "../types";

const CATEGORY_OMENS: Record<BugCategory, string[]> = {
  AsyncStateRace: [
    "A race condition hides in asynchronous shadows.",
    "Promises entwine before state can settle.",
    "An error path fades when timing turns chaotic."
  ],
  StateDrift: [
    "State diverges quietly before it fractures loudly.",
    "Mutations gather where invariants once stood.",
    "A stale value lingers past its rightful era."
  ],
  NullUndefinedAccess: [
    "A nullable path slips beyond the guards.",
    "An undefined whisper becomes a runtime shout.",
    "A missing branch opens where certainty was assumed."
  ],
  ValidationEdgeCases: [
    "A strange input reaches the throne unchallenged.",
    "Validation bends for common paths and breaks for rare ones.",
    "An edge case waits where assumptions are thin."
  ],
  OffByOneErrors: [
    "A boundary is crossed by one fateful step.",
    "Indices drift near the edge of certainty.",
    "A loop closes too soon or one turn too late."
  ],
  IncompleteRefactors: [
    "Old and new structures now share an uneasy border.",
    "A renamed path leaves echoes in forgotten call sites.",
    "Refactor winds moved faster than invariants could follow."
  ],
  TestCoverageGaps: [
    "CI trembles where coverage has grown thin.",
    "A changed path walks untested into production.",
    "Behavior shifts without a corresponding oracle."
  ],
  ConfigurationRegressions: [
    "Configuration runes have been rewritten.",
    "An environment key changes fate at runtime.",
    "Defaults move, and deployment follows blindly."
  ]
};

const tonePrefix = (tone: Tone): string => {
  switch (tone) {
    case "tragic":
      return "🔮 Consulting the sacred diff scrolls...";
    case "cryptic":
      return "🔮 Patterns emerge in fractured symbols...";
    case "sarcastic":
      return "🔮 Excellent. Another harmless little change, surely...";
    case "biblical":
      return "🔮 And lo, the diff was opened, and signs were many.";
    case "clinical":
      return "🔮 Differential risk analysis in progress.";
  }
};

export const renderProphecy = (tone: Tone, category: BugCategory): string => {
  const lines = CATEGORY_OMENS[category];
  const transformed = lines.map((line) => {
    if (tone === "clinical") {
      return line.replace(".", "");
    }
    if (tone === "sarcastic") {
      return `${line.slice(0, -1)}. Obviously.`;
    }
    if (tone === "cryptic") {
      return line.replace(" ", " ... ");
    }
    if (tone === "biblical") {
      return `Behold: ${line}`;
    }
    return line;
  });

  return [tonePrefix(tone), "", "I foresee:", ...transformed.map((line) => `• ${line}`)].join("\n");
};
