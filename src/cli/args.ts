import { CliOptions, TONES, Tone } from "../types";
import { loadFileConfig } from "../config/fileConfig";

const usageText = `
🔮 Nostradiffmus — Predict bugs before they manifest

Analyzes git diffs to predict likely bug categories using pattern recognition
and optional GitHub Copilot integration. Get dramatic prophecies and actionable
technical advice before you commit.

USAGE
  nostradiffmus [options]

OPTIONS
  --staged              Analyze staged changes (default)
  --commit <hash>       Analyze specific commit (e.g., HEAD~1)
  --tone <mode>         Prophecy style: tragic, cryptic, sarcastic, biblical, clinical
  --json                Output structured JSON (great for CI/CD)
  --quiet               Suppress prophecy, show only category + advice
  --install-hook [type] Install git hook (pre-commit or pre-push, default: pre-commit)
  --uninstall-hook [type] Uninstall git hook
  --help, -h            Show this help

EXAMPLES
  # Analyze staged changes with dramatic prophecy
  nostradiffmus

  # Check a specific commit with sarcastic tone
  nostradiffmus --commit HEAD~1 --tone sarcastic

  # Get JSON output for CI/CD pipeline
  nostradiffmus --staged --json | jq '.predictedBugCategory'

  # Quiet mode for minimal output
  nostradiffmus --quiet

  # Install as pre-commit hook (auto-run on every commit)
  nostradiffmus --install-hook

  # Install as pre-push hook
  nostradiffmus --install-hook pre-push

ENVIRONMENT VARIABLES
  NOSTRADIFFMUS_WARN_THRESHOLD=100000     Warn when diff exceeds size (chars)
  NOSTRADIFFMUS_MAX_DIFF_CHARS=500000     Maximum diff size before rejection
  NOSTRADIFFMUS_COPILOT_CHARS=4000        Max chars sent to Copilot
  NOSTRADIFFMUS_USE_COPILOT=1             Enable/disable Copilot (1/0)
  NOSTRADIFFMUS_DEBUG=1                   Enable debug logging

CONFIGURATION FILE
  Create .nostradiffmus.json in your project root:
  {
    "warnThreshold": 100000,
    "tone": "sarcastic",
    "quiet": false
  }

BUG CATEGORIES
  • AsyncStateRace       - Async operations with shared state mutations
  • StateDrift           - Inconsistent state management patterns
  • NullUndefinedAccess  - Missing null/undefined guards
  • ValidationEdgeCases  - Validation logic gaps
  • OffByOneErrors       - Index/boundary arithmetic issues
  • IncompleteRefactors  - Large structural changes without tests
  • TestCoverageGaps     - Code changes without test updates
  • ConfigurationRegressions - Config file modifications

LEARN MORE
  GitHub: https://github.com/yourusername/nostradiffmus
  Docs:   https://github.com/yourusername/nostradiffmus#readme
`;

export const getUsageText = (): string => usageText.trim();

export const parseArgs = (argv: string[]): CliOptions => {
  // Load defaults from config file (if exists)
  const fileConfig = loadFileConfig();

  const options: CliOptions = {
    staged: true,
    tone: fileConfig.tone ?? "tragic",
    json: false,
    quiet: fileConfig.quiet ?? false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--staged") {
      options.staged = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--quiet") {
      options.quiet = true;
      continue;
    }

    if (arg === "--install-hook") {
      const nextArg = argv[index + 1];
      if (nextArg && !nextArg.startsWith("--")) {
        if (nextArg !== "pre-commit" && nextArg !== "pre-push") {
          throw new Error("--install-hook must be 'pre-commit' or 'pre-push'");
        }
        options.installHook = nextArg;
        index += 1;
      } else {
        options.installHook = "pre-commit";
      }
      continue;
    }

    if (arg === "--uninstall-hook") {
      const nextArg = argv[index + 1];
      if (nextArg && !nextArg.startsWith("--")) {
        if (nextArg !== "pre-commit" && nextArg !== "pre-push") {
          throw new Error("--uninstall-hook must be 'pre-commit' or 'pre-push'");
        }
        options.uninstallHook = nextArg;
        index += 1;
      } else {
        options.uninstallHook = "pre-commit";
      }
      continue;
    }

    if (arg === "--commit") {
      const commit = argv[index + 1];
      if (!commit || commit.startsWith("--")) {
        throw new Error("Missing value for --commit");
      }
      options.commit = commit;
      options.staged = false;
      index += 1;
      continue;
    }

    if (arg === "--tone") {
      const tone = argv[index + 1] as Tone | undefined;
      if (!tone || tone.startsWith("--")) {
        throw new Error("Missing value for --tone");
      }
      if (!TONES.includes(tone)) {
        throw new Error(`Invalid tone: ${tone}`);
      }
      options.tone = tone;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
};
