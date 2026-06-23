import type { Command } from "commander";
import { loadConfig } from "../../config/loadConfig.js";
import { renderHumanReport } from "../../reporting/humanReporter.js";
import { runValidators } from "../../validation/runValidators.js";

const EXIT_PASS = 0;
const EXIT_FAIL = 1;

/**
 * Registers the `check` command: load and validate the config, print the human-readable
 * report, and exit 0 on pass or 1 on fail. Load failures throw and are mapped to the
 * tool-error exit code by the bin entry.
 */
export function registerCheckCommand(program: Command): void {
  program
    .command("check")
    .description("Validate an action config and report pass/fail.")
    .argument("<config>", "path to the action config JSON file")
    .action((configPath: string) => {
      const config = loadConfig(configPath);
      const result = runValidators({ config, configPath });
      process.stdout.write(`${renderHumanReport(result)}\n`);
      process.exit(result.passed ? EXIT_PASS : EXIT_FAIL);
    });
}
