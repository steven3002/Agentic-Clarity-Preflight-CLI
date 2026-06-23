import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/** Runs the built CLI's `report` command and captures the result. */
function runReport(args: string[]) {
  return spawnSync("node", ["dist/index.js", "report", ...args], { encoding: "utf8" });
}

const outFile = join(tmpdir(), `preflight-report-${process.pid}.md`);

afterEach(() => {
  rmSync(outFile, { force: true });
});

describe("report CLI (integration)", () => {
  it("emits a PASS Markdown report for the fixed example and exits 0", () => {
    const result = runReport(["examples/sbtc-payment/fixed.action.json"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("# Preflight Report");
    expect(result.stdout).toContain("**Result:** ✅ PASS");
    expect(result.stdout).toContain("Clarinet simnet preflight test path found");
  });

  it("emits a FAIL Markdown report for the unsafe example and exits 1", () => {
    const result = runReport(["examples/sbtc-payment/unsafe.action.json"]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("**Result:** ❌ FAIL");
    expect(result.stdout).toContain("no Clarinet simnet preflight test was found");
  });

  it("writes the report to --out and exits 0 for the fixed example", () => {
    const result = runReport(["examples/sbtc-payment/fixed.action.json", "--out", outFile]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`Report written to ${outFile}`);
    expect(existsSync(outFile)).toBe(true);
    expect(readFileSync(outFile, "utf8")).toContain("**Result:** ✅ PASS");
  });

  it("returns exit code 2 when the config file is missing", () => {
    const result = runReport(["examples/sbtc-payment/does-not-exist.json"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("config file not found");
  });
});
