# Demo walkthrough

A reproducible end-to-end run of the **unsafe → FAIL → fixed → PASS** flow, plus the Clarinet
simnet test that backs the corrected example. Every block below is real captured output.

To record a short GIF/video, run these same commands in a terminal (for example with
[`asciinema`](https://asciinema.org/): `asciinema rec demo.cast`).

## 0. Build

```sh
git clone https://github.com/steven3002/Agentic-Clarity-Preflight-CLI.git
cd Agentic-Clarity-Preflight-CLI
npm install
npm run build
```

## 1. The unsafe action fails the gate

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

The exit code `1` means *the action is unsafe to expose* — distinct from `2` (the tool could
not evaluate the file). This is what fails a CI job.

## 2. What changes in the corrected config

The fixed config adds the four missing guarantees:

| Concern | unsafe.action.json | fixed.action.json |
|---|---|---|
| Argument bounds | `amount` has no `min`/`max` | `min: "1"`, `max: "1000000"` |
| Network policy | `mainnet` allowed | `simnet`/`devnet`/`testnet`, `mainnetAllowed: false` |
| Post-condition | none | required, `mode: "deny"` |
| Preflight | none | `./tests/sbtc-payment.preflight.test.ts` (exists) |

## 3. The corrected action passes

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

## 4. The preflight path is a real, runnable Clarinet test

`check` only verifies the test file **exists** (it stays read-only and fast). The declared
path points at an actual Clarinet simnet test you run separately:

```sh
$ cd examples/sbtc-payment && npm install && npm test

 RUN  v4.1.9

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

The suite asserts that `pay-with-sbtc` moves sBTC within bounds (emitting an
`ft_transfer_event`) and rejects amounts below `u1` and above `u1000000`.

## 5. Markdown report (for PRs / docs)

```sh
$ node dist/index.js report examples/sbtc-payment/fixed.action.json --out preflight.md
Report written to preflight.md
```

The captured Markdown for both examples is in [demo-output.md](./demo-output.md).

## 6. Start your own

```sh
$ node dist/index.js init action.json
Wrote starter action config to action.json
```

`init` writes a safe baseline. It intentionally FAILs `check` until you create the Clarinet
test file it references — wire up a real simnet test, then re-run `check` to reach PASS.
