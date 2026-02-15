# Changelog

All notable changes to Nostradiffmus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-15

### 🎉 Initial Release

The first public release of Nostradiffmus - a CLI tool that predicts likely bug categories from git diffs with dramatic prophecies and practical advice.

### ✨ Features

#### Core Functionality
- **Diff Analysis**: Analyze staged changes or specific commits
- **Bug Prediction**: Predict 8 categories of likely bugs:
  - Async Race Conditions
  - State Drift
  - Null/Undefined Access
  - Validation Edge Cases
  - Off-By-One Errors
  - Incomplete Refactors
  - Test Coverage Gaps
  - Configuration Regressions
- **Signal Detection**: Extract 15+ code change signals from diffs
- **Confidence Scoring**: Weighted confidence scores for predictions

#### Output Modes
- **Dramatic Prophecies**: 5 tone variations:
  - Tragic (Shakespearean doom)
  - Cryptic (Mysterious oracle)
  - Sarcastic (Witty commentary)
  - Biblical (Prophetic warnings)
  - Clinical (Technical analysis)
- **JSON Output**: Structured data for CI/CD integration
- **Quiet Mode**: Advice-only output

#### GitHub Copilot Integration
- **AI Enhancement**: Optional GitHub Copilot CLI integration for richer analysis
- **Graceful Fallback**: Automatic fallback to heuristics if Copilot unavailable
- **Timeout Handling**: Configurable timeouts for Copilot calls
- **Smart Truncation**: Diff truncation for large changes

#### Large Diff Management
- **Size Warnings**: Warn when diffs exceed thresholds
- **Hard Limits**: Prevent resource exhaustion on massive diffs
- **Metadata Tracking**: Diff size and truncation info in JSON output
- **Configurable Limits**: Environment variables for all thresholds

#### Git Hooks
- **Pre-commit Hook**: Analyze before committing
- **Pre-push Hook**: Analyze before pushing
- **Easy Install/Uninstall**: Simple CLI commands

#### CLI Options
- `--staged`: Analyze staged changes (default)
- `--commit <hash>`: Analyze specific commit
- `--tone <mode>`: Choose prophecy style
- `--json`: Output structured JSON
- `--quiet`: Suppress dramatic output
- `--install-hook`: Install git hooks
- `--uninstall-hook`: Remove git hooks

### 🔧 Configuration

Environment variables for customization:
- `NOSTRADIFFMUS_MAX_DIFF_CHARS`: Hard limit (default: 500000)
- `NOSTRADIFFMUS_COPILOT_CHARS`: Copilot truncation limit (default: 4000)
- `NOSTRADIFFMUS_MAX_LINES`: Max lines processed (default: 10000)
- `NOSTRADIFFMUS_WARN_THRESHOLD`: Warning threshold (default: 100000)
- `NOSTRADIFFMUS_GIT_TIMEOUT_MS`: Git command timeout (default: 30000)
- `NOSTRADIFFMUS_USE_COPILOT`: Enable/disable Copilot (default: 1)
- `NOSTRADIFFMUS_DEBUG`: Debug logging (default: off)

### 📚 Documentation

- Comprehensive README with installation and usage
- TESTING.md with detailed testing scenarios
- QUICK_TEST.md for rapid validation
- CONTRIBUTING.md for contributors
- 11 example files showcasing all features

### 🧪 Testing

- 23 passing unit tests
- Test coverage for:
  - Argument parsing
  - Signal extraction
  - Bug classification
  - Diff handling
  - Git hooks
  - Timeout management
- Automated test scripts

### 🔄 CI/CD

- GitHub Actions workflow
- Tests on Node.js 18.x, 20.x, 22.x
- Build verification
- CLI smoke tests
- Large diff handling tests

### 📦 Package

- Published to npm: https://www.npmjs.com/package/nostradiffmus
- TypeScript types included
- Executable: `nostradiffmus`
- Requires: Node.js 18+

### 🎨 Visual Enhancements

- Professional banner image
- Centered README layout
- CI/CD status badges
- Rich example outputs

---

## Links

- **npm Package**: https://www.npmjs.com/package/nostradiffmus
- **GitHub Repository**: https://github.com/simandebvu/nostradiffmus
- **Issues**: https://github.com/simandebvu/nostradiffmus/issues

---

## Future Plans

Potential features for future releases:
- CI mode with threshold-based build failures
- GitHub PR comment bot
- Prophecy accuracy tracker
- Team leaderboard
- Historical bug prediction learning
- Additional bug categories
- More tone variations
- Custom signal definitions

---

**Full Changelog**: https://github.com/simandebvu/nostradiffmus/commits/main
