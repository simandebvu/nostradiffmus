import { Prediction } from "../types";

export const toJson = (prediction: Prediction): string => {
  return JSON.stringify(
    {
      predictedBugCategory: prediction.predictedBugCategory,
      confidence: prediction.confidence,
      signals: prediction.signals,
      advice: prediction.advice
    },
    null,
    2
  );
};
