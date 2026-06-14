-- Migration 002: Role redesign + dynamic zones
--
-- 1. Replaces the legacy `user_role` enum (10 values) with the new KP WWB role set.
-- 2. Migrates existing users.role values via the mapping below.
-- 3. Adds a dynamic `zones` table (each zone managed by an Assistant Director / Colonies)
--    and a `colonies.zone_id` foreign key.
--
-- Old -> New role mapping:
--   superadmin         -> super_admin
--   director           -> director_admin
--   committee_admin    -> secretary_kp_wwb
--   verification_admin -> colony_section
--   colony_admin       -> care_taker_labour_colony   (colony admin powers shifted to caretaker)
--   caretaker          -> care_taker_labour_colony
--   finance_admin      -> finance_wing
--   assets_admin       -> works_wing
--   security_admin     -> legal_section
--   industry_admin     -> industry_admin             (unchanged; external applicant portal)
--
-- New roles with no legacy equivalent (no rows migrated into them):
--   admin, ad_colonies_zone1, ad_colonies_zone2, recoveries_rent,
--   deputy_director_gahr, chairman_kp_wwb

BEGIN;

-- 1. Create the new enum type ------------------------------------------------
CREATE TYPE user_role_new AS ENUM (
  'admin',
  'super_admin',
  'ad_colonies_zone1',
  'ad_colonies_zone2',
  'works_wing',
  'finance_wing',
  'recoveries_rent',
  'care_taker_labour_colony',
  'colony_section',
  'legal_section',
  'deputy_director_gahr',
  'director_admin',
  'secretary_kp_wwb',
  'chairman_kp_wwb',
  'industry_admin'
);

-- 2. Drop the column default before retyping ---------------------------------
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- 3. Convert the column with the mapping -------------------------------------
ALTER TABLE users
  ALTER COLUMN role TYPE user_role_new
  USING (
    CASE role::text
      WHEN 'superadmin'         THEN 'super_admin'
      WHEN 'director'           THEN 'director_admin'
      WHEN 'committee_admin'    THEN 'secretary_kp_wwb'
      WHEN 'verification_admin' THEN 'colony_section'
      WHEN 'colony_admin'       THEN 'care_taker_labour_colony'
      WHEN 'caretaker'          THEN 'care_taker_labour_colony'
      WHEN 'finance_admin'      THEN 'finance_wing'
      WHEN 'assets_admin'       THEN 'works_wing'
      WHEN 'security_admin'     THEN 'legal_section'
      WHEN 'industry_admin'     THEN 'industry_admin'
      ELSE 'care_taker_labour_colony'
    END
  )::user_role_new;

-- 4. Set the new default + swap the type names -------------------------------
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'care_taker_labour_colony';

DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- 5. Dynamic zones table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS zones (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  ad_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP(6) DEFAULT now(),
  updated_at TIMESTAMP(6) DEFAULT now()
);

-- Seed the two starting zones described by the board structure.
INSERT INTO zones (name) VALUES ('Zone 1'), ('Zone 2')
ON CONFLICT DO NOTHING;

-- 6. Attach colonies to zones ------------------------------------------------
ALTER TABLE colonies ADD COLUMN IF NOT EXISTS zone_id INTEGER REFERENCES zones(id);

COMMIT;
