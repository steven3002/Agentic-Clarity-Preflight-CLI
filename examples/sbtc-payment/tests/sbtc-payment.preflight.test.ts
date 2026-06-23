import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

/**
 * Clarinet simnet preflight test for the bounded sBTC payment action.
 *
 * The action config's `preflight.clarinetTest` path resolves to this file. The CLI performs a
 * static existence check only; this suite is the runnable backend it points at. It exercises
 * the on-chain enforcement of the same argument bounds the config declares (1..1000000) and
 * the SIP-010 asset movement performed by `pay-with-sbtc`.
 */

const accounts = simnet.getAccounts();
const sender = accounts.get("wallet_1")!;
const recipient = accounts.get("wallet_2")!;

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;
const ERR_AMOUNT_TOO_LOW = 100;
const ERR_AMOUNT_TOO_HIGH = 101;

/** Funds the sender with demo sBTC so the payment can move a real balance. */
function fundSender(amount: number) {
  const { result } = simnet.callPublicFn(
    "sbtc-token",
    "mint",
    [Cl.uint(amount), Cl.principal(sender)],
    sender,
  );
  expect(result).toBeOk(Cl.bool(true));
}

describe("pay-with-sbtc bounded payment action", () => {
  it("moves sBTC when the amount is within bounds", () => {
    fundSender(MAX_AMOUNT);
    const amount = 1000;

    const { result, events } = simnet.callPublicFn(
      "sbtc-payment",
      "pay-with-sbtc",
      [Cl.uint(amount), Cl.principal(recipient)],
      sender,
    );

    expect(result).toBeOk(Cl.bool(true));

    const transfer = events.find((event) => event.event === "ft_transfer_event");
    expect(transfer).toBeDefined();
    expect(transfer!.data).toMatchObject({
      amount: amount.toString(),
      sender,
      recipient,
    });

    const balance = simnet.callReadOnlyFn(
      "sbtc-token",
      "get-balance",
      [Cl.principal(recipient)],
      sender,
    );
    expect(balance.result).toBeOk(Cl.uint(amount));
  });

  it("rejects an amount below the minimum bound", () => {
    fundSender(MAX_AMOUNT);

    const { result } = simnet.callPublicFn(
      "sbtc-payment",
      "pay-with-sbtc",
      [Cl.uint(MIN_AMOUNT - 1), Cl.principal(recipient)],
      sender,
    );

    expect(result).toBeErr(Cl.uint(ERR_AMOUNT_TOO_LOW));
  });

  it("rejects an amount above the maximum bound", () => {
    fundSender(MAX_AMOUNT + 1);

    const { result } = simnet.callPublicFn(
      "sbtc-payment",
      "pay-with-sbtc",
      [Cl.uint(MAX_AMOUNT + 1), Cl.principal(recipient)],
      sender,
    );

    expect(result).toBeErr(Cl.uint(ERR_AMOUNT_TOO_HIGH));
  });
});
