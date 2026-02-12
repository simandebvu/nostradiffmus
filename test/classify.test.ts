import { describe, expect, it } from "vitest";
import { classify } from "../src/analyze/classify";

describe("classify", () => {
  it("prefers async race when weighted highest", () => {
    const result = classify([
      {
        id: "signal-1",
        description: "async changed",
        weights: {
          AsyncStateRace: 4,
          StateDrift: 1
        }
      },
      {
        id: "signal-2",
        description: "state changed",
        weights: {
          StateDrift: 2
        }
      }
    ]);

    expect(result.predictedBugCategory).toBe("AsyncStateRace");
    expect(result.confidence).toBeGreaterThan(0);
  });
});
