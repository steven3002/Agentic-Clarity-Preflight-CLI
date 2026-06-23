import { createRequire } from "node:module";
import { Command } from "commander";
import { registerInitCommand } from "./commands/initCommand.js";
import { registerCheckCommand } from "./commands/checkCommand.js";
import { registerReportCommand } from "./commands/reportCommand.js";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json") as { version: string };

/**
 * Builds the command-line program with the three preflight commands registered.
 *
 * `exitOverride` is enabled so the bin entry, rather than commander, owns the process exit
 * code. This keeps the CI contract (0 pass, 1 fail, 2 tool error) defined in a single place.
 */
export function buildProgram(): Command {
  const program = new Command();

  program
    .name("agentic-clarity-preflight")
    .description("Local preflight gate for agent-exposed Clarity contract actions.")
    .version(version);

  program.exitOverride();

  registerInitCommand(program);
  registerCheckCommand(program);
  registerReportCommand(program);

  return program;
}
