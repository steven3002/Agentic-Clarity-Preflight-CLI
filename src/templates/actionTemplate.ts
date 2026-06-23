import type { ActionConfig } from "../config/types.js";

/**
 * Starter action config emitted by `init`. It is intentionally a safe baseline — bounded
 * arguments, no mainnet, a required Deny-mode post-condition, and a preflight test path —
 * so developers adapt a passing configuration rather than starting from an unsafe one.
 */
export const actionTemplate = {
  id: "my-contract.my-action",
  description: "Describe what this action does and why it is safe to expose to an agent.",
  contract: {
    name: "my-contract",
    function: "my-action",
  },
  networkPolicy: {
    allowedNetworks: ["simnet", "devnet", "testnet"],
    mainnetAllowed: false,
  },
  args: [
    { name: "amount", type: "uint", min: "1", max: "1000000" },
    { name: "recipient", type: "principal" },
  ],
  assetMovement: {
    type: "sip010",
    asset: "my-token",
    amountFromArg: "amount",
  },
  postConditionPolicy: {
    required: true,
    mode: "deny",
    sender: "tx-sender",
    condition: "will-send-eq",
    asset: "my-token",
    amountFromArg: "amount",
  },
  preflight: {
    clarinetTest: "./tests/my-action.preflight.test.ts",
  },
} satisfies ActionConfig;
