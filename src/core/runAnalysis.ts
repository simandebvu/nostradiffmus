import { classify } from "../analyze/classify";
import { extractSignals } from "../analyze/signals";
import { maybeGetCopilotEnrichment } from "../integrations/copilot";
import { buildAdvice } from "../output/advice";
import { getDiff, getDiffFiles, truncateDiff } from "../git/diff";
import { CliOptions, Prediction } from "../types";
import { getLimits } from "../config/limits";

export const runAnalysis = (options: CliOptions): Prediction => {
  const diff = getDiff(options);

  if (!diff.trim()) {
    throw new Error("No diff content found. Stage changes or choose a commit to analyze.");
  }

  const files = getDiffFiles(diff);
  const signals = extractSignals(diff, files);
  const classification = classify(signals);
  const enrichment = maybeGetCopilotEnrichment(diff);

  const baseAdvice = buildAdvice(classification.predictedBugCategory);
  const advice = enrichment ? `${baseAdvice} Copilot note: ${enrichment}` : baseAdvice;

  // Collect metadata about diff size and truncation
  const limits = getLimits();
  const { wasTruncated } = truncateDiff(diff, limits.maxCopilotChars);

  return {
    predictedBugCategory: classification.predictedBugCategory,
    confidence: classification.confidence,
    signals: signals.map((signal) => signal.description),
    advice,
    categoryLabel: classification.categoryLabel,
    metadata: {
      diffSizeChars: diff.length,
      diffSizeKB: Math.round((diff.length / 1024) * 10) / 10,
      wasTruncatedForCopilot: wasTruncated,
      filesChanged: files.length
    }
  };
};
