import { CliOptions, TONES, Tone } from "../types";

const usageText = `
Nostradiffmus — Predict likely bug categories from your git diff.

Usage:
  nostradiffmus [--staged] [--commit <hash>] [--tone <mode>] [--json] [--quiet]

Options:
  --staged           Analyze staged changes only (default when no --commit is passed)
  --commit <hash>    Analyze a specific commit via git show
  --tone <mode>      tragic | cryptic | sarcastic | biblical | clinical
  --json             Output structured JSON
  --quiet            Suppress prophecy text and print only category + advice
  --help, -h         Show this help
`;

export const getUsageText = (): string => usageText.trim();

export const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    staged: true,
    tone: "tragic",
    json: false,
    quiet: false,
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
