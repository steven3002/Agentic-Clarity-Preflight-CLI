import type { Command } from "commander";

/**
 * Registers the `init` command, which writes a starter action config template for the
 * developer to edit. Command surface only; the template-writing behaviour is added in a
 * subsequent change.
 */
export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Write a starter action config template for editing.")
    .argument("[path]", "destination file path", "action.json")
    .option("-f, --force", "overwrite an existing file if present", false)
    .action(() => {
      throw new Error("init is not implemented yet");
    });
}
