-- Migration 005: Complaint location + caretaker verification
--
-- Flow: the caretaker files a complaint and pins WHERE the problem is
-- (latitude/longitude). Later the same caretaker verifies the work is done by
-- uploading a proof image while standing AT that location — the backend checks
-- the current GPS is within allowed_radius_meters of the complaint pin.
--
-- All additions are non-destructive (new nullable columns + two optional FKs).

BEGIN;

-- Reporting side (where the issue is)
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "complaint_type"        VARCHAR(50);
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "latitude"              DECIMAL(10,7);
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "longitude"             DECIMAL(10,7);
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "allowed_radius_meters" INTEGER DEFAULT 100;

-- Verification side (proof the work was done, at the same spot)
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolved_image_id"        INTEGER;
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolved_latitude"        DECIMAL(10,7);
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolved_longitude"       DECIMAL(10,7);
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolved_distance_meters" DECIMAL(10,2);
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolved_by"              INTEGER;
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolved_at"              TIMESTAMP(6);
ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "resolution_remarks"       VARCHAR(500);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'complaints_resolved_image_id_fkey' AND table_name = 'complaints'
  ) THEN
    ALTER TABLE "complaints"
      ADD CONSTRAINT "complaints_resolved_image_id_fkey"
      FOREIGN KEY ("resolved_image_id") REFERENCES "documents" ("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'complaints_resolved_by_fkey' AND table_name = 'complaints'
  ) THEN
    ALTER TABLE "complaints"
      ADD CONSTRAINT "complaints_resolved_by_fkey"
      FOREIGN KEY ("resolved_by") REFERENCES "users" ("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

COMMIT;
