# 🔮 Nostradiffmus v0.1.0 - Initial Release

## What is Nostradiffmus?

Predict your next bug before it manifests. Nostradiffmus analyzes git diffs and predicts likely bug categories with dramatic prophecies and practical advice, powered by GitHub Copilot CLI.

---

## 🎉 Highlights

### Core Features

**🔍 Bug Prediction**
- Analyzes git diffs (staged or commits)
- Predicts 8 bug categories with confidence scores
- Extracts 15+ code change signals
- Provides actionable technical advice

**🎭 Five Tone Modes**
- **Tragic**: Shakespearean doom and gloom
- **Cryptic**: Mysterious oracle warnings
- **Sarcastic**: Witty developer commentary
- **Biblical**: Prophetic ancient wisdom
- **Clinical**: Dry technical analysis

**🤖 GitHub Copilot Integration**
- AI-enhanced diff analysis
- Graceful fallback to heuristics
- Configurable timeouts and limits
- Smart diff truncation for large changes

**⚙️ Developer-Friendly**
- Git hooks (pre-commit, pre-push)
- JSON output for CI/CD
- Extensive configuration via environment variables
- Debug mode for troubleshooting

---

## 📦 Installation

### Global Installation
```bash
npm install -g nostradiffmus
```

### Quick Start
```bash
# Analyze staged changes
nostradiffmus

# Try different tones
nostradiffmus --tone sarcastic

# Get JSON output
nostradiffmus --json

# Install git hooks
nostradiffmus --install-hook pre-push
```

---

## 🎯 Bug Categories Detected

1. **Async Race Conditions** - Concurrent state access issues
2. **State Drift** - UI and data layer divergence
3. **Null/Undefined Access** - Missing null checks
4. **Validation Edge Cases** - Input validation gaps
5. **Off-By-One Errors** - Array bounds and loop issues
6. **Incomplete Refactors** - Partially updated code
7. **Test Coverage Gaps** - Missing or deleted tests
8. **Configuration Regressions** - Config file issues

---

## ✨ Example Output

### Tragic Tone
```
🔮 Consulting the sacred diff scrolls...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         THE PROPHECY OF DOOM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hark! I peer into the abyss of your commit,
And lo, darkness stirs within...

⚡ A race condition sleeps in asynchronous shadows,
   Waiting for the precise moment to awaken.

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

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NOSTRADIFFMUS_MAX_DIFF_CHARS` | 500000 | Hard limit for diff size |
| `NOSTRADIFFMUS_COPILOT_CHARS` | 4000 | Max chars sent to Copilot |
| `NOSTRADIFFMUS_MAX_LINES` | 10000 | Max lines processed |
| `NOSTRADIFFMUS_WARN_THRESHOLD` | 100000 | Warn when diff exceeds |
| `NOSTRADIFFMUS_GIT_TIMEOUT_MS` | 30000 | Git command timeout |
| `NOSTRADIFFMUS_USE_COPILOT` | 1 | Enable Copilot (0=disable) |
| `NOSTRADIFFMUS_DEBUG` | - | Enable debug logging (1=on) |

### Example
```bash
NOSTRADIFFMUS_WARN_THRESHOLD=50000 nostradiffmus --staged
```

---

## 📊 Technical Details

### Requirements
- **Node.js**: 18.0.0 or higher
- **Git**: For diff analysis
- **GitHub Copilot CLI** (optional): For AI-enhanced analysis

### Architecture
```
nostradiffmus/
├── src/analyze/      # Signal extraction & classification
├── src/cli/          # Argument parsing
├── src/core/         # Analysis engine
├── src/git/          # Git diff operations
├── src/integrations/ # GitHub Copilot integration
└── src/output/       # Prophecy & JSON formatting
```

### Testing
- **23 passing tests** covering:
  - Argument parsing
  - Signal extraction
  - Bug classification
  - Diff handling
  - Git hooks
  - Timeout management

### CI/CD
- GitHub Actions workflow
- Tests on Node.js 18.x, 20.x, 22.x
- Automated build verification
- CLI smoke tests

---

## 📚 Documentation

- **README.md**: Installation and usage
- **TESTING.md**: Comprehensive testing guide
- **QUICK_TEST.md**: Rapid validation
- **CONTRIBUTING.md**: Contribution guidelines
- **examples/**: 11 example files showcasing features

---

## 🎬 Usage Examples

### Basic Usage
```bash
# Analyze staged changes (default)
nostradiffmus

# Analyze specific commit
nostradiffmus --commit HEAD~1

# Change tone
nostradiffmus --tone biblical
```

### Git Hooks
```bash
# Install pre-push hook
nostradiffmus --install-hook pre-push

# Uninstall
nostradiffmus --uninstall-hook pre-push
```

### CI/CD Integration
```bash
# In your CI pipeline
nostradiffmus --staged --json > analysis.json

# Check confidence threshold
jq -e '.confidence > 0.7' analysis.json && echo "High risk detected!"
```

### Custom Limits
```bash
# Increase diff size limit
NOSTRADIFFMUS_MAX_DIFF_CHARS=1000000 nostradiffmus --staged

# Disable Copilot
NOSTRADIFFMUS_USE_COPILOT=0 nostradiffmus --staged
```

---

## 🚀 What's Next?

### Planned Features
- CI mode with threshold-based build failures
- GitHub PR comment bot
- Prophecy accuracy tracker
- Team leaderboard of predicted bugs
- Historical bug prediction learning
- Additional bug categories
- Custom signal definitions

### Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/nostradiffmus
- **GitHub Repository**: https://github.com/simandebvu/nostradiffmus
- **Issue Tracker**: https://github.com/simandebvu/nostradiffmus/issues
- **DEV.to Submission**: [Coming soon]

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- GitHub Copilot CLI for AI-enhanced analysis
- TypeScript for type safety
- Vitest for testing
- GitHub Actions for CI/CD

---

## 💬 Feedback

Found a bug? Have a suggestion? Want to share your prophecy?

- Open an issue: https://github.com/simandebvu/nostradiffmus/issues
- Start a discussion: https://github.com/simandebvu/nostradiffmus/discussions
- Tweet at me: [@your_twitter] (if applicable)

---

**Thank you for trying Nostradiffmus! May your diffs be ever prophetic. 🔮**

---

*Built with ❤️ and 🔮 by Shingirayi Mandebvu*

---

## 📈 Version History

**v0.1.0** (2026-02-15) - Initial release
- All core features
- GitHub Copilot CLI integration
- 23 passing tests
- Comprehensive documentation
- npm package published

---

**Download**: `npm install -g nostradiffmus@0.1.0`
