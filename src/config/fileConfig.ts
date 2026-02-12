import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Tone, TONES } from "../types";

export interface FileConfig {
  warnThreshold?: number;
  maxDiffChars?: number;
  copilotChars?: number;
  tone?: Tone;
  quiet?: boolean;
  useCopilot?: boolean;
}

const findConfig = (): FileConfig | null => {
  const cwd = process.cwd();

  // Try .nostradiffmus.json
  const configPath = resolve(cwd, ".nostradiffmus.json");
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Warning: Failed to parse .nostradiffmus.json: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Try package.json
  const packagePath = resolve(cwd, "package.json");
  if (existsSync(packagePath)) {
    try {
      const content = readFileSync(packagePath, "utf-8");
      const pkg = JSON.parse(content);
      if (pkg.nostradiffmus) {
        return pkg.nostradiffmus;
      }
    } catch (error) {
      // Silent fail for package.json - it's optional
    }
  }

  return null;
};

const validateConfig = (config: FileConfig): void => {
  if (config.tone && !TONES.includes(config.tone)) {
    throw new Error(`Invalid tone in config: ${config.tone}. Must be one of: ${TONES.join(", ")}`);
  }

  const numericFields = ["warnThreshold", "maxDiffChars", "copilotChars"] as const;
  for (const field of numericFields) {
    if (config[field] !== undefined && (!Number.isFinite(config[field]) || config[field]! < 0)) {
      throw new Error(`Invalid ${field} in config: must be a positive number`);
    }
  }
};

export const loadFileConfig = (): FileConfig => {
  const config = findConfig();

  if (!config) {
    return {};
  }

  validateConfig(config);

  return config;
};
