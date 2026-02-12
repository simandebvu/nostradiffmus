import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";

describe("Timeout behavior", () => {
  it("should timeout git commands that take too long", () => {
    // Simulate a slow git command with sleep
    const result = spawnSync("sleep", ["5"], {
      timeout: 100, // Very short timeout
      killSignal: "SIGTERM",
      encoding: "utf-8"
    });

    // Should be killed by timeout
    expect(result.signal).toBe("SIGTERM");
  });

  it("should complete fast git commands within timeout", () => {
    // This should complete quickly
    const result = spawnSync("git", ["--version"], {
      timeout: 5000,
      killSignal: "SIGTERM",
      encoding: "utf-8"
    });

    // Should complete successfully
    expect(result.status).toBe(0);
    expect(result.signal).toBeNull();
    expect(result.stdout).toContain("git version");
  });

  it("should have timeout configured for git operations", async () => {
    // Just verify the config can be loaded
    const { getLimits } = await import("../src/config/limits");
    const limits = getLimits();

    expect(limits.gitTimeoutMs).toBeGreaterThan(0);
    expect(limits.gitTimeoutMs).toBe(30000); // Default 30s
  });
});
