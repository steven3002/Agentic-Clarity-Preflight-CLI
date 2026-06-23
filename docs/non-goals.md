# Non-goals

The Agentic Clarity Preflight CLI is a small, local, **read-only** gate. Keeping its scope
narrow is what makes its verdict trustworthy. The following are explicit non-goals.

## The tool does NOT

- **Sign transactions.** It never constructs or signs a Stacks transaction.
- **Broadcast transactions.** It makes **no network calls** of any kind.
- **Custody funds.** It never holds, moves, or has access to any assets.
- **Manage private keys.** It performs **no key-material handling** whatsoever.
- **Run an AI agent.** It is a validation gate, not an agent or an orchestration framework.
- **Build a wallet.** It does not manage accounts, balances, or signing UX.
- **Build an MCP server.** It exposes no server, tool, or runtime endpoint.
- **Support mainnet execution.** Mainnet is disabled by policy in the MVP; an action that
  allows mainnet FAILs the check.
- **Execute Clarinet.** The preflight rule only checks that a declared simnet test file
  **exists**; running it is a separate, documented step.

## The tool is NOT

- **A replacement for Clarinet.** Clarinet builds, tests, and deploys Clarity contracts;
  this CLI only validates an action-exposure config and points at a Clarinet test.
- **A replacement for Stacks.js or post-conditions.** It checks that an action *declares* a
  Deny-mode post-condition policy; it does not implement or enforce post-conditions at
  runtime — that remains the responsibility of the transaction builder and the chain.
- **A linter for Clarity source.** It validates a JSON action config, not `.clar` code.
- **A safety guarantee.** A PASS means the declared policy meets the MVP's minimum bar for
  exposing an action to automation. It does **not** certify that the contract, the
  post-conditions, or the integration are correct or safe. Human review still applies.

## What it actually does

Reads one local JSON action config and prints a PASS/FAIL verdict (with CI-friendly exit
codes) answering a single question: *should this specific Clarity action be exposed to an
agent yet?* See [usage.md](./usage.md) for the command and config reference.
