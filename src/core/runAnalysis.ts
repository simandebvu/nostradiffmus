import { classify } from "../analyze/classify";
import { extractSignals } from "../analyze/signals";
import { maybeGetCopilotEnrichment } from "../integrations/copilot";
import { buildAdvice } from "../output/advice";
import { getDiff, getDiffFiles } from "../git/diff";
import { CliOptions, Prediction } from "../types";

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

  return {
    predictedBugCategory: classification.predictedBugCategory,
    confidence: classification.confidence,
    signals: signals.map((signal) => signal.description),
    advice,
    categoryLabel: classification.categoryLabel
  };
};
