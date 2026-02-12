import { spawnSync } from "node:child_process";
import { CliOptions } from "../types";

const runGit = (args: string[]): string => {
  const result = spawnSync("git", args, {
    encoding: "utf-8"
  });

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
  if (options.commit) {
    return runGit(["show", "--format=", "--no-color", options.commit]);
  }

  return runGit(["diff", "--staged", "--no-color"]);
};

export const getDiffFiles = (diff: string): string[] => {
  const files = new Set<string>();
  const regex = /^diff --git a\/(.+?) b\/(.+)$/gm;

  for (const match of diff.matchAll(regex)) {
    files.add(match[2]);
  }

  return [...files];
};
