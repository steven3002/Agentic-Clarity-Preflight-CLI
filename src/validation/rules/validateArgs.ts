import { NUMERIC_ARG_TYPES } from "../../config/schema.js";
import type { ActionConfig } from "../../config/types.js";
import { fail, pass } from "../check.js";
import type { Rule } from "../types.js";

const RULE = "args";

type Arg = NonNullable<ActionConfig["args"]>[number];

const isNumeric = (type: Arg["type"]): boolean =>
  (NUMERIC_ARG_TYPES as readonly string[]).includes(type);

function parseInteger(value: string): bigint | undefined {
  try {
    return BigInt(value);
  } catch {
    return undefined;
  }
}

/**
 * Requires every numeric argument to declare both a `min` and a `max`, that both parse as
 * integers, that `uint` bounds are non-negative, and that `min <= max`. Unbounded numeric
 * inputs are the primary risk for an agent-exposed asset-moving action.
 */
export const validateArgs: Rule = ({ config }) => {
  const args = config.args ?? [];
  const problems: Array<{ id: string; message: string }> = [];

  for (const arg of args) {
    if (!isNumeric(arg.type)) {
      continue;
    }
    const label = arg.name.length > 0 ? arg.name : "(unnamed arg)";
    const { min, max } = arg;

    if (min === undefined) {
      problems.push({ id: `args.${arg.name}.min`, message: `${label} has no minimum bound` });
    }
    if (max === undefined) {
      problems.push({ id: `args.${arg.name}.max`, message: `${label} has no maximum bound` });
    }
    if (min === undefined || max === undefined) {
      continue;
    }

    const minValue = parseInteger(min);
    const maxValue = parseInteger(max);
    if (minValue === undefined) {
      problems.push({ id: `args.${arg.name}.min`, message: `${label} min is not a valid integer` });
    }
    if (maxValue === undefined) {
      problems.push({ id: `args.${arg.name}.max`, message: `${label} max is not a valid integer` });
    }
    if (minValue === undefined || maxValue === undefined) {
      continue;
    }

    if (arg.type === "uint" && minValue < 0n) {
      problems.push({ id: `args.${arg.name}.min`, message: `${label} min must be >= 0 for a uint` });
    }
    if (minValue > maxValue) {
      problems.push({ id: `args.${arg.name}.range`, message: `${label} min is greater than max` });
    }
  }

  if (problems.length === 0) {
    return [pass(RULE, "args", "argument bounds present")];
  }
  return problems.map((problem) => fail(RULE, problem.id, problem.message));
};
