import { fail, pass } from "../check.js";
import type { Check, Rule } from "../types.js";

const RULE = "network";

/**
 * Requires the action to be restricted to non-mainnet networks: the allow-list must be
 * present, non-empty, and exclude `mainnet`, and `mainnetAllowed` must be explicitly false.
 * Mainnet execution is out of scope for the MVP.
 */
export const validateNetwork: Rule = ({ config }) => {
  const policy = config.networkPolicy;
  const allowed = policy?.allowedNetworks ?? [];
  const checks: Check[] = [];

  if (allowed.length === 0) {
    checks.push(fail(RULE, "network.allowlist", "networkPolicy must list at least one allowed network"));
  } else if (allowed.includes("mainnet")) {
    checks.push(fail(RULE, "network.allowlist", "mainnet must not be in allowedNetworks"));
  } else {
    checks.push(pass(RULE, "network.allowlist", "network policy restricted to simnet/devnet/testnet"));
  }

  if (policy?.mainnetAllowed === false) {
    checks.push(pass(RULE, "network.mainnet", "mainnet disabled"));
  } else {
    checks.push(fail(RULE, "network.mainnet", "mainnetAllowed must be false in MVP mode"));
  }

  return checks;
};
