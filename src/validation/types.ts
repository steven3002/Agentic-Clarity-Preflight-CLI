import type { ActionConfig } from "../config/types.js";

/** A single verdict line produced by a rule. */
export interface Check {
  /** The rule that produced this check (e.g. "args"). */
  rule: string;
  /** Stable identifier for the check (e.g. "args.amount.max"). */
  id: string;
  passed: boolean;
  /** Shown when the overall result passes. */
  passLabel: string;
  /** Shown when this check fails on a failing result. */
  failMessage: string;
}

/** Aggregate verdict across all rule checks. */
export interface ValidationResult {
  actionId: string;
  /** True only if every check passed. */
  passed: boolean;
  checks: Check[];
}

/** Input passed to every rule. `configPath` enables preflight path resolution. */
export interface ValidationContext {
  config: ActionConfig;
  configPath: string;
}

/** A rule maps a context to zero or more checks. */
export type Rule = (ctx: ValidationContext) => Check[];
