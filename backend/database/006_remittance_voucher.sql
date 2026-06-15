-- Migration 006: Rent remittance vouchers (accountant -> caretaker handover)
--
-- Flow:
--   1. The accountant GENERATES a monthly voucher for a caretaker = the rent that
--      caretaker collected that month and has not yet handed over (status 'pending').
--   2. The caretaker PAYS the voucher: hands over the cash, uploads a screenshot,
--      and marks it paid (status 'paid', proof attached).
--   3. The accountant sees the voucher flip to 'paid' with the screenshot proof.
--
-- Non-destructive: new nullable columns + default change.

BEGIN;

ALTER TABLE "rent_remittances" ADD COLUMN IF NOT EXISTS "billing_month"      DATE;
ALTER TABLE "rent_remittances" ADD COLUMN IF NOT EXISTS "proof_document_id"  INTEGER;

-- New vouchers start as 'pending' (existing rows keep whatever they had).
ALTER TABLE "rent_remittances" ALTER COLUMN "status" SET DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'rent_remittances_proof_document_id_fkey' AND table_name = 'rent_remittances'
  ) THEN
    ALTER TABLE "rent_remittances"
      ADD CONSTRAINT "rent_remittances_proof_document_id_fkey"
      FOREIGN KEY ("proof_document_id") REFERENCES "documents" ("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_rent_remittances_billing_month" ON "rent_remittances" ("billing_month");

COMMIT;
