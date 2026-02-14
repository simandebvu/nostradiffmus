import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { installHook, uninstallHook } from "../src/hooks/install";
import * as fs from "node:fs";
import * as child_process from "node:child_process";

// Mock modules
vi.mock("node:fs");
vi.mock("node:child_process");

describe("installHook", () => {
  const mockGitDir = "/path/to/repo/.git";
  const mockHookPath = "/path/to/repo/.git/hooks/pre-commit";

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for getGitRoot (via spawnSync)
    vi.mocked(child_process.spawnSync).mockReturnValue({
      status: 0,
      stdout: mockGitDir,
      stderr: "",
      signal: null,
      error: undefined,
      pid: 1234,
      output: [null, Buffer.from(mockGitDir), Buffer.from("")]
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should install hook when no existing hook exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    vi.mocked(fs.chmodSync).mockReturnValue(undefined);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    installHook("pre-commit");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockHookPath,
      expect.stringContaining("#!/bin/sh"),
      { mode: 0o755 }
    );
    expect(fs.chmodSync).toHaveBeenCalledWith(mockHookPath, 0o755);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Successfully installed")
    );

    consoleSpy.mockRestore();
  });

  it("should detect already installed Nostradiffmus hook", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "#!/bin/sh\n# Nostradiffmus Pre-Commit Hook\n"
    );

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    installHook("pre-commit");

    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("already installed")
    );

    consoleSpy.mockRestore();
  });

  it("should error when conflicting hook exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "#!/bin/sh\n# Some other hook\n"
    );

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    expect(() => installHook("pre-commit")).toThrow(
      "Hook installation aborted - existing hook found"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("A pre-commit hook already exists")
    );

    consoleSpy.mockRestore();
  });

  it("should install pre-push hook with correct content", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    vi.mocked(fs.chmodSync).mockReturnValue(undefined);

    installHook("pre-push");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/path/to/repo/.git/hooks/pre-push",
      expect.stringContaining("Nostradiffmus Pre-Push Hook"),
      { mode: 0o755 }
    );
  });

  it("should handle git command errors", () => {
    vi.mocked(child_process.spawnSync).mockReturnValue({
      status: 1,
      stdout: "",
      stderr: "fatal: not a git repository",
      signal: null,
      error: undefined,
      pid: 1234,
      output: [null, Buffer.from(""), Buffer.from("fatal: not a git repository")]
    });

    expect(() => installHook("pre-commit")).toThrow(
      "Not in a git repository"
    );
  });

  it("should handle git timeout", () => {
    vi.mocked(child_process.spawnSync).mockReturnValue({
      status: null,
      stdout: "",
      stderr: "",
      signal: "SIGTERM",
      error: undefined,
      pid: 1234,
      output: [null, Buffer.from(""), Buffer.from("")]
    });

    expect(() => installHook("pre-commit")).toThrow(
      "Git command timed out"
    );
  });
});

describe("uninstallHook", () => {
  const mockGitDir = "/path/to/repo/.git";
  const mockHookPath = "/path/to/repo/.git/hooks/pre-commit";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock git command to return git directory
    vi.mocked(child_process.spawnSync).mockReturnValue({
      status: 0,
      stdout: mockGitDir,
      stderr: "",
      signal: null,
      error: undefined,
      pid: 1234,
      output: [null, Buffer.from(mockGitDir), Buffer.from("")]
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should successfully uninstall Nostradiffmus hook", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "#!/bin/sh\n# Nostradiffmus Pre-Commit Hook\n"
    );
    vi.mocked(fs.unlinkSync).mockReturnValue(undefined);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    uninstallHook("pre-commit");

    expect(fs.unlinkSync).toHaveBeenCalledWith(mockHookPath);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Successfully uninstalled")
    );

    consoleSpy.mockRestore();
  });

  it("should handle case when hook does not exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    uninstallHook("pre-commit");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("No pre-commit hook found")
    );

    consoleSpy.mockRestore();
  });

  it("should error when hook is not managed by Nostradiffmus", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "#!/bin/sh\n# Some other hook\n"
    );

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    expect(() => uninstallHook("pre-commit")).toThrow(
      "Uninstall aborted - hook not managed by Nostradiffmus"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("wasn't installed by Nostradiffmus")
    );

    consoleSpy.mockRestore();
  });

  it("should handle file deletion failure", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "#!/bin/sh\n# Nostradiffmus Pre-Commit Hook\n"
    );
    vi.mocked(fs.unlinkSync).mockImplementation(() => {
      throw new Error("EACCES: permission denied");
    });

    expect(() => uninstallHook("pre-commit")).toThrow(
      "Failed to remove hook file: EACCES: permission denied"
    );
  });

  it("should uninstall pre-push hook", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "#!/bin/sh\n# Nostradiffmus Pre-Push Hook\n"
    );
    vi.mocked(fs.unlinkSync).mockReturnValue(undefined);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    uninstallHook("pre-push");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Successfully uninstalled")
    );

    consoleSpy.mockRestore();
  });
});
