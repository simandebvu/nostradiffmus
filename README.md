<div align="center">
  <img src="nostra.png" alt="Nostradiffmus Banner" width="100%">

  # 🔮 Nostradiffmus

  [![Test](https://github.com/simandebvu/nostradiffmus/actions/workflows/test.yml/badge.svg)](https://github.com/simandebvu/nostradiffmus/actions/workflows/test.yml)
  [![npm version](https://img.shields.io/npm/v/nostradiffmus.svg)](https://www.npmjs.com/package/nostradiffmus)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  **Predict your next bug before it manifests.**
</div>

---

Nostradiffmus reads your recent git diffs, predicts the most likely bug category you're about to introduce, and delivers an absurdly dramatic prophecy… followed by real, actionable advice.

Because sometimes the future of your code is already written in the diff.

✨ What It Does

Nostradiffmus analyzes:

Recent commits or staged diffs

File change patterns

Structural code shifts

Async and state mutations

Test coverage drift

It then:

Predicts the most likely bug category

Generates a dramatic prophecy

Provides grounded technical guidance

## 📸 Example Output

### Tragic Tone (Default)
```
🔮 Consulting the sacred diff scrolls...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         THE PROPHECY OF DOOM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hark! I peer into the abyss of your commit,
And lo, darkness stirs within...

⚡ A race condition sleeps in asynchronous shadows,
   Waiting for the precise moment to awaken.

⚡ Promises made but not kept—error paths abandoned,
   Like a bridge half-built over turbulent waters.

⚠ Likely Bug Category: Async Race Conditions
🧠 Advice: Review promise chains and shared state updates.
📊 Confidence: 82%
```

### JSON Output
```json
{
  "predictedBugCategory": "AsyncStateRace",
  "confidence": 0.82,
  "signals": [
    "New async function introduced",
    "Shared mutable state detected"
  ],
  "advice": "Review promise chains and shared state updates...",
  "metadata": {
    "diffSizeChars": 2847,
    "diffSizeKB": 2.8,
    "wasTruncatedForCopilot": false,
    "filesChanged": 3
  }
}
```

**See more examples in [examples/](./examples/) directory** including all tone variations and different bug categories!

🚀 Why This Exists

Developers often:

Move quickly and miss subtle regressions

Refactor async logic without adjusting error paths

Modify state without rethinking side effects

Introduce edge cases when changing validation logic

Nostradiffmus acts as a lightweight, fun “pre-mortem” tool.

It’s not trying to replace tests.
It’s not pretending to be a static analyzer.
It’s a smart, humorous early warning system powered by pattern recognition and Copilot CLI integration.

🧠 How It Works

High level flow:

Capture diff (git diff or git diff --staged)

Extract signals:

Added/removed async keywords

State updates

Conditional logic changes

Deleted tests

Large refactors

Map patterns to bug categories

Generate:

Prophecy narrative

Concrete technical recommendation

Bug categories include:

Async Race Conditions

State Drift

Null/Undefined Access

Validation Edge Cases

Off-By-One Errors

Incomplete Refactors

Test Coverage Gaps

Configuration Regressions

🛠 Installation

### Global Installation (Recommended)

```bash
npm install -g nostradiffmus
```

### Local Development

```bash
git clone https://github.com/simandebvu/nostradiffmus.git
cd nostradiffmus
npm install
npm run build
npm link  # Use globally on your machine
```

### NPX (No Installation)

```bash
npx nostradiffmus --staged
```

🏃 Usage

Run against staged changes:

nostradiffmus


Run against a specific commit:

nostradiffmus --commit HEAD~1


Run in dramatic mode:

nostradiffmus --tone tragic


Tone options:

tragic

cryptic

sarcastic

biblical

clinical

⚙️ CLI Options

| Flag | Description |
| --- | --- |
| --staged | Analyze staged changes only (default when no --commit is provided) |
| --commit \<hash\> | Analyze a specific commit |
| --tone \<mode\> | Change prophecy style |
| --json | Output structured JSON (for CI integration) |
| --quiet | Suppress dramatic output, show only advice (ignored when --json is set) |

⚙️ Environment Variables

Nostradiffmus can be configured via environment variables to handle large diffs:

| Variable | Default | Description |
| --- | --- | --- |
| `NOSTRADIFFMUS_MAX_DIFF_CHARS` | 500000 | Hard limit - reject diffs larger than this (in characters) |
| `NOSTRADIFFMUS_COPILOT_CHARS` | 4000 | Maximum characters sent to Copilot for analysis |
| `NOSTRADIFFMUS_MAX_LINES` | 10000 | Maximum lines processed during signal extraction |
| `NOSTRADIFFMUS_WARN_THRESHOLD` | 100000 | Warn user when diff exceeds this size (in characters) |
| `NOSTRADIFFMUS_GIT_TIMEOUT_MS` | 30000 | Git command timeout in milliseconds (30 seconds) |
| `NOSTRADIFFMUS_USE_COPILOT` | 1 | Set to `0` to disable Copilot integration |
| `NOSTRADIFFMUS_DEBUG` | - | Set to `1` to enable debug logging |

Example:
```bash
NOSTRADIFFMUS_WARN_THRESHOLD=50000 nostradiffmus --staged
```

🔌 GitHub Copilot CLI Integration

Nostradiffmus can optionally use GitHub Copilot CLI to:

Interpret diff intent in natural language

Assess architectural drift

Generate richer context-aware guidance

This makes it ideal for hackathon submissions exploring AI-assisted developer workflows.

Copilot enrichment is enabled by default when GitHub CLI Copilot is available.

If Copilot CLI is not installed or not authenticated, Nostradiffmus automatically falls back to local heuristic analysis.

To disable it explicitly:

NOSTRADIFFMUS_USE_COPILOT=0 nostradiffmus --staged

📦 Examples & Documentation

Check out the [examples/](./examples/) directory for:
- Complete JSON output examples for each bug category
- All 5 tone variations (tragic, cryptic, sarcastic, biblical, clinical)
- Sample scenarios and use cases

🧪 Future Ideas

CI mode: fail build if risk score exceeds threshold

GitHub PR comment bot

“Prophecy Accuracy Tracker”

Team leaderboard of most foretold regressions

Historical bug prediction learning

🎯 Hackathon Angle

Nostradiffmus demonstrates:

AI-augmented developer tooling

Natural language reasoning over diffs

Preventative debugging

Creative developer experience innovation

It blends humor and utility, turning mundane code review into something memorable and shareable.

⚠ Disclaimer

Nostradiffmus does not guarantee accurate predictions.

But when it’s right… you’ll remember it.
