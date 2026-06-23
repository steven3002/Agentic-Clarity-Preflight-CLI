import { fail, pass } from "../check.js";
import type { Rule } from "../types.js";

const RULE = "metadata";

const present = (value: string | undefined): boolean =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Requires the identity metadata an agent needs to understand the action: a non-empty id,
 * description, and contract name/function. Absence is a policy failure, not a malformed
 * config, so it is reported here rather than rejected by the schema.
 */
export const validateMetadata: Rule = ({ config }) => {
  const problems: Array<{ id: string; message: string }> = [];

  if (!present(config.id)) {
    problems.push({ id: "metadata.id", message: "id is missing" });
  }
  if (!present(config.description)) {
    problems.push({ id: "metadata.description", message: "description is missing" });
  }
  if (!present(config.contract?.name)) {
    problems.push({ id: "metadata.contract.name", message: "contract.name is missing" });
  }
  if (!present(config.contract?.function)) {
    problems.push({ id: "metadata.contract.function", message: "contract.function is missing" });
  }

  if (problems.length === 0) {
    return [pass(RULE, "metadata", "action metadata present")];
  }
  return problems.map((problem) => fail(RULE, problem.id, problem.message));
};
