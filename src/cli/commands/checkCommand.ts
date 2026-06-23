import type { Command } from "commander";

/**
 * Registers the `check` command, which validates an action config and reports pass/fail
 * with a CI-friendly exit code. Command surface only; the validation pipeline is added in
 * a subsequent change.
 */
export function registerCheckCommand(program: Command): void {
  program
    .command("check")
    .description("Validate an action config and report pass/fail.")
    .argument("<config>", "path to the action config JSON file")
    .action(() => {
      throw new Error("check is not implemented yet");
    });
}
