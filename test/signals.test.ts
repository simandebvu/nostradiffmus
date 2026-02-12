import { describe, expect, it } from "vitest";
import { extractSignals } from "../src/analyze/signals";

describe("extractSignals", () => {
  it("detects async-flow-shift", () => {
    const diff = [
      "diff --git a/src/a.ts b/src/a.ts",
      "--- a/src/a.ts",
      "+++ b/src/a.ts",
      "+async function syncState() {",
      "+  await queue.flush()",
      "+  setState(next)",
      "-  catch (error) {",
      "-    console.error(error)",
      "-  }"
    ].join("\n");

    const signals = extractSignals(diff, ["src/a.ts"]);
    expect(signals.some((signal) => signal.id === "async-flow-shift")).toBe(true);
  });
});
