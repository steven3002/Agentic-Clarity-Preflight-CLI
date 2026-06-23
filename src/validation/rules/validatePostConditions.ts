import { fail, pass } from "../check.js";
import type { Check, Rule } from "../types.js";

const RULE = "post-conditions";

/**
 * For asset-moving actions (those declaring `assetMovement`), requires a well-formed asset
 * movement declaration and a post-condition policy that is both required and set to Deny
 * mode. Actions that do not move assets are not subject to these checks.
 */
export const validatePostConditions: Rule = ({ config }) => {
  const movement = config.assetMovement;
  if (!movement) {
    return [];
  }

  const checks: Check[] = [];
  const argNames = new Set((config.args ?? []).map((arg) => arg.name));

  const movementProblems: string[] = [];
  if (!movement.asset || movement.asset.trim().length === 0) {
    movementProblems.push("assetMovement.asset is missing");
  }
  if (!movement.amountFromArg) {
    movementProblems.push("assetMovement.amountFromArg is missing");
  } else if (!argNames.has(movement.amountFromArg)) {
    movementProblems.push(
      `assetMovement.amountFromArg "${movement.amountFromArg}" does not reference a declared argument`,
    );
  }
  if (movementProblems.length === 0) {
    checks.push(pass(RULE, "post-conditions.movement", "SIP-010 asset movement policy declared"));
  } else {
    movementProblems.forEach((message, index) => {
      checks.push(fail(RULE, `post-conditions.movement.${index}`, message));
    });
  }

  const policy = config.postConditionPolicy;
  if (policy?.required === true) {
    checks.push(pass(RULE, "post-conditions.required", "post-condition policy required"));
  } else if (!policy) {
    checks.push(
      fail(RULE, "post-conditions.required", "asset movement is declared but no post-condition policy is required"),
    );
  } else {
    checks.push(
      fail(RULE, "post-conditions.required", "postConditionPolicy.required must be true for asset-moving actions"),
    );
  }

  if (policy?.mode === "deny") {
    checks.push(pass(RULE, "post-conditions.mode", "postConditionMode is deny"));
  } else {
    checks.push(fail(RULE, "post-conditions.mode", "postConditionMode must be deny for asset-moving actions"));
  }

  return checks;
};
