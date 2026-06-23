import { describe, expect, it } from "vitest";
import { validateArgs } from "../../src/validation/rules/validateArgs.js";
import type { ActionConfig } from "../../src/config/types.js";
import type { ValidationContext } from "../../src/validation/types.js";

const ctx = (config: ActionConfig): ValidationContext => ({ config, configPath: "/tmp/action.json" });

describe("validateArgs", () => {
  it("passes when numeric args declare both bounds and non-numeric args are ignored", () => {
    const checks = validateArgs(
      ctx({
        args: [
          { name: "amount", type: "uint", min: "1", max: "1000000" },
          { name: "recipient", type: "principal" },
        ],
      }),
    );
    expect(checks).toHaveLength(1);
    expect(checks[0].passed).toBe(true);
    expect(checks[0].passLabel).toBe("argument bounds present");
  });

  it("fails when a numeric arg has neither bound", () => {
    const checks = validateArgs(ctx({ args: [{ name: "amount", type: "uint" }] }));
    const messages = checks.map((check) => check.failMessage);
    expect(messages).toContain("amount has no minimum bound");
    expect(messages).toContain("amount has no maximum bound");
  });

  it("fails when min is greater than max", () => {
    const checks = validateArgs(ctx({ args: [{ name: "amount", type: "int", min: "10", max: "1" }] }));
    expect(checks.map((check) => check.failMessage)).toContain("amount min is greater than max");
  });

  it("fails when a uint bound is negative", () => {
    const checks = validateArgs(ctx({ args: [{ name: "amount", type: "uint", min: "-1", max: "5" }] }));
    expect(checks.map((check) => check.failMessage)).toContain("amount min must be >= 0 for a uint");
  });

  it("fails when a bound is not an integer", () => {
    const checks = validateArgs(ctx({ args: [{ name: "amount", type: "uint", min: "1", max: "x" }] }));
    expect(checks.map((check) => check.failMessage)).toContain("amount max is not a valid integer");
  });

  it("passes vacuously when there are no numeric args", () => {
    const checks = validateArgs(ctx({ args: [{ name: "recipient", type: "principal" }] }));
    expect(checks[0].passed).toBe(true);
  });
});
