import { readFileSync } from "node:fs";
import type { ZodError } from "zod";
import { actionConfigSchema } from "./schema.js";
import type { ActionConfig } from "./types.js";

/** Base class for all config-loading failures; each maps to the tool-error exit code. */
export class ConfigError extends Error {}

/** The config file path does not exist. */
export class ConfigNotFoundError extends ConfigError {}

/** The config file exists but could not be read. */
export class ConfigReadError extends ConfigError {}

/** The config file is not valid JSON. */
export class ConfigParseError extends ConfigError {}

/** The config file is valid JSON but does not match the action schema. */
export class ConfigSchemaError extends ConfigError {}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function formatSchemaError(path: string, error: ZodError): string {
  const lines = error.issues.map((issue) => {
    const location = issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
    return `  - ${location}: ${issue.message}`;
  });
  return [`config does not match the action schema: ${path}`, ...lines].join("\n");
}

/**
 * Reads, JSON-parses, and schema-validates an action config, surfacing each failure mode
 * as a distinct error type so callers can report precisely what went wrong.
 */
export function loadConfig(path: string): ActionConfig {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ConfigNotFoundError(`config file not found: ${path}`);
    }
    throw new ConfigReadError(`could not read config file ${path}: ${describe(error)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error: unknown) {
    throw new ConfigParseError(`config file is not valid JSON ${path}: ${describe(error)}`);
  }

  const result = actionConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new ConfigSchemaError(formatSchemaError(path, result.error));
  }
  return result.data;
}
