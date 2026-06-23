import { describe, expect, it } from "vitest";
import { validateMetadata } from "../../src/validation/rules/validateMetadata.js";
import type { ActionConfig } from "../../src/config/types.js";
import type { ValidationContext } from "../../src/validation/types.js";

const ctx = (config: ActionConfig): ValidationContext => ({ config, configPath: "/tmp/action.json" });

describe("validateMetadata", () => {
  it("passes when id, description, and contract name/function are present", () => {
    const checks = validateMetadata(
      ctx({ id: "c.f", description: "does a thing", contract: { name: "c", function: "f" } }),
    );
    expect(checks).toHaveLength(1);
    expect(checks[0].passed).toBe(true);
    expect(checks[0].passLabel).toBe("action metadata present");
  });

  it("reports a failure for each missing metadata field", () => {
    const checks = validateMetadata(ctx({}));
    expect(checks.every((check) => !check.passed)).toBe(true);
    const messages = checks.map((check) => check.failMessage);
    expect(messages).toEqual([
      "id is missing",
      "description is missing",
      "contract.name is missing",
      "contract.function is missing",
    ]);
  });

  it("treats whitespace-only values as missing", () => {
    const checks = validateMetadata(
      ctx({ id: "  ", description: "ok", contract: { name: "c", function: "f" } }),
    );
    expect(checks.map((check) => check.failMessage)).toContain("id is missing");
  });
});
