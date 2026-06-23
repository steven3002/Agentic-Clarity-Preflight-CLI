import { describe, expect, it } from "vitest";
import { validateNetwork } from "../../src/validation/rules/validateNetwork.js";
import type { ActionConfig } from "../../src/config/types.js";
import type { ValidationContext } from "../../src/validation/types.js";

const ctx = (config: ActionConfig): ValidationContext => ({ config, configPath: "/tmp/action.json" });

describe("validateNetwork", () => {
  it("passes when restricted to non-mainnet networks with mainnet disabled", () => {
    const checks = validateNetwork(
      ctx({ networkPolicy: { allowedNetworks: ["simnet", "devnet", "testnet"], mainnetAllowed: false } }),
    );
    expect(checks.every((check) => check.passed)).toBe(true);
    expect(checks.map((check) => check.passLabel)).toEqual([
      "network policy restricted to simnet/devnet/testnet",
      "mainnet disabled",
    ]);
  });

  it("fails when mainnet is in the allow-list", () => {
    const checks = validateNetwork(
      ctx({ networkPolicy: { allowedNetworks: ["testnet", "mainnet"], mainnetAllowed: false } }),
    );
    expect(checks.map((check) => check.failMessage)).toContain("mainnet must not be in allowedNetworks");
  });

  it("fails when mainnetAllowed is true", () => {
    const checks = validateNetwork(
      ctx({ networkPolicy: { allowedNetworks: ["testnet"], mainnetAllowed: true } }),
    );
    expect(checks.map((check) => check.failMessage)).toContain("mainnetAllowed must be false in MVP mode");
  });

  it("fails when the allow-list is empty or absent", () => {
    const checks = validateNetwork(ctx({}));
    expect(checks.map((check) => check.failMessage)).toContain(
      "networkPolicy must list at least one allowed network",
    );
  });
});
