DO $$ BEGIN
  CREATE TYPE eviction_status AS ENUM (
    'illegal_identified',
    'notice_served',
    'case_filed',
    'hearing_pending',
    'order_received',
    'police_scheduled',
    'vacated',
    'closed',
    'stayed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TYPE document_owner ADD VALUE IF NOT EXISTS 'eviction_case';

CREATE TABLE IF NOT EXISTS eviction_cases (
  id SERIAL PRIMARY KEY,
  worker_id INT REFERENCES workers(id),
  colony_id INT REFERENCES colonies(id),
  flat_id INT REFERENCES residential_units(id),
  occupant_name VARCHAR(255) NOT NULL,
  occupant_cnic VARCHAR(30),
  occupant_phone VARCHAR(30),
  illegal_reason TEXT,
  case_no VARCHAR(100),
  court_name VARCHAR(255),
  police_station VARCHAR(255),
  administration_contact VARCHAR(255),
  filed_date DATE,
  next_hearing_date DATE,
  decision_summary TEXT,
  status eviction_status NOT NULL DEFAULT 'illegal_identified',
  vacant_date DATE,
  remarks VARCHAR(500),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eviction_cases_status ON eviction_cases(status);
CREATE INDEX IF NOT EXISTS idx_eviction_cases_flat_id ON eviction_cases(flat_id);

CREATE TABLE IF NOT EXISTS eviction_hearings (
  id SERIAL PRIMARY KEY,
  eviction_case_id INT NOT NULL REFERENCES eviction_cases(id) ON DELETE CASCADE,
  hearing_date DATE NOT NULL,
  next_hearing_date DATE,
  proceedings TEXT,
  decision_summary TEXT,
  document_id INT REFERENCES documents(id),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eviction_hearings_case_id ON eviction_hearings(eviction_case_id);
