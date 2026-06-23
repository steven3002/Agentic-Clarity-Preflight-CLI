;; Bounded sBTC payment action exposed to agents and tools. The argument bounds enforced here
;; mirror the bounds declared in the action config (1 <= amount <= 1000000), so an
;; out-of-range amount is rejected on-chain as well as by the preflight check.

(define-constant MIN-AMOUNT u1)
(define-constant MAX-AMOUNT u1000000)

(define-constant ERR-AMOUNT-TOO-LOW (err u100))
(define-constant ERR-AMOUNT-TOO-HIGH (err u101))

(define-public (pay-with-sbtc (amount uint) (recipient principal))
  (begin
    (asserts! (>= amount MIN-AMOUNT) ERR-AMOUNT-TOO-LOW)
    (asserts! (<= amount MAX-AMOUNT) ERR-AMOUNT-TOO-HIGH)
    (try! (contract-call? .sbtc-token transfer amount tx-sender recipient none))
    (ok true)))
