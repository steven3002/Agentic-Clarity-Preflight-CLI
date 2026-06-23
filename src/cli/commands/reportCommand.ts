import type { Command } from "commander";
import { writeFileSync } from "node:fs";
import { loadConfig } from "../../config/loadConfig.js";
import { renderMarkdownReport } from "../../reporting/markdownReporter.js";
import { runValidators } from "../../validation/runValidators.js";

const EXIT_PASS = 0;
const EXIT_FAIL = 1;

/**
 * Registers the `report` command: load and validate the config, render a Markdown report, and
 * write it to a file (`--out`) or stdout. Exit codes match `check` (0 pass, 1 fail); load
 * failures throw and are mapped to the tool-error exit code by the bin entry.
 */
export function registerReportCommand(program: Command): void {
  program
    .command("report")
    .description("Validate an action config and emit a Markdown report.")
    .argument("<config>", "path to the action config JSON file")
    .option("-o, --out <file>", "write the report to a file instead of stdout")
    .action((configPath: string, options: { out?: string }) => {
      const config = loadConfig(configPath);
      const result = runValidators({ config, configPath });
      const markdown = renderMarkdownReport(result);

      if (options.out) {
        writeFileSync(options.out, markdown);
        process.stdout.write(`Report written to ${options.out}\n`);
      } else {
        process.stdout.write(markdown);
      }

      process.exit(result.passed ? EXIT_PASS : EXIT_FAIL);
    });
}
