import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/cli/args";

describe("parseArgs", () => {
  it("uses staged mode by default", () => {
    const options = parseArgs([]);
    expect(options.staged).toBe(true);
    expect(options.commit).toBeUndefined();
  });

  it("accepts commit and tone", () => {
    const options = parseArgs(["--commit", "HEAD~1", "--tone", "cryptic"]);
    expect(options.staged).toBe(false);
    expect(options.commit).toBe("HEAD~1");
    expect(options.tone).toBe("cryptic");
  });

  it("throws for invalid tone", () => {
    expect(() => parseArgs(["--tone", "noir"]))
      .toThrowError(/Invalid tone/);
  });
});
