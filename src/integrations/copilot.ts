import { spawnSync } from "node:child_process";
import { getLimits } from "../config/limits";
import { truncateDiff, TruncationResult } from "../git/diff";

const hasCommand = (command: string, args: string[]): boolean => {
  const probe = spawnSync(command, args, { encoding: "utf-8" });
  return probe.status === 0;
};

const resolveTimeoutMs = (): number => {
  const raw = process.env.NOSTRADIFFMUS_COPILOT_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 5_000 ? parsed : 35_000;
};

const readSuggestionText = (result: ReturnType<typeof spawnSync>): string | undefined => {
  const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
  return combined || undefined;
};

const decodeEntities = (text: string): string =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

const normalizeCopilotText = (raw: string): string => {
  const withoutTags = raw.replace(/<[^>]+>/g, " ");
  const withoutMarkdown = withoutTags
    .replace(/^\s*[•●*-]\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return decodeEntities(withoutMarkdown);
};

const runPrompt = (command: string, args: string[]): ReturnType<typeof spawnSync> =>
  spawnSync(command, args, {
    encoding: "utf-8",
    timeout: resolveTimeoutMs(),
    killSignal: "SIGKILL",
    env: {
      ...process.env,
      COPILOT_ALLOW_ALL: process.env.COPILOT_ALLOW_ALL ?? "1"
    }
  });

const debugLog = (message: string): void => {
  if (process.env.NOSTRADIFFMUS_DEBUG === "1") {
    console.error(`[nostradiffmus][copilot] ${message}`);
  }
};

export interface CopilotEnrichmentResult {
  enrichment: string | undefined;
  truncationMetadata: {
    wasTruncated: boolean;
    originalSize: number;
    truncatedSize: number;
  };
}

export const maybeGetCopilotEnrichment = (diff: string): CopilotEnrichmentResult => {
  const copilotPreference = (process.env.NOSTRADIFFMUS_USE_COPILOT ?? "1").toLowerCase();
  const copilotDisabled = copilotPreference === "0" || copilotPreference === "false" || copilotPreference === "off";

  const limits = getLimits();
  const { truncated, wasTruncated, originalSize, truncatedSize } = truncateDiff(diff, limits.maxCopilotChars);

  if (copilotDisabled) {
    debugLog("copilot disabled by NOSTRADIFFMUS_USE_COPILOT");
    return {
      enrichment: undefined,
      truncationMetadata: { wasTruncated, originalSize, truncatedSize }
    };
  }

  const prompt = [
    "Analyze this git diff and provide a concise bug-risk advisory in 1-2 sentences:",
    wasTruncated ? "[Note: Diff truncated for size]" : "",
    truncated
  ].filter(Boolean).join("\n\n");

  const promptArgs = ["-p", prompt, "--allow-all-tools", "--no-ask-user", "--stream", "off", "--no-color", "-s"];
  debugLog(`using timeout=${resolveTimeoutMs()}ms`);

  const attempts: Array<ReturnType<typeof spawnSync>> = [];

  const hasStandaloneCopilot = hasCommand("copilot", ["--help"]);
  const hasGhCopilot = hasCommand("gh", ["copilot", "--help"]);

  if (hasStandaloneCopilot) {
    debugLog("trying standalone copilot binary");
    attempts.push(runPrompt("copilot", promptArgs));
    attempts.push(runPrompt("copilot", promptArgs.filter((arg) => arg !== "-s")));
  }

  if (!hasStandaloneCopilot && hasGhCopilot) {
    debugLog("trying gh copilot wrapper");
    attempts.push(runPrompt("gh", ["copilot", "--", ...promptArgs]));
    attempts.push(runPrompt("gh", ["copilot", "--", ...promptArgs.filter((arg) => arg !== "-s")]));
  }

  attempts.forEach((attempt, index) => {
    const hasText = Boolean(readSuggestionText(attempt));
    const timedOut = attempt.signal === "SIGTERM" || attempt.signal === "SIGKILL";
    debugLog(`attempt ${index + 1}: status=${String(attempt.status)} signal=${attempt.signal ?? "none"} text=${hasText} timedOut=${timedOut}`);
  });

  const success = attempts.find((attempt) => attempt.status === 0 && readSuggestionText(attempt));

  if (!success) {
    debugLog("all copilot attempts failed; falling back to heuristics");
    return {
      enrichment: undefined,
      truncationMetadata: { wasTruncated, originalSize, truncatedSize }
    };
  }

  return {
    enrichment: normalizeCopilotText(readSuggestionText(success) ?? ""),
    truncationMetadata: { wasTruncated, originalSize, truncatedSize }
  };
};
