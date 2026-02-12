#!/usr/bin/env node

import { parseArgs, getUsageText } from "./cli/args";
import { runAnalysis } from "./core/runAnalysis";
import { renderProphecy } from "./output/prophecy";
import { toJson } from "./output/json";
import { installHook, uninstallHook } from "./hooks/install";

const main = (): void => {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      console.log(getUsageText());
      return;
    }

    if (options.installHook) {
      installHook(options.installHook);
      return;
    }

    if (options.uninstallHook) {
      uninstallHook(options.uninstallHook);
      return;
    }

    const result = runAnalysis(options);

    if (options.json) {
      console.log(toJson(result));
      return;
    }

    if (options.quiet) {
      console.log(`⚠ Likely Bug Category: ${result.categoryLabel}`);
      console.log(`🧠 Advice: ${result.advice}`);
      return;
    }

    console.log(renderProphecy(options.tone, result.predictedBugCategory));
    console.log("");
    console.log(`⚠ Likely Bug Category: ${result.categoryLabel}`);
    console.log(`🧠 Advice: ${result.advice}`);
    console.log(`📊 Confidence: ${Math.round(result.confidence * 100)}%`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`nostradiffmus: ${message}`);
    process.exitCode = 1;
  }
};

main();
