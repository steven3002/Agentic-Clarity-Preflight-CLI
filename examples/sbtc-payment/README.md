# sBTC payment — Clarinet simnet preflight demo

This directory is the example action used by the Agentic Clarity Preflight CLI, plus the
Clarinet project that backs its declared preflight test.

## Layout

```
sbtc-payment/
├── unsafe.action.json                  # action config that FAILs the preflight check
├── fixed.action.json                   # action config that PASSes the preflight check
├── Clarinet.toml                       # Clarinet project manifest
├── contracts/
│   ├── sbtc-token.clar                 # minimal SIP-010 token, local stand-in for sBTC
│   └── sbtc-payment.clar               # bounded `pay-with-sbtc` action
├── settings/Devnet.toml                # simnet accounts
└── tests/
    └── sbtc-payment.preflight.test.ts  # Clarinet simnet test (this file)
```

The local `sbtc-token` is a minimal SIP-010 fungible token (8 decimals, sBTC-shaped
`transfer`) that stands in for the mainnet sBTC token so the demo runs offline.

## How the preflight path maps to the config

`fixed.action.json` declares:

```json
"preflight": { "clarinetTest": "./tests/sbtc-payment.preflight.test.ts" }
```

The CLI resolves `preflight.clarinetTest` **relative to the config file's directory** and
checks that the file exists. It does **not** execute the test — `check` stays read-only and
fast. Running the test is the developer's responsibility (and a CI step, below).

## Run the Clarinet test

From this directory:

```sh
npm install
npm test
```

This runs the simnet suite, which asserts that `pay-with-sbtc`:

- moves sBTC and emits a `ft_transfer_event` when the amount is within bounds,
- rejects an amount below the minimum bound (`u1`),
- rejects an amount above the maximum bound (`u1000000`).

## Run the preflight check (from the repo root)

```sh
node dist/index.js check examples/sbtc-payment/fixed.action.json   # PASS, exit 0
node dist/index.js check examples/sbtc-payment/unsafe.action.json  # FAIL, exit 1
```
