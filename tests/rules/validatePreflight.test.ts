import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { validatePreflight } from "../../src/validation/rules/validatePreflight.js";
import type { ActionConfig } from "../../src/config/types.js";

const dir = mkdtempSync(join(tmpdir(), "preflight-"));
const configPath = join(dir, "action.json");
writeFileSync(join(dir, "exists.preflight.test.ts"), "export {};\n");

afterAll(() => rmSync(dir, { recursive: true, force: true }));

const run = (config: ActionConfig) => validatePreflight({ config, configPath });

describe("validatePreflight", () => {
  it("passes when the declared test file exists (resolved relative to the config)", () => {
    const checks = run({ preflight: { clarinetTest: "./exists.preflight.test.ts" } });
    expect(checks[0].passed).toBe(true);
    expect(checks[0].passLabel).toBe("Clarinet simnet preflight test path found");
  });

  it("fails when no preflight test is declared", () => {
    const checks = run({});
    expect(checks[0].passed).toBe(false);
    expect(checks[0].failMessage).toBe("no Clarinet simnet preflight test was found");
  });

  it("fails when the declared test file does not exist", () => {
    const checks = run({ preflight: { clarinetTest: "./missing.preflight.test.ts" } });
    expect(checks[0].passed).toBe(false);
    expect(checks[0].failMessage).toContain("does not exist");
  });
});
