# Demo output

Captured Markdown reports from the `report` command for the two example action configs. The
command exits `0` on PASS, `1` on FAIL, and `2` on a tool error (such as a missing file), so it
can gate a CI job directly.

## Fixed example (PASS, exit 0)

```sh
node dist/index.js report examples/sbtc-payment/fixed.action.json
```

```markdown
# Preflight Report

**Action:** `sbtc-payment.pay-with-sbtc`

**Result:** ✅ PASS

## Passed checks

- action metadata present
- argument bounds present
- network policy restricted to simnet/devnet/testnet
- mainnet disabled
- SIP-010 asset movement policy declared
- post-condition policy required
- postConditionMode is deny
- Clarinet simnet preflight test path found
```

## Unsafe example (FAIL, exit 1)

```sh
node dist/index.js report examples/sbtc-payment/unsafe.action.json
```

```markdown
# Preflight Report

**Action:** `sbtc-payment.pay-with-sbtc`

**Result:** ❌ FAIL

## Issues to fix

- amount has no minimum bound
- amount has no maximum bound
- mainnet must not be in allowedNetworks
- mainnetAllowed must be false in MVP mode
- asset movement is declared but no post-condition policy is required
- postConditionMode must be deny for asset-moving actions
- no Clarinet simnet preflight test was found
```

## Writing to a file

```sh
node dist/index.js report examples/sbtc-payment/fixed.action.json --out preflight.md
# -> "Report written to preflight.md" (exit 0)
```
