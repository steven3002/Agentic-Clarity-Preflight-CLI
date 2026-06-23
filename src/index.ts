#!/usr/bin/env node
import { CommanderError } from "commander";
import { buildProgram } from "./cli/program.js";

const EXIT_TOOL_ERROR = 2;

async function main(): Promise<void> {
  const program = buildProgram();
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  // Help and version requests surface as a CommanderError with exit code 0; let those
  // pass through cleanly. Any other parse or execution failure means the CLI could not
  // evaluate the action config, which is a tool error (exit 2) and is intentionally
  // distinct from a validation FAIL (exit 1).
  if (error instanceof CommanderError) {
    process.exit(error.exitCode === 0 ? 0 : EXIT_TOOL_ERROR);
  }

  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`agentic-clarity-preflight: ${message}\n`);
  process.exit(EXIT_TOOL_ERROR);
});
