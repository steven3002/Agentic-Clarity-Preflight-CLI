import type { Check } from "./types.js";

/** Builds a passing check; its label is shown when the overall result passes. */
export function pass(rule: string, id: string, passLabel: string): Check {
  return { rule, id, passed: true, passLabel, failMessage: "" };
}

/** Builds a failing check; its message is shown when the overall result fails. */
export function fail(rule: string, id: string, failMessage: string): Check {
  return { rule, id, passed: false, passLabel: "", failMessage };
}
