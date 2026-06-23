;; Minimal SIP-010 fungible token used as a local stand-in for sBTC in the simnet
;; preflight demo. It mirrors the sBTC token's transfer signature and 8-decimal precision so
;; the payment action can be exercised offline, without depending on a mainnet deployment.

(define-fungible-token sbtc)

(define-constant ERR-NOT-TOKEN-OWNER (err u4))

(define-read-only (get-name)
  (ok "sBTC (demo)"))

(define-read-only (get-symbol)
  (ok "sBTC"))

(define-read-only (get-decimals)
  (ok u8))

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance sbtc who)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply sbtc)))

(define-read-only (get-token-uri)
  (ok none))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-TOKEN-OWNER)
    (try! (ft-transfer? sbtc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

;; Mints demo balance so the simnet preflight can fund a sender. This is a test affordance
;; for the offline demo and is not part of the SIP-010 standard surface.
(define-public (mint (amount uint) (recipient principal))
  (ft-mint? sbtc amount recipient))
