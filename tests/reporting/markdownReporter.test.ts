import { describe, expect, it } from "vitest";
import { renderMarkdownReport } from "../../src/reporting/markdownReporter.js";
import type { ValidationResult } from "../../src/validation/types.js";

const passResult: ValidationResult = {
  actionId: "demo.action",
  passed: true,
  checks: [
    { rule: "metadata", id: "metadata.present", passed: true, passLabel: "action metadata present", failMessage: "" },
    { rule: "network", id: "network.mainnet", passed: true, passLabel: "mainnet disabled", failMessage: "" },
  ],
};

const failResult: ValidationResult = {
  actionId: "demo.action",
  passed: false,
  checks: [
    { rule: "args", id: "args.amount.min", passed: false, passLabel: "", failMessage: "amount has no minimum bound" },
    { rule: "network", id: "network.mainnet", passed: true, passLabel: "mainnet disabled", failMessage: "" },
  ],
};

describe("renderMarkdownReport", () => {
  it("renders a PASS report with the action id and passed checks", () => {
    const md = renderMarkdownReport(passResult);
    expect(md).toContain("# Preflight Report");
    expect(md).toContain("**Action:** `demo.action`");
    expect(md).toContain("**Result:** ✅ PASS");
    expect(md).toContain("## Passed checks");
    expect(md).toContain("- action metadata present");
    expect(md).toContain("- mainnet disabled");
  });

  it("renders a FAIL report listing only the failing checks", () => {
    const md = renderMarkdownReport(failResult);
    expect(md).toContain("**Result:** ❌ FAIL");
    expect(md).toContain("## Issues to fix");
    expect(md).toContain("- amount has no minimum bound");
    // Passing checks are not listed on a failing report.
    expect(md).not.toContain("mainnet disabled");
  });

  it("ends with a single trailing newline", () => {
    const md = renderMarkdownReport(passResult);
    expect(md.endsWith("\n")).toBe(true);
    expect(md.endsWith("\n\n")).toBe(false);
  });
});
