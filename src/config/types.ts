import type { z } from "zod";
import { actionConfigSchema } from "./schema.js";

/** The parsed, structurally-valid action config consumed by the validators. */
export type ActionConfig = z.infer<typeof actionConfigSchema>;
