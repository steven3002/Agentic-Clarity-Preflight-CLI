import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fail, pass } from "../check.js";
import type { Rule } from "../types.js";

const RULE = "preflight";

/**
 * Requires a Clarinet simnet preflight test to be declared and to exist on disk. The path
 * is resolved relative to the config file's directory. This is a static existence check;
 * the CLI does not execute the test.
 */
export const validatePreflight: Rule = ({ config, configPath }) => {
  const testPath = config.preflight?.clarinetTest;
  if (!testPath || testPath.trim().length === 0) {
    return [fail(RULE, "preflight.path", "no Clarinet simnet preflight test was found")];
  }

  const resolved = resolve(dirname(configPath), testPath);
  if (!existsSync(resolved)) {
    return [fail(RULE, "preflight.path", `declared Clarinet test path does not exist: ${testPath}`)];
  }

  return [pass(RULE, "preflight.path", "Clarinet simnet preflight test path found")];
};
