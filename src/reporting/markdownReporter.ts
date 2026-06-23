import type { ValidationResult } from "../validation/types.js";
import { verdictFindings } from "./formatFindings.js";

/**
 * Renders a validation result as a Markdown report suitable for pull requests, docs, and the
 * demo. The verdict and the displayed findings reuse the shared selection logic so the
 * Markdown and console outputs never diverge.
 */
export function renderMarkdownReport(result: ValidationResult): string {
  const verdict = result.passed ? "✅ PASS" : "❌ FAIL";
  const findingsHeading = result.passed ? "Passed checks" : "Issues to fix";
  const findings = verdictFindings(result).map((line) => `- ${line}`);

  return [
    "# Preflight Report",
    "",
    `**Action:** \`${result.actionId}\``,
    "",
    `**Result:** ${verdict}`,
    "",
    `## ${findingsHeading}`,
    "",
    ...findings,
    "",
  ].join("\n");
}
