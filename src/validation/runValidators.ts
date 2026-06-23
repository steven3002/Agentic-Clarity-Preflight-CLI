import { validateMetadata } from "./rules/validateMetadata.js";
import { validateArgs } from "./rules/validateArgs.js";
import { validateNetwork } from "./rules/validateNetwork.js";
import { validatePostConditions } from "./rules/validatePostConditions.js";
import { validatePreflight } from "./rules/validatePreflight.js";
import type { Rule, ValidationContext, ValidationResult } from "./types.js";

/**
 * Ordered rule pipeline. The order determines the order of lines in the report, which is
 * chosen to read as a coherent checklist.
 */
const RULES: readonly Rule[] = [
  validateMetadata,
  validateArgs,
  validateNetwork,
  validatePostConditions,
  validatePreflight,
];

/** Runs every rule against the context and aggregates the result. */
export function runValidators(context: ValidationContext): ValidationResult {
  const checks = RULES.flatMap((rule) => rule(context));
  return {
    actionId: context.config.id ?? "(unknown action)",
    passed: checks.every((check) => check.passed),
    checks,
  };
}
