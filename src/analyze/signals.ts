import { Signal } from "../types";

const getChangedLines = (diff: string): { added: string[]; removed: string[] } => {
  const lines = diff.split("\n");
  const added: string[] = [];
  const removed: string[] = [];

  for (const line of lines) {
    if (line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }

    if (line.startsWith("+")) {
      added.push(line.slice(1));
    }

    if (line.startsWith("-")) {
      removed.push(line.slice(1));
    }
  }

  return { added, removed };
};

const countMatches = (lines: string[], pattern: RegExp): number => lines.filter((line) => pattern.test(line)).length;

export const extractSignals = (diff: string, files: string[]): Signal[] => {
  const { added, removed } = getChangedLines(diff);
  const signals: Signal[] = [];

  const asyncPattern = /\b(async\s+function|await\s+|Promise\.)\b/;
  const statePattern = /\b(setState\(|dispatch\(|useState\(|state\.|store\.|\.push\(|\.splice\()\b/;
  const errorPattern = /\b(catch\s*\(|throw\s+|reject\(|console\.error)\b/;
  const validationPattern = /\b(validate|schema|zod|yup|if\s*\(|switch\s*\()\b/;
  const offByOnePattern = /\b(length\s*[-+]|<=|>=|index|cursor|offset|slice\()\b/;
  const nullPattern = /\b(null|undefined|\?\.|\!\.)\b/;

  const addedAsync = countMatches(added, asyncPattern);
  const removedErrorHandling = countMatches(removed, errorPattern);
  const addedStateMutations = countMatches(added, statePattern);
  const nullChecksChanged = countMatches(added, nullPattern) + countMatches(removed, nullPattern);
  const validationChanges = countMatches(added, validationPattern) + countMatches(removed, validationPattern);
  const offByOneChanges = countMatches(added, offByOnePattern) + countMatches(removed, offByOnePattern);

  const testFileTouched = files.some((file) => /(test|spec)\.(ts|tsx|js|jsx)$/.test(file));
  const testFileRemoved = diff.split("\n").some((line) => line.startsWith("deleted file mode") && testFileTouched);
  const configTouched = files.some((file) => /(package\.json|tsconfig\.json|\.env|config)/.test(file));
  const largeRefactor = added.length + removed.length > 220 || files.length >= 7;

  if (addedAsync > 0 && (addedStateMutations > 0 || removedErrorHandling > 0)) {
    signals.push({
      id: "async-flow-shift",
      description: "Async flow changed alongside shared state or error path edits",
      weights: {
        AsyncStateRace: 4,
        StateDrift: 2
      }
    });
  }

  if (addedStateMutations > 0) {
    signals.push({
      id: "state-mutation",
      description: "State mutation patterns changed",
      weights: {
        StateDrift: 4,
        AsyncStateRace: 1
      }
    });
  }

  if (nullChecksChanged > 0) {
    signals.push({
      id: "null-guard-drift",
      description: "Null/undefined guard behavior changed",
      weights: {
        NullUndefinedAccess: 4,
        ValidationEdgeCases: 1
      }
    });
  }

  if (validationChanges > 0) {
    signals.push({
      id: "validation-logic-shift",
      description: "Validation or branching logic changed",
      weights: {
        ValidationEdgeCases: 4,
        OffByOneErrors: 1
      }
    });
  }

  if (offByOneChanges > 0) {
    signals.push({
      id: "boundary-math-shift",
      description: "Boundary-sensitive indexing or range logic changed",
      weights: {
        OffByOneErrors: 4
      }
    });
  }

  if (testFileRemoved) {
    signals.push({
      id: "deleted-tests",
      description: "Test file removal detected",
      weights: {
        TestCoverageGaps: 5,
        IncompleteRefactors: 2
      }
    });
  }

  if (!testFileTouched && (added.length + removed.length > 80)) {
    signals.push({
      id: "no-test-companion",
      description: "Large code change landed without matching test file edits",
      weights: {
        TestCoverageGaps: 4
      }
    });
  }

  if (configTouched) {
    signals.push({
      id: "config-edits",
      description: "Configuration-related files changed",
      weights: {
        ConfigurationRegressions: 4
      }
    });
  }

  if (largeRefactor) {
    signals.push({
      id: "broad-refactor",
      description: "Broad structural change detected",
      weights: {
        IncompleteRefactors: 4,
        TestCoverageGaps: 2
      }
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: "low-signal",
      description: "Only subtle structural shifts detected",
      weights: {
        IncompleteRefactors: 2
      }
    });
  }

  return signals;
};
