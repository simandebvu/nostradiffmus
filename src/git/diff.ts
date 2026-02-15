import { spawnSync } from "node:child_process";
import { CliOptions } from "../types";
import { getLimits } from "../config/limits";

const runGit = (args: string[], timeoutMs: number): string => {
  const result = spawnSync("git", args, {
    encoding: "utf-8",
    timeout: timeoutMs,
    killSignal: "SIGTERM"
  });

  // Treat any SIGTERM (signal or error message) as a timeout
  if (
    result.signal === "SIGTERM" ||
    (result.error && result.error.message.includes("SIGTERM"))
  ) {
    throw new Error(
      `Git command timed out after ${timeoutMs}ms. Try increasing NOSTRADIFFMUS_GIT_TIMEOUT_MS.`
    );
  }

  if (result.error) {
    throw new Error(`Failed to run git: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const message = result.stderr?.trim() || "Unknown git error";
    throw new Error(message);
  }

  return result.stdout;
};

export const getDiff = (options: CliOptions): string => {
  const limits = getLimits();

  const diff = options.commit
    ? runGit(["show", "--format=", "--no-color", options.commit], limits.gitTimeoutMs)
    : runGit(["diff", "--staged", "--no-color"], limits.gitTimeoutMs);

  if (diff.length > limits.maxDiffChars) {
    throw new Error(
      `Diff too large (${diff.length} chars, max ${limits.maxDiffChars}). ` +
      `Consider analyzing a smaller commit or adjusting NOSTRADIFFMUS_MAX_DIFF_CHARS.`
    );
  }

  if (diff.length > limits.warnThreshold && !options.quiet && !options.json) {
    console.warn(
      `⚠️  Large diff detected (${(diff.length / 1000).toFixed(1)}KB). Analysis may be less precise.`
    );
  }

  return diff;
};

export const getDiffFiles = (diff: string): string[] => {
  const files = new Set<string>();
  const regex = /^diff --git a\/(.+?) b\/(.+)$/gm;

  for (const match of diff.matchAll(regex)) {
    files.add(match[2]);
  }

  return [...files];
};

export interface TruncationResult {
  truncated: string;
  wasTruncated: boolean;
  originalSize: number;
  truncatedSize: number;
}

export const truncateDiff = (diff: string, maxChars: number): TruncationResult => {
  if (diff.length <= maxChars) {
    return {
      truncated: diff,
      wasTruncated: false,
      originalSize: diff.length,
      truncatedSize: diff.length
    };
  }

  // Strategy: Keep file headers + representative samples from each file
  const fileSections = diff.split(/(?=^diff --git)/m).filter((section) => section.trim());

  // Fallback: if no file sections were detected, perform a simple truncation
  if (fileSections.length === 0) {
    const truncated = diff.slice(0, maxChars);
    return {
      truncated,
      wasTruncated: true,
      originalSize: diff.length,
      truncatedSize: truncated.length
    };
  }
  const results: string[] = [];
  let totalChars = 0;
  const charsPerFile = Math.floor(maxChars / fileSections.length);

  for (const section of fileSections) {
    const lines = section.split("\n");
    let sectionResult = "";
    let sectionChars = 0;

    // Always keep the file header (first 5 lines typically: diff, index, ---, +++, @@)
    const headerEndIndex = Math.min(5, lines.length);
    for (let i = 0; i < headerEndIndex; i++) {
      sectionResult += lines[i] + "\n";
      sectionChars += lines[i].length + 1;
    }

    // Sample remaining lines proportionally
    const remainingLines = lines.slice(headerEndIndex);
    const remainingBudget = charsPerFile - sectionChars;

    if (remainingBudget > 0 && remainingLines.length > 0) {
      let sampled = 0;
      for (const line of remainingLines) {
        if (sampled + line.length + 1 > remainingBudget) break;
        sectionResult += line + "\n";
        sampled += line.length + 1;
      }

      if (sampled < remainingLines.join("\n").length) {
        sectionResult += "... [truncated]\n";
      }
    }

    results.push(sectionResult);
    totalChars += sectionResult.length;

    if (totalChars >= maxChars) break;
  }

  const truncated = results.join("");

  return {
    truncated,
    wasTruncated: true,
    originalSize: diff.length,
    truncatedSize: truncated.length
  };
};
