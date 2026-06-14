-- Migration 004: Rent collection routing to caretakers + remittance to accountant
--
-- Business flow implemented by this migration:
--   1. Monthly rent vouchers (rent_invoices) are generated as before.
--   2. Each voucher is routed to the caretaker of the *flat's colony only* — the
--      caretaker -> colony mapping lives in `caretaker_colonies`.
--   3. The worker pays the caretaker; the caretaker marks the invoice paid and the
--      payment is stamped with collected_user_id (the caretaker) and left
--      un-remitted (rent_payments.remittance_id IS NULL).
--   4. The accountant sees how much each caretaker is holding, then collects it:
--      a `rent_remittances` row is created and every un-remitted payment of that
--      caretaker is attached to it (remittance_id set).
--
-- All additions are non-destructive (new tables + a nullable column).

BEGIN;

-- 1. Caretaker -> colony assignment ------------------------------------------
CREATE TABLE IF NOT EXISTS "caretaker_colonies" (
  "id"         SERIAL PRIMARY KEY,
  "user_id"    INTEGER NOT NULL,
  "colony_id"  INTEGER NOT NULL,
  "is_active"  BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "caretaker_colonies_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "caretaker_colonies_colony_id_fkey"
    FOREIGN KEY ("colony_id") REFERENCES "colonies" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX IF NOT EXISTS "caretaker_colonies_user_colony_key"
  ON "caretaker_colonies" ("user_id", "colony_id");
CREATE INDEX IF NOT EXISTS "idx_caretaker_colonies_colony"
  ON "caretaker_colonies" ("colony_id");

-- 2. Caretaker -> accountant cash handover ------------------------------------
CREATE TABLE IF NOT EXISTS "rent_remittances" (
  "id"                  SERIAL PRIMARY KEY,
  "caretaker_user_id"   INTEGER NOT NULL,
  "received_by_user_id" INTEGER,
  "total_amount"        BIGINT NOT NULL DEFAULT 0,
  "payment_count"       INTEGER NOT NULL DEFAULT 0,
  "status"              VARCHAR(20) NOT NULL DEFAULT 'received',
  "remarks"             VARCHAR(500),
  "received_at"         TIMESTAMP(6),
  "created_at"          TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rent_remittances_caretaker_fkey"
    FOREIGN KEY ("caretaker_user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION,
  CONSTRAINT "rent_remittances_received_by_fkey"
    FOREIGN KEY ("received_by_user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION
);
CREATE INDEX IF NOT EXISTS "idx_rent_remittances_caretaker"
  ON "rent_remittances" ("caretaker_user_id");

-- 3. Link a collected payment to its remittance (NULL = still with caretaker) --
ALTER TABLE "rent_payments" ADD COLUMN IF NOT EXISTS "remittance_id" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'rent_payments_remittance_id_fkey'
      AND table_name = 'rent_payments'
  ) THEN
    ALTER TABLE "rent_payments"
      ADD CONSTRAINT "rent_payments_remittance_id_fkey"
      FOREIGN KEY ("remittance_id") REFERENCES "rent_remittances" ("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_rent_payments_remittance"
  ON "rent_payments" ("remittance_id");

COMMIT;
