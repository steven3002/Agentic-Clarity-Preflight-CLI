import type { ValidationResult } from "../validation/types.js";

/**
 * Selects the lines to display for a result: the positive labels of all checks when the
 * result passes, or the failure messages of the failing checks when it fails. Shared by
 * every reporter so the human and Markdown outputs stay consistent.
 */
export function verdictFindings(result: ValidationResult): string[] {
  if (result.passed) {
    return result.checks
      .filter((check) => check.passLabel.length > 0)
      .map((check) => check.passLabel);
  }
  return result.checks
    .filter((check) => !check.passed)
    .map((check) => check.failMessage);
}
