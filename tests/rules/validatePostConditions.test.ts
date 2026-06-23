import { describe, expect, it } from "vitest";
import { validatePostConditions } from "../../src/validation/rules/validatePostConditions.js";
import type { ActionConfig } from "../../src/config/types.js";
import type { ValidationContext } from "../../src/validation/types.js";

const ctx = (config: ActionConfig): ValidationContext => ({ config, configPath: "/tmp/action.json" });

const compliant: ActionConfig = {
  args: [{ name: "amount", type: "uint", min: "1", max: "9" }],
  assetMovement: { type: "sip010", asset: "sbtc", amountFromArg: "amount" },
  postConditionPolicy: { required: true, mode: "deny", asset: "sbtc", amountFromArg: "amount" },
};

describe("validatePostConditions", () => {
  it("emits no checks for an action that does not move assets", () => {
    expect(validatePostConditions(ctx({}))).toEqual([]);
  });

  it("passes when movement is well-formed and the policy is required and Deny", () => {
    const checks = validatePostConditions(ctx(compliant));
    expect(checks.every((check) => check.passed)).toBe(true);
    expect(checks.map((check) => check.passLabel)).toEqual([
      "SIP-010 asset movement policy declared",
      "post-condition policy required",
      "postConditionMode is deny",
    ]);
  });

  it("fails when asset movement is declared but no post-condition policy is present", () => {
    const checks = validatePostConditions(
      ctx({
        args: [{ name: "amount", type: "uint", min: "1", max: "9" }],
        assetMovement: { type: "sip010", asset: "sbtc", amountFromArg: "amount" },
      }),
    );
    const messages = checks.map((check) => check.failMessage);
    expect(messages).toContain("asset movement is declared but no post-condition policy is required");
    expect(messages).toContain("postConditionMode must be deny for asset-moving actions");
  });

  it("fails when the post-condition mode is not deny", () => {
    const checks = validatePostConditions(
      ctx({ ...compliant, postConditionPolicy: { required: true, mode: "allow" } }),
    );
    expect(checks.map((check) => check.failMessage)).toContain(
      "postConditionMode must be deny for asset-moving actions",
    );
  });

  it("fails when amountFromArg does not reference a declared argument", () => {
    const checks = validatePostConditions(
      ctx({ ...compliant, assetMovement: { type: "sip010", asset: "sbtc", amountFromArg: "ghost" } }),
    );
    expect(checks.some((check) => check.failMessage.includes("does not reference a declared argument"))).toBe(true);
  });
});
