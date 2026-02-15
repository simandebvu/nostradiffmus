import { writeFileSync, existsSync, readFileSync, chmodSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

type HookType = "pre-commit" | "pre-push";

const getGitRoot = (): string => {
  const result = spawnSync("git", ["rev-parse", "--git-dir"], {
    encoding: "utf-8",
    timeout: 5000, // 5 second timeout for git commands
    killSignal: "SIGTERM"
  });

  if (result.signal === "SIGTERM" || (result.error && result.error.message.includes("SIGTERM"))) {
    throw new Error("Git command timed out. Check your git repository status.");
  }

  if (result.status !== 0) {
    throw new Error("Not in a git repository. Run this command from inside a git repo.");
  }

  return result.stdout.trim();
};

const generateHookScript = (type: HookType): string => {
  const scripts = {
    "pre-commit": `#!/bin/sh
# Nostradiffmus Pre-Commit Hook
# Automatically installed by: nostradiffmus install-hook

echo "🔮 Consulting the sacred diff scrolls..."
echo ""

# Run nostradiffmus on staged changes
if ! npx nostradiffmus --staged --quiet; then
  echo ""
  echo "⚠️  Nostradiffmus detected potential issues."
  echo "You can still commit, but consider reviewing the advice above."
  echo ""
fi

# Always allow commit to proceed
exit 0
`,
    "pre-push": `#!/bin/sh
# Nostradiffmus Pre-Push Hook
# Automatically installed by: nostradiffmus install-hook

echo "🔮 Analyzing recent commits before push..."
echo ""

# Analyze commits that are about to be pushed
REMOTE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "origin/main")

STATUS=0
for COMMIT in $(git rev-list "$REMOTE_BRANCH"..HEAD); do
  if ! npx nostradiffmus --commit "$COMMIT" --quiet 2>/dev/null; then
    STATUS=1
  fi
done

if [ "$STATUS" -ne 0 ]; then
  echo ""
  echo "⚠️  High-risk changes detected in commits being pushed."
  echo "Consider reviewing the prophecy above."
  echo ""
fi

# Always allow push to proceed
exit 0
`
  };

  return scripts[type];
};

export const installHook = (type: HookType = "pre-commit"): void => {
  try {
    const gitDir = getGitRoot();
    const hooksDir = resolve(gitDir, "hooks");
    const hookPath = resolve(hooksDir, type);

    // Check if hook already exists
    if (existsSync(hookPath)) {
      const existing = readFileSync(hookPath, "utf-8");

      if (existing.includes("Nostradiffmus")) {
        console.log(`✅ Nostradiffmus ${type} hook is already installed`);
        return;
      }

      console.log(`⚠️  A ${type} hook already exists.`);
      console.log(`📄 Location: ${hookPath}`);
      console.log("");
      console.log("Options:");
      console.log("  1. Manually add nostradiffmus to your existing hook");
      console.log("  2. Backup your hook and rerun this command");
      console.log("");
      throw new Error("Hook installation aborted - existing hook found");
    }

    // Write the hook
    const hookScript = generateHookScript(type);
    writeFileSync(hookPath, hookScript, { mode: 0o755 });

    // Ensure it's executable
    chmodSync(hookPath, 0o755);

    console.log(`✅ Successfully installed Nostradiffmus ${type} hook!`);
    console.log(`📄 Location: ${hookPath}`);
    console.log("");
    console.log("🔮 From now on, Nostradiffmus will automatically analyze your changes");
    console.log(`   whenever you run: git ${type === "pre-commit" ? "commit" : "push"}`);
    console.log("");
    console.log("To uninstall:");
    console.log(`   rm ${hookPath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to install hook: ${String(error)}`);
  }
};

export const uninstallHook = (type: HookType = "pre-commit"): void => {
  try {
    const gitDir = getGitRoot();
    const hookPath = resolve(gitDir, "hooks", type);

    if (!existsSync(hookPath)) {
      console.log(`ℹ️  No ${type} hook found - nothing to uninstall`);
      return;
    }

    const existing = readFileSync(hookPath, "utf-8");

    if (!existing.includes("Nostradiffmus")) {
      console.log(`⚠️  The ${type} hook exists but wasn't installed by Nostradiffmus`);
      console.log(`📄 Location: ${hookPath}`);
      throw new Error("Uninstall aborted - hook not managed by Nostradiffmus");
    }

    // Remove the hook file (cross-platform compatible)
    try {
      unlinkSync(hookPath);
      console.log(`✅ Successfully uninstalled Nostradiffmus ${type} hook`);
    } catch (unlinkError) {
      throw new Error(`Failed to remove hook file: ${unlinkError instanceof Error ? unlinkError.message : String(unlinkError)}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to uninstall hook: ${String(error)}`);
  }
};
