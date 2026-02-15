# Example Outputs

This directory contains example outputs from Nostradiffmus for different scenarios and tones.

## JSON Examples

These show the structured output format (`--json` flag):

- **async-race.json** - Detecting async race conditions
- **state-drift.json** - Detecting state management issues
- **test-coverage.json** - Detecting test coverage gaps
- **validation-edge.json** - Detecting validation edge cases

## Tone Examples

These show the dramatic prophecy output in different tones:

- **tragic-tone.txt** - Shakespearean dramatic warnings
- **cryptic-tone.txt** - Mysterious oracle-style predictions
- **sarcastic-tone.txt** - Witty, sarcastic warnings
- **biblical-tone.txt** - Biblical prophecy style
- **clinical-tone.txt** - Dry, technical analysis

## Usage

To generate similar output:

```bash
# JSON output
nostradiffmus --staged --json

# Different tones
nostradiffmus --staged --tone tragic
nostradiffmus --staged --tone cryptic
nostradiffmus --staged --tone sarcastic
nostradiffmus --staged --tone biblical
nostradiffmus --staged --tone clinical
```
