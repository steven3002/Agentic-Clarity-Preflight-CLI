import type { Command } from "commander";

/**
 * Registers the `report` command, which validates an action config and emits a Markdown
 * report. Command surface only; the reporting pipeline is added in a subsequent change.
 */
export function registerReportCommand(program: Command): void {
  program
    .command("report")
    .description("Validate an action config and emit a Markdown report.")
    .argument("<config>", "path to the action config JSON file")
    .option("-o, --out <file>", "write the report to a file instead of stdout")
    .action(() => {
      throw new Error("report is not implemented yet");
    });
}
