# Agentic Clarity Preflight CLI

A small, local, **read-only** developer tool that validates a developer-supplied **action
config** describing a Clarity contract action, and **fails** asset-moving actions that lack
argument bounds, network restrictions, a required Deny-mode post-condition policy, or a
declared Clarinet simnet preflight test — producing a CI-friendly pass/fail result *before*
that action is exposed to an AI agent, MCP tool, or automation workflow.

## The problem

Stacks builders are wiring Clarity contract functions into AI agents and automation. The
safety constraints for an asset-moving action — bounds, network limits, post-conditions,
local simulation — are scattered across frontends, transaction builders, and docs. There is
no single, fast, local gate that answers one question:

> *Should this specific Clarity action be exposed to an agent yet?*

## What it does

`check` runs five pure rules over one JSON config and prints a PASS/FAIL verdict with a
nonzero exit code on failure:

1. **metadata** — `id`, `description`, contract name/function are present.
2. **args** — every numeric argument has valid `min`/`max` bounds (`min <= max`, `uint >= 0`).
3. **network** — mainnet is disabled and absent from the allow-list.
4. **post-conditions** — asset-moving actions declare a required **Deny-mode** post-condition.
5. **preflight** — a declared Clarinet simnet test file exists.

It is a **gate**, not a linter and not an agent framework. It does **not** sign transactions,
broadcast transactions, custody funds, manage private keys, run an AI agent, or replace
Clarinet or Stacks.js. It performs **no network calls and no key-material handling** — it only
reads local files and prints a verdict, and a PASS is a minimum-bar check, not a safety
guarantee. See **[docs/non-goals.md](./docs/non-goals.md)**.

## Install / run

Run from a local clone (Node.js >= 20):

```sh
git clone https://github.com/steven3002/Agentic-Clarity-Preflight-CLI.git
cd Agentic-Clarity-Preflight-CLI
npm install
npm run build
node dist/index.js --help
```

Full command, config-field, and CI reference: **[docs/usage.md](./docs/usage.md)**.

## Demo: unsafe → FAIL → fixed → PASS

The repo ships one unsafe and one corrected sBTC/SIP-010 payment action under
[`examples/sbtc-payment/`](./examples/sbtc-payment).

**1. The unsafe action fails** (mainnet allowed, no bounds, no post-condition, no preflight):

```sh
$ node dist/index.js check examples/sbtc-payment/unsafe.action.json ; echo "exit=$?"
FAIL sbtc-payment.pay-with-sbtc

- amount has no minimum bound
- amount has no maximum bound
- mainnet must not be in allowedNetworks
- mainnetAllowed must be false in MVP mode
- asset movement is declared but no post-condition policy is required
- postConditionMode must be deny for asset-moving actions
- no Clarinet simnet preflight test was found
exit=1
```

**2. The corrected action passes** (bounded, non-mainnet, Deny-mode post-condition, real
preflight test):

```sh
$ node dist/index.js check examples/sbtc-payment/fixed.action.json ; echo "exit=$?"
PASS sbtc-payment.pay-with-sbtc

- action metadata present
- argument bounds present
- network policy restricted to simnet/devnet/testnet
- mainnet disabled
- SIP-010 asset movement policy declared
- post-condition policy required
- postConditionMode is deny
- Clarinet simnet preflight test path found
exit=0
```

`report <config> [--out file.md]` emits the same verdict as Markdown for PRs and docs —
captured for both examples in **[docs/demo-output.md](./docs/demo-output.md)**. A step-by-step
walkthrough (including the Clarinet simnet test) is in **[docs/demo.md](./docs/demo.md)**.

The corrected example's preflight path points at a **real, runnable** Clarinet simnet test:

```sh
cd examples/sbtc-payment && npm install && npm test   # 3 simnet tests pass
```

## Architecture

```
bin (src/index.ts)                  owns the 0/1/2 exit-code contract
  └─ commander program (src/cli/program.ts)
       ├─ init    → templates/actionTemplate → write file
       ├─ check   → loadConfig → zod schema → runValidators → humanReporter
       └─ report  → loadConfig → zod schema → runValidators → markdownReporter

config/      loadConfig + zod schema (structure/types/enums → exit 2)
validation/  five pure rules → ValidationResult (policy → exit 1)
reporting/   human + markdown reporters (shared verdict selection)
```

Two layers, two exit codes: the **schema** rejects malformed input (exit `2`); the
**validators** enforce policy on well-formed input (exit `1`). Rules are pure functions
(`(ctx) => Check[]`) with no IO except a single `existsSync` for the preflight path;
reporters own all formatting; commands own exit codes.

## Development

```sh
npm run typecheck   # tsc --noEmit
npm test            # builds, then runs the vitest suite (unit + CLI integration)
npm run dev -- check examples/sbtc-payment/fixed.action.json   # run TS without building
```
