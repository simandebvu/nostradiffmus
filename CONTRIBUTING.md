# Contributing to Nostradiffmus

Thank you for your interest in contributing to Nostradiffmus! 🔮

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nostradiffmus.git
   cd nostradiffmus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Test locally**
   ```bash
   npm run dev -- --staged
   ```

## Project Structure

```
nostradiffmus/
├── src/
│   ├── analyze/        # Signal extraction and classification
│   ├── cli/            # Command-line argument parsing
│   ├── config/         # Configuration and limits
│   ├── core/           # Core analysis logic
│   ├── git/            # Git diff operations
│   ├── hooks/          # Git hook installation
│   ├── integrations/   # GitHub Copilot integration
│   ├── output/         # Output formatting (prophecy, JSON, advice)
│   └── types.ts        # TypeScript type definitions
├── test/               # Test files
├── examples/           # Example outputs
└── dist/               # Compiled JavaScript (generated)
```

## Making Changes

### Adding a New Bug Category

1. Add the category to `src/types.ts`:
   ```typescript
   export type BugCategory =
     | "AsyncStateRace"
     | "YourNewCategory"  // Add here
     // ...
   ```

2. Add the label to `CATEGORY_LABELS`:
   ```typescript
   export const CATEGORY_LABELS: Record<BugCategory, string> = {
     YourNewCategory: "Your New Category Label",
     // ...
   }
   ```

3. Add signals in `src/analyze/signals.ts`:
   ```typescript
   {
     id: "your-new-signal",
     description: "Description of the signal",
     weights: {
       YourNewCategory: 0.8
     }
   }
   ```

4. Add advice logic in `src/output/advice.ts`

5. Add prophecies in `src/output/prophecy.ts` for each tone

6. Add tests in `test/classify.test.ts`

### Adding a New Tone

1. Add to `TONES` array in `src/types.ts`:
   ```typescript
   export const TONES = ["tragic", "cryptic", "your-tone"] as const;
   ```

2. Add prophecies in `src/output/prophecy.ts`:
   ```typescript
   const YOUR_TONE_PROPHECIES: Record<BugCategory, string[]> = {
     // Add prophecies for each category
   }
   ```

3. Update the `renderProphecy` function to handle the new tone

4. Add example output in `examples/your-tone.txt`

## Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run test/signals.test.ts

# Run tests in watch mode
npx vitest
```

### Writing Tests

- Add unit tests for new functions
- Test edge cases (empty inputs, large inputs, null/undefined)
- Mock external dependencies (git commands, Copilot)
- Use descriptive test names

Example:
```typescript
import { describe, it, expect } from "vitest";

describe("yourFunction", () => {
  it("should handle empty input", () => {
    expect(yourFunction("")).toBe(expectedResult);
  });

  it("should handle large input", () => {
    const largeInput = "x".repeat(10000);
    expect(yourFunction(largeInput)).toBeDefined();
  });
});
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **Run tests and build**
   ```bash
   npm test
   npm run build
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure CI checks pass
   - Request review

### Commit Message Format

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Examples:
```
feat: add new bug category for memory leaks
fix: handle empty diff gracefully
docs: update installation instructions
test: add edge case tests for signal extraction
```

## Testing Large Diffs

Use the provided test scripts:

```bash
# Automated test suite
./test-large-diffs.sh

# Manual quick tests
npm run dev -- --staged --json
```

See [TESTING.md](./TESTING.md) for comprehensive testing scenarios.

## Environment Variables for Development

```bash
# Enable debug logging
export NOSTRADIFFMUS_DEBUG=1

# Disable Copilot integration for testing
export NOSTRADIFFMUS_USE_COPILOT=0

# Adjust size limits
export NOSTRADIFFMUS_MAX_DIFF_CHARS=1000000
export NOSTRADIFFMUS_WARN_THRESHOLD=50000
```

## Reporting Issues

When reporting bugs, please include:

1. Nostradiffmus version (`npm list nostradiffmus`)
2. Node.js version (`node --version`)
3. Operating system
4. Steps to reproduce
5. Expected vs actual behavior
6. Sample diff (if applicable)

## Feature Requests

We welcome feature suggestions! Please open an issue with:

- Clear description of the feature
- Use case / motivation
- Example usage
- Any implementation ideas

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions relevant

## Questions?

- Open an issue for questions
- Check existing issues first
- See [README.md](./README.md) for usage help

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Nostradiffmus better! 🔮✨
