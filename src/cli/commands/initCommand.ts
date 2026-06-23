import { existsSync, writeFileSync } from "node:fs";
import type { Command } from "commander";
import { actionTemplate } from "../../templates/actionTemplate.js";

/**
 * Registers the `init` command, which writes a starter action config template for the
 * developer to edit. An existing file is preserved unless `--force` is supplied.
 */
export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Write a starter action config template for editing.")
    .argument("[path]", "destination file path", "action.json")
    .option("-f, --force", "overwrite an existing file if present", false)
    .action((path: string, options: { force: boolean }) => {
      if (existsSync(path) && !options.force) {
        throw new Error(
          `refusing to overwrite existing file ${path}; pass --force to overwrite`,
        );
      }
      writeFileSync(path, `${JSON.stringify(actionTemplate, null, 2)}\n`, "utf8");
      process.stdout.write(`Wrote starter action config to ${path}\n`);
    });
}
