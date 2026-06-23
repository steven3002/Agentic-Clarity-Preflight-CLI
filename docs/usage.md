# Usage

A complete reference for the three commands, the action config format, the exit codes, and
CI usage. For what the tool deliberately does **not** do, see [non-goals.md](./non-goals.md).

## Install / run

The CLI is run from a local clone (it is not published to a registry).

```sh
git clone https://github.com/steven3002/Agentic-Clarity-Preflight-CLI.git
cd Agentic-Clarity-Preflight-CLI
npm install
npm run build          # compiles to dist/
node dist/index.js --help
```

Two convenience options:

- **Run without building** (TypeScript directly): `npm run dev -- check path/to/action.json`
- **Install the `agentic-clarity-preflight` binary on your PATH**: `npm link` (then
  `agentic-clarity-preflight check ...`). Examples below use `node dist/index.js`.

Requires Node.js >= 20.

## Commands

### `init [path]`

Writes a **safe** starter action config (bounded args, no mainnet, required Deny-mode
post-condition, a preflight test path) for you to edit. Default path is `action.json`.

```sh
node dist/index.js init action.json
# -> Wrote starter action config to action.json
```

- Refuses to overwrite an existing file unless `-f, --force` is passed.
- The generated template **FAILs `check` until you create the preflight test file** it
  references — by design, so you wire up a real Clarinet test rather than ship a dangling
  path.

### `check <config>`

Loads the config, validates its structure, runs the five rules, prints a human-readable
PASS/FAIL report, and sets the exit code.

```sh
node dist/index.js check examples/sbtc-payment/fixed.action.json
```

```
PASS sbtc-payment.pay-with-sbtc

- action metadata present
- argument bounds present
- network policy restricted to simnet/devnet/testnet
- mainnet disabled
- SIP-010 asset movement policy declared
- post-condition policy required
- postConditionMode is deny
- Clarinet simnet preflight test path found
```

On FAIL, the bullets list the specific problems to fix instead of the positives.

### `report <config> [--out <file>]`

Same validation pipeline as `check`, but emits a **Markdown** report (for pull requests and
docs). Writes to stdout, or to a file with `-o, --out`.

```sh
node dist/index.js report examples/sbtc-payment/fixed.action.json --out preflight.md
# -> Report written to preflight.md
```

See [demo-output.md](./demo-output.md) for full captured PASS and FAIL reports.

## Action config reference

A single JSON object. `?` marks optional fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Non-empty action identifier (e.g. `contract.function`). |
| `description` | string | yes | Non-empty, human-readable. |
| `contract.name` | string | yes | Non-empty Clarity contract name. |
| `contract.function` | string | yes | Non-empty function name. |
| `networkPolicy.allowedNetworks` | string[] | yes | Non-empty; from `simnet`, `devnet`, `testnet`, `mainnet`. |
| `networkPolicy.mainnetAllowed` | boolean | yes | Must be `false` in the MVP. |
| `args[].name` | string | yes | Non-empty argument name. |
| `args[].type` | enum | yes | `uint`, `int`, `bool`, `principal`, `buff`, `string-ascii`, `string-utf8`. |
| `args[].min` / `args[].max` | string | yes for numeric | Required for `uint`/`int`; parsed as BigInt; `min <= max`; `uint` min `>= 0`. |
| `assetMovement?` | object | no | **Presence marks the action "asset-moving"** and triggers the post-condition rule. |
| `assetMovement.type` | enum | with block | `sip010` (the only supported type in the MVP). |
| `assetMovement.asset` | string | with block | Asset identifier. |
| `assetMovement.amountFromArg` | string | with block | Must reference a declared `args[].name`. |
| `postConditionPolicy?` | object | **required if `assetMovement` present** | — |
| `postConditionPolicy.required` | boolean | with block | Must be `true` for asset-moving actions. |
| `postConditionPolicy.mode` | enum | with block | `deny` or `allow`; must be `deny` for asset-moving actions. |
| `postConditionPolicy.sender` / `condition` / `asset` / `amountFromArg` | string | no | Declared policy detail. |
| `preflight.clarinetTest` | string | yes (to pass) | Path to a Clarinet simnet test, **resolved relative to the config file's directory**; the file must exist. |

### The five rules

1. **metadata** — `id`, `description`, `contract.name`, `contract.function` present and non-empty.
2. **args** — every numeric arg has valid `min`/`max`, `min <= max`, and (for `uint`) `>= 0`.
3. **network** — `allowedNetworks` non-empty, `mainnet` absent, `mainnetAllowed` is `false`.
4. **post-conditions** — for asset-moving actions: well-formed `assetMovement` and a required
   Deny-mode `postConditionPolicy`. (Skipped entirely when there is no `assetMovement`.)
5. **preflight** — `preflight.clarinetTest` is declared and the file exists.

The verdict is PASS only if **every** check passes.

## Exit codes (CI contract)

| Code | Meaning |
|---|---|
| `0` | PASS — all checks passed. |
| `1` | FAIL — valid input, but one or more checks failed (the action is unsafe to expose). |
| `2` | ERROR — the tool could not evaluate the config (file missing, invalid JSON, or schema mismatch). |

This separation lets CI distinguish *"the action is unsafe"* (`1`) from *"the tool could not
run"* (`2`). Examples of `2`:

```
agentic-clarity-preflight: config file not found: action.json
agentic-clarity-preflight: config file is not valid JSON action.json: ...
agentic-clarity-preflight: config does not match the action schema: action.json
  - networkPolicy.allowedNetworks: Invalid input: expected array, received string
```

## CI usage

`check` exits non-zero on an unsafe (or unevaluable) config, so it gates a job directly. A
minimal GitHub Actions step:

```yaml
- run: npm ci
- run: npm run build
- run: node dist/index.js check path/to/your.action.json
```

This repository's own workflow (`.github/workflows/preflight.yml`) runs the test suite and
then gates the example action the same way.
