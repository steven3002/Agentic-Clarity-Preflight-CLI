import type { ValidationResult } from "../validation/types.js";
import { verdictFindings } from "./formatFindings.js";

/**
 * Renders a validation result as the human-readable console report: a `PASS`/`FAIL` header
 * followed by a bulleted list — positive statements on pass, problems to fix on fail.
 */
export function renderHumanReport(result: ValidationResult): string {
  const verdict = result.passed ? "PASS" : "FAIL";
  const findings = verdictFindings(result).map((line) => `- ${line}`);
  return [`${verdict} ${result.actionId}`, "", ...findings].join("\n");
}
