import { z } from "zod";

/** Closed set of networks an action config may reference. */
export const NETWORK_NAMES = ["simnet", "devnet", "testnet", "mainnet"] as const;

/** Argument types the preflight config format understands. */
export const ARG_TYPES = [
  "uint",
  "int",
  "bool",
  "principal",
  "buff",
  "string-ascii",
  "string-utf8",
] as const;

/** Argument types treated as numeric, for which bounds are required by the validators. */
export const NUMERIC_ARG_TYPES = ["uint", "int"] as const;

const contractSchema = z.object({
  name: z.string().optional(),
  function: z.string().optional(),
});

const argSchema = z.object({
  name: z.string(),
  type: z.enum(ARG_TYPES),
  min: z.string().optional(),
  max: z.string().optional(),
});

const networkPolicySchema = z.object({
  allowedNetworks: z.array(z.enum(NETWORK_NAMES)).optional(),
  mainnetAllowed: z.boolean().optional(),
});

const assetMovementSchema = z.object({
  type: z.enum(["sip010"]),
  asset: z.string().optional(),
  amountFromArg: z.string().optional(),
});

const postConditionPolicySchema = z.object({
  required: z.boolean().optional(),
  mode: z.enum(["deny", "allow"]).optional(),
  sender: z.string().optional(),
  condition: z.string().optional(),
  asset: z.string().optional(),
  amountFromArg: z.string().optional(),
});

const preflightSchema = z.object({
  clarinetTest: z.string().optional(),
});

/**
 * Structural schema for a developer-supplied action config.
 *
 * The schema is intentionally permissive about the presence of policy fields: identity,
 * bounds, network, post-condition, and preflight fields are optional here so that their
 * absence is reported as a policy failure by the validators (exit 1) rather than rejected
 * as malformed input (exit 2). The schema enforces only structure: that the document is an
 * object and that any field present has the correct type and a recognized enum value.
 */
export const actionConfigSchema = z.object({
  id: z.string().optional(),
  description: z.string().optional(),
  contract: contractSchema.optional(),
  networkPolicy: networkPolicySchema.optional(),
  args: z.array(argSchema).optional(),
  assetMovement: assetMovementSchema.optional(),
  postConditionPolicy: postConditionPolicySchema.optional(),
  preflight: preflightSchema.optional(),
});
