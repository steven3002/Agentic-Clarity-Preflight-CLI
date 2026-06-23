import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/** Runs the built CLI's `check` command against a config and captures the result. */
function runCheck(configPath: string) {
  return spawnSync("node", ["dist/index.js", "check", configPath], { encoding: "utf8" });
}

describe("check CLI (integration)", () => {
  it("fails the unsafe example with exit code 1", () => {
    const result = runCheck("examples/sbtc-payment/unsafe.action.json");
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("FAIL sbtc-payment.pay-with-sbtc");
    expect(result.stdout).toContain("no Clarinet simnet preflight test was found");
  });

  it("passes the fixed example with exit code 0", () => {
    const result = runCheck("examples/sbtc-payment/fixed.action.json");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS sbtc-payment.pay-with-sbtc");
    expect(result.stdout).toContain("Clarinet simnet preflight test path found");
  });

  it("returns exit code 2 when the config file is missing", () => {
    const result = runCheck("examples/sbtc-payment/does-not-exist.json");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("config file not found");
  });
});
