--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.zones DROP CONSTRAINT IF EXISTS zones_ad_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_submitted_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_requested_colony_id_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_rejected_by_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_industry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_payments DROP CONSTRAINT IF EXISTS utility_payments_utility_bill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_payments DROP CONSTRAINT IF EXISTS utility_payments_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_payments DROP CONSTRAINT IF EXISTS utility_payments_collected_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_connections DROP CONSTRAINT IF EXISTS utility_connections_flat_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_bills DROP CONSTRAINT IF EXISTS utility_bills_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_bills DROP CONSTRAINT IF EXISTS utility_bills_utility_connection_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_bills DROP CONSTRAINT IF EXISTS utility_bills_flat_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_bills DROP CONSTRAINT IF EXISTS utility_bills_flat_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_bills DROP CONSTRAINT IF EXISTS utility_bills_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.utility_bill_fetch_attempts DROP CONSTRAINT IF EXISTS utility_bill_fetch_attempts_utility_connection_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_proofs DROP CONSTRAINT IF EXISTS task_proofs_uploaded_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_proofs DROP CONSTRAINT IF EXISTS task_proofs_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_proofs DROP CONSTRAINT IF EXISTS task_proofs_image_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.residential_units DROP CONSTRAINT IF EXISTS residential_units_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.residential_units DROP CONSTRAINT IF EXISTS residential_units_colony_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_remittances DROP CONSTRAINT IF EXISTS rent_remittances_received_by_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_remittances DROP CONSTRAINT IF EXISTS rent_remittances_caretaker_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_rates DROP CONSTRAINT IF EXISTS rent_rates_flat_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_rates DROP CONSTRAINT IF EXISTS rent_rates_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_rates DROP CONSTRAINT IF EXISTS rent_rates_colony_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_payments DROP CONSTRAINT IF EXISTS rent_payments_rent_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_payments DROP CONSTRAINT IF EXISTS rent_payments_remittance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_payments DROP CONSTRAINT IF EXISTS rent_payments_collected_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_invoices DROP CONSTRAINT IF EXISTS rent_invoices_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_invoices DROP CONSTRAINT IF EXISTS rent_invoices_rent_rate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_invoices DROP CONSTRAINT IF EXISTS rent_invoices_late_fee_rule_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_invoices DROP CONSTRAINT IF EXISTS rent_invoices_flat_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.late_fee_rules DROP CONSTRAINT IF EXISTS late_fee_rules_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.industry_users DROP CONSTRAINT IF EXISTS industry_users_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.industry_users DROP CONSTRAINT IF EXISTS industry_users_industry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.industries DROP CONSTRAINT IF EXISTS industries_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.flat_assignments DROP CONSTRAINT IF EXISTS flat_assignments_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flat_assignments DROP CONSTRAINT IF EXISTS flat_assignments_flat_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flat_assignments DROP CONSTRAINT IF EXISTS flat_assignments_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.flat_assignments DROP CONSTRAINT IF EXISTS flat_assignments_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS fk_worker_applications_current_assignment;
ALTER TABLE IF EXISTS ONLY public.eviction_hearings DROP CONSTRAINT IF EXISTS eviction_hearings_eviction_case_id_fkey;
ALTER TABLE IF EXISTS ONLY public.eviction_hearings DROP CONSTRAINT IF EXISTS eviction_hearings_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.eviction_hearings DROP CONSTRAINT IF EXISTS eviction_hearings_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.eviction_cases DROP CONSTRAINT IF EXISTS eviction_cases_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.eviction_cases DROP CONSTRAINT IF EXISTS eviction_cases_flat_id_fkey;
ALTER TABLE IF EXISTS ONLY public.eviction_cases DROP CONSTRAINT IF EXISTS eviction_cases_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.eviction_cases DROP CONSTRAINT IF EXISTS eviction_cases_colony_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_document_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_resolved_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_resolved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_flat_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_colony_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_assigned_caretaker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaint_budgets DROP CONSTRAINT IF EXISTS complaint_budgets_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaint_budgets DROP CONSTRAINT IF EXISTS complaint_budgets_complaint_id_fkey;
ALTER TABLE IF EXISTS ONLY public.colonies DROP CONSTRAINT IF EXISTS colonies_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.colonies DROP CONSTRAINT IF EXISTS colonies_district_id_fkey;
ALTER TABLE IF EXISTS ONLY public.colonies DROP CONSTRAINT IF EXISTS colonies_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_tasks DROP CONSTRAINT IF EXISTS caretaker_tasks_flat_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_tasks DROP CONSTRAINT IF EXISTS caretaker_tasks_complaint_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_tasks DROP CONSTRAINT IF EXISTS caretaker_tasks_assigned_to_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_tasks DROP CONSTRAINT IF EXISTS caretaker_tasks_assigned_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_tasks DROP CONSTRAINT IF EXISTS caretaker_tasks_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_gps_tracking DROP CONSTRAINT IF EXISTS caretaker_gps_tracking_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_gps_tracking DROP CONSTRAINT IF EXISTS caretaker_gps_tracking_attendance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_colonies DROP CONSTRAINT IF EXISTS caretaker_colonies_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_colonies DROP CONSTRAINT IF EXISTS caretaker_colonies_colony_id_fkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_attendance DROP CONSTRAINT IF EXISTS caretaker_attendance_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assets DROP CONSTRAINT IF EXISTS assets_colony_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asset_status_history DROP CONSTRAINT IF EXISTS asset_status_history_repaired_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asset_status_history DROP CONSTRAINT IF EXISTS asset_status_history_asset_id_fkey;
DROP INDEX IF EXISTS public.unique_active_worker_assignment;
DROP INDEX IF EXISTS public.unique_active_flat_assignment;
DROP INDEX IF EXISTS public.idx_worker_applications_worker_id;
DROP INDEX IF EXISTS public.idx_worker_applications_status;
DROP INDEX IF EXISTS public.idx_utility_bills_billing_month;
DROP INDEX IF EXISTS public.idx_rent_remittances_caretaker;
DROP INDEX IF EXISTS public.idx_rent_rates_flat_id;
DROP INDEX IF EXISTS public.idx_rent_payments_remittance;
DROP INDEX IF EXISTS public.idx_rent_invoices_worker_id;
DROP INDEX IF EXISTS public.idx_rent_invoices_billing_month;
DROP INDEX IF EXISTS public.idx_flat_assignments_worker_id;
DROP INDEX IF EXISTS public.idx_flat_assignments_flat_id;
DROP INDEX IF EXISTS public.idx_eviction_hearings_case_id;
DROP INDEX IF EXISTS public.idx_eviction_cases_status;
DROP INDEX IF EXISTS public.idx_eviction_cases_flat_id;
DROP INDEX IF EXISTS public.idx_documents_owner;
DROP INDEX IF EXISTS public.idx_documents_application_id;
DROP INDEX IF EXISTS public.idx_complaints_status;
DROP INDEX IF EXISTS public.idx_caretaker_gps_user_recorded_at;
DROP INDEX IF EXISTS public.idx_caretaker_colonies_colony;
DROP INDEX IF EXISTS public.caretaker_colonies_user_colony_key;
ALTER TABLE IF EXISTS ONLY public.zones DROP CONSTRAINT IF EXISTS zones_pkey;
ALTER TABLE IF EXISTS ONLY public.workers DROP CONSTRAINT IF EXISTS workers_pkey;
ALTER TABLE IF EXISTS ONLY public.workers DROP CONSTRAINT IF EXISTS workers_essi_no_key;
ALTER TABLE IF EXISTS ONLY public.workers DROP CONSTRAINT IF EXISTS workers_eobi_no_key;
ALTER TABLE IF EXISTS ONLY public.workers DROP CONSTRAINT IF EXISTS workers_cnic_key;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.worker_applications DROP CONSTRAINT IF EXISTS worker_applications_application_no_key;
ALTER TABLE IF EXISTS ONLY public.utility_payments DROP CONSTRAINT IF EXISTS utility_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.utility_connections DROP CONSTRAINT IF EXISTS utility_connections_utility_type_consumer_number_key;
ALTER TABLE IF EXISTS ONLY public.utility_connections DROP CONSTRAINT IF EXISTS utility_connections_pkey;
ALTER TABLE IF EXISTS ONLY public.utility_bills DROP CONSTRAINT IF EXISTS utility_bills_utility_connection_id_billing_month_key;
ALTER TABLE IF EXISTS ONLY public.utility_bills DROP CONSTRAINT IF EXISTS utility_bills_pkey;
ALTER TABLE IF EXISTS ONLY public.utility_bill_fetch_attempts DROP CONSTRAINT IF EXISTS utility_bill_fetch_attempts_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.task_proofs DROP CONSTRAINT IF EXISTS task_proofs_pkey;
ALTER TABLE IF EXISTS ONLY public.residential_units DROP CONSTRAINT IF EXISTS residential_units_pkey;
ALTER TABLE IF EXISTS ONLY public.residential_units DROP CONSTRAINT IF EXISTS residential_units_colony_id_flat_no_key;
ALTER TABLE IF EXISTS ONLY public.rent_remittances DROP CONSTRAINT IF EXISTS rent_remittances_pkey;
ALTER TABLE IF EXISTS ONLY public.rent_rates DROP CONSTRAINT IF EXISTS rent_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.rent_payments DROP CONSTRAINT IF EXISTS rent_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.rent_invoices DROP CONSTRAINT IF EXISTS rent_invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.rent_invoices DROP CONSTRAINT IF EXISTS rent_invoices_flat_assignment_id_billing_month_key;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.late_fee_rules DROP CONSTRAINT IF EXISTS late_fee_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.industry_users DROP CONSTRAINT IF EXISTS industry_users_pkey;
ALTER TABLE IF EXISTS ONLY public.industry_users DROP CONSTRAINT IF EXISTS industry_users_industry_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.industries DROP CONSTRAINT IF EXISTS industries_registration_no_key;
ALTER TABLE IF EXISTS ONLY public.industries DROP CONSTRAINT IF EXISTS industries_pkey;
ALTER TABLE IF EXISTS ONLY public.flat_assignments DROP CONSTRAINT IF EXISTS flat_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.eviction_hearings DROP CONSTRAINT IF EXISTS eviction_hearings_pkey;
ALTER TABLE IF EXISTS ONLY public.eviction_cases DROP CONSTRAINT IF EXISTS eviction_cases_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.document_types DROP CONSTRAINT IF EXISTS document_types_pkey;
ALTER TABLE IF EXISTS ONLY public.document_types DROP CONSTRAINT IF EXISTS document_types_code_key;
ALTER TABLE IF EXISTS ONLY public.districts DROP CONSTRAINT IF EXISTS districts_pkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_pkey;
ALTER TABLE IF EXISTS ONLY public.complaint_budgets DROP CONSTRAINT IF EXISTS complaint_budgets_pkey;
ALTER TABLE IF EXISTS ONLY public.colonies DROP CONSTRAINT IF EXISTS colonies_pkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_tasks DROP CONSTRAINT IF EXISTS caretaker_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_gps_tracking DROP CONSTRAINT IF EXISTS caretaker_gps_tracking_pkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_colonies DROP CONSTRAINT IF EXISTS caretaker_colonies_pkey;
ALTER TABLE IF EXISTS ONLY public.caretaker_attendance DROP CONSTRAINT IF EXISTS caretaker_attendance_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.assets DROP CONSTRAINT IF EXISTS assets_pkey;
ALTER TABLE IF EXISTS ONLY public.asset_status_history DROP CONSTRAINT IF EXISTS asset_status_history_pkey;
ALTER TABLE IF EXISTS public.zones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.workers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.worker_applications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.utility_payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.utility_connections ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.utility_bills ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.utility_bill_fetch_attempts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.task_proofs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.residential_units ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rent_remittances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rent_rates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rent_payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rent_invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.late_fee_rules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.industry_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.industries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.flat_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.eviction_hearings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.eviction_cases ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.document_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.districts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.complaints ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.complaint_budgets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.colonies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.caretaker_tasks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.caretaker_gps_tracking ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.caretaker_colonies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.caretaker_attendance ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.assets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.asset_status_history ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.zones_id_seq;
DROP TABLE IF EXISTS public.zones;
DROP SEQUENCE IF EXISTS public.workers_id_seq;
DROP TABLE IF EXISTS public.workers;
DROP SEQUENCE IF EXISTS public.worker_applications_id_seq;
DROP TABLE IF EXISTS public.worker_applications;
DROP SEQUENCE IF EXISTS public.utility_payments_id_seq;
DROP TABLE IF EXISTS public.utility_payments;
DROP SEQUENCE IF EXISTS public.utility_connections_id_seq;
DROP TABLE IF EXISTS public.utility_connections;
DROP SEQUENCE IF EXISTS public.utility_bills_id_seq;
DROP TABLE IF EXISTS public.utility_bills;
DROP SEQUENCE IF EXISTS public.utility_bill_fetch_attempts_id_seq;
DROP TABLE IF EXISTS public.utility_bill_fetch_attempts;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.task_proofs_id_seq;
DROP TABLE IF EXISTS public.task_proofs;
DROP SEQUENCE IF EXISTS public.residential_units_id_seq;
DROP TABLE IF EXISTS public.residential_units;
DROP SEQUENCE IF EXISTS public.rent_remittances_id_seq;
DROP TABLE IF EXISTS public.rent_remittances;
DROP SEQUENCE IF EXISTS public.rent_rates_id_seq;
DROP TABLE IF EXISTS public.rent_rates;
DROP SEQUENCE IF EXISTS public.rent_payments_id_seq;
DROP TABLE IF EXISTS public.rent_payments;
DROP SEQUENCE IF EXISTS public.rent_invoices_id_seq;
DROP TABLE IF EXISTS public.rent_invoices;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.late_fee_rules_id_seq;
DROP TABLE IF EXISTS public.late_fee_rules;
DROP SEQUENCE IF EXISTS public.industry_users_id_seq;
DROP TABLE IF EXISTS public.industry_users;
DROP SEQUENCE IF EXISTS public.industries_id_seq;
DROP TABLE IF EXISTS public.industries;
DROP SEQUENCE IF EXISTS public.flat_assignments_id_seq;
DROP TABLE IF EXISTS public.flat_assignments;
DROP SEQUENCE IF EXISTS public.eviction_hearings_id_seq;
DROP TABLE IF EXISTS public.eviction_hearings;
DROP SEQUENCE IF EXISTS public.eviction_cases_id_seq;
DROP TABLE IF EXISTS public.eviction_cases;
DROP SEQUENCE IF EXISTS public.documents_id_seq;
DROP TABLE IF EXISTS public.documents;
DROP SEQUENCE IF EXISTS public.document_types_id_seq;
DROP TABLE IF EXISTS public.document_types;
DROP SEQUENCE IF EXISTS public.districts_id_seq;
DROP TABLE IF EXISTS public.districts;
DROP SEQUENCE IF EXISTS public.complaints_id_seq;
DROP TABLE IF EXISTS public.complaints;
DROP SEQUENCE IF EXISTS public.complaint_budgets_id_seq;
DROP TABLE IF EXISTS public.complaint_budgets;
DROP SEQUENCE IF EXISTS public.colonies_id_seq;
DROP TABLE IF EXISTS public.colonies;
DROP SEQUENCE IF EXISTS public.caretaker_tasks_id_seq;
DROP TABLE IF EXISTS public.caretaker_tasks;
DROP SEQUENCE IF EXISTS public.caretaker_gps_tracking_id_seq;
DROP TABLE IF EXISTS public.caretaker_gps_tracking;
DROP SEQUENCE IF EXISTS public.caretaker_colonies_id_seq;
DROP TABLE IF EXISTS public.caretaker_colonies;
DROP SEQUENCE IF EXISTS public.caretaker_attendance_id_seq;
DROP TABLE IF EXISTS public.caretaker_attendance;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.assets_id_seq;
DROP TABLE IF EXISTS public.assets;
DROP SEQUENCE IF EXISTS public.asset_status_history_id_seq;
DROP TABLE IF EXISTS public.asset_status_history;
DROP TYPE IF EXISTS public.worker_type;
DROP TYPE IF EXISTS public.worker_status;
DROP TYPE IF EXISTS public.verification_status;
DROP TYPE IF EXISTS public.utility_type;
DROP TYPE IF EXISTS public.user_status;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.task_status;
DROP TYPE IF EXISTS public.rent_invoice_status;
DROP TYPE IF EXISTS public.recipient_type;
DROP TYPE IF EXISTS public.payment_mode;
DROP TYPE IF EXISTS public.notification_status;
DROP TYPE IF EXISTS public.late_fee_type;
DROP TYPE IF EXISTS public.flat_status;
DROP TYPE IF EXISTS public.fetch_attempt_status;
DROP TYPE IF EXISTS public.eviction_status;
DROP TYPE IF EXISTS public.document_visibility;
DROP TYPE IF EXISTS public.document_status;
DROP TYPE IF EXISTS public.document_owner;
DROP TYPE IF EXISTS public.deduction_status;
DROP TYPE IF EXISTS public.complaint_status;
DROP TYPE IF EXISTS public.committee_decision;
DROP TYPE IF EXISTS public.bill_status;
DROP TYPE IF EXISTS public.attendance_status;
DROP TYPE IF EXISTS public.assignment_status;
DROP TYPE IF EXISTS public.asset_status;
DROP TYPE IF EXISTS public.application_type;
DROP TYPE IF EXISTS public.application_status;
--
-- Name: application_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.application_status AS ENUM (
    'draft',
    'submitted',
    'under_verification',
    'verification_failed',
    'verified',
    'committee_pending',
    'approved',
    'rejected',
    'flat_assigned',
    'cancelled',
    'closed'
);


--
-- Name: application_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.application_type AS ENUM (
    'new_allotment',
    'reapply',
    'reallotment',
    'transfer',
    'flat_change',
    'vacation',
    'cancellation'
);


--
-- Name: asset_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.asset_status AS ENUM (
    'ok',
    'defective',
    'under_repair',
    'repaired',
    'inactive'
);


--
-- Name: assignment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.assignment_status AS ENUM (
    'active',
    'vacated',
    'cancelled',
    'transferred',
    'expired'
);


--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.attendance_status AS ENUM (
    'active',
    'completed',
    'force_closed'
);


--
-- Name: bill_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bill_status AS ENUM (
    'unpaid',
    'partial',
    'paid',
    'overdue',
    'cancelled',
    'not_generated'
);


--
-- Name: committee_decision; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.committee_decision AS ENUM (
    'approved',
    'rejected',
    'deferred'
);


--
-- Name: complaint_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.complaint_status AS ENUM (
    'open',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
    'rejected',
    'reopened'
);


--
-- Name: deduction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.deduction_status AS ENUM (
    'not_required',
    'pending',
    'deducted',
    'failed',
    'adjusted'
);


--
-- Name: document_owner; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_owner AS ENUM (
    'worker',
    'allotment',
    'complaint',
    'rent_payment',
    'utility_bill',
    'asset',
    'task_proof',
    'eviction_case'
);


--
-- Name: document_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_status AS ENUM (
    'pending',
    'processing',
    'approved',
    'rejected',
    'completed',
    'expired',
    'archived'
);


--
-- Name: document_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_visibility AS ENUM (
    'worker',
    'management_only',
    'finance',
    'director',
    'caretaker'
);


--
-- Name: eviction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.eviction_status AS ENUM (
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


--
-- Name: fetch_attempt_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fetch_attempt_status AS ENUM (
    'found',
    'not_generated',
    'api_failed',
    'invalid_consumer'
);


--
-- Name: flat_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.flat_status AS ENUM (
    'empty',
    'reserved',
    'filled',
    'under_repair',
    'sealed',
    'disputed'
);


--
-- Name: late_fee_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.late_fee_type AS ENUM (
    'per_day',
    'fixed',
    'percentage'
);


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'sent',
    'read',
    'failed'
);


--
-- Name: payment_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_mode AS ENUM (
    'manual',
    'salary_deduction',
    'bank_transfer',
    'online'
);


--
-- Name: recipient_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.recipient_type AS ENUM (
    'user',
    'worker',
    'industry'
);


--
-- Name: rent_invoice_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rent_invoice_status AS ENUM (
    'unpaid',
    'partial',
    'paid',
    'overdue',
    'cancelled',
    'adjusted'
);


--
-- Name: task_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.task_status AS ENUM (
    'assigned',
    'accepted',
    'in_progress',
    'proof_uploaded',
    'completed',
    'rejected',
    'cancelled'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
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


--
-- Name: user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'disabled',
    'blocked'
);


--
-- Name: utility_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.utility_type AS ENUM (
    'electricity',
    'gas',
    'water',
    'internet',
    'ptcl',
    'other'
);


--
-- Name: verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'passed',
    'failed'
);


--
-- Name: worker_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.worker_status AS ENUM (
    'pending',
    'under_verification',
    'approved',
    'active',
    'rejected',
    'inactive',
    'left',
    'blacklisted'
);


--
-- Name: worker_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.worker_type AS ENUM (
    'welfare_board',
    'industry'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asset_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_status_history (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    status public.asset_status DEFAULT 'ok'::public.asset_status NOT NULL,
    repaired_image_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: asset_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asset_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asset_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asset_status_history_id_seq OWNED BY public.asset_status_history.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(500),
    category character varying(255),
    colony_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    latitude numeric(10,7),
    longitude numeric(10,7)
);


--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(255) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id integer,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: caretaker_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.caretaker_attendance (
    id integer NOT NULL,
    user_id integer NOT NULL,
    duty_date date NOT NULL,
    login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    login_latitude numeric(10,7),
    login_longitude numeric(10,7),
    logout_time timestamp without time zone,
    logout_latitude numeric(10,7),
    logout_longitude numeric(10,7),
    status public.attendance_status DEFAULT 'active'::public.attendance_status NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: caretaker_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.caretaker_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: caretaker_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.caretaker_attendance_id_seq OWNED BY public.caretaker_attendance.id;


--
-- Name: caretaker_colonies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.caretaker_colonies (
    id integer NOT NULL,
    user_id integer NOT NULL,
    colony_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: caretaker_colonies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.caretaker_colonies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: caretaker_colonies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.caretaker_colonies_id_seq OWNED BY public.caretaker_colonies.id;


--
-- Name: caretaker_gps_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.caretaker_gps_tracking (
    id integer NOT NULL,
    user_id integer NOT NULL,
    attendance_id integer,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    accuracy numeric(10,2),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    battery_level integer,
    is_mock_location boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: caretaker_gps_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.caretaker_gps_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: caretaker_gps_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.caretaker_gps_tracking_id_seq OWNED BY public.caretaker_gps_tracking.id;


--
-- Name: caretaker_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.caretaker_tasks (
    id integer NOT NULL,
    asset_id integer,
    complaint_id integer,
    flat_id integer,
    assigned_to_user_id integer,
    assigned_by_user_id integer,
    task_title character varying(255) NOT NULL,
    task_description text,
    target_latitude numeric(10,7),
    target_longitude numeric(10,7),
    allowed_radius_meters integer DEFAULT 100,
    status public.task_status DEFAULT 'assigned'::public.task_status NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    due_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: caretaker_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.caretaker_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: caretaker_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.caretaker_tasks_id_seq OWNED BY public.caretaker_tasks.id;


--
-- Name: colonies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.colonies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(500) NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    district_id integer,
    latitude numeric(10,7),
    longitude numeric(10,7),
    zone_id integer
);


--
-- Name: colonies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.colonies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: colonies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.colonies_id_seq OWNED BY public.colonies.id;


--
-- Name: complaint_budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_budgets (
    id integer NOT NULL,
    complaint_id integer NOT NULL,
    budget bigint DEFAULT 0 NOT NULL,
    document_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: complaint_budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaint_budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaint_budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaint_budgets_id_seq OWNED BY public.complaint_budgets.id;


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    id integer NOT NULL,
    worker_id integer,
    colony_id integer,
    flat_id integer,
    complaint_desc text NOT NULL,
    assigned_caretaker_id integer,
    status public.complaint_status DEFAULT 'open'::public.complaint_status NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    complaint_type character varying(50),
    latitude numeric(10,7),
    longitude numeric(10,7),
    allowed_radius_meters integer DEFAULT 100,
    resolved_image_id integer,
    resolved_latitude numeric(10,7),
    resolved_longitude numeric(10,7),
    resolved_distance_meters numeric(10,2),
    resolved_by integer,
    resolved_at timestamp(6) without time zone,
    resolution_remarks character varying(500)
);


--
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.districts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.districts_id_seq OWNED BY public.districts.id;


--
-- Name: document_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    module character varying(100) NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    allowed_file_type character varying(255) DEFAULT 'pdf,jpg,jpeg,png'::character varying NOT NULL,
    max_file_size_mb integer DEFAULT 5 NOT NULL,
    description character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    default_visibility public.document_visibility DEFAULT 'management_only'::public.document_visibility NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: document_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.document_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.document_types_id_seq OWNED BY public.document_types.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    document_type_id integer NOT NULL,
    owner_type public.document_owner DEFAULT 'worker'::public.document_owner NOT NULL,
    owner_id integer,
    application_id integer,
    file_path character varying(700) NOT NULL,
    original_file_name character varying(255) NOT NULL,
    mime_type character varying(255) NOT NULL,
    file_size bigint,
    status public.document_status DEFAULT 'pending'::public.document_status NOT NULL,
    visibility public.document_visibility DEFAULT 'management_only'::public.document_visibility NOT NULL,
    uploaded_by integer,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verified_by integer,
    verified_at timestamp without time zone,
    rejection_reason character varying(500),
    remarks character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: eviction_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eviction_cases (
    id integer NOT NULL,
    worker_id integer,
    colony_id integer,
    flat_id integer,
    occupant_name character varying(255) NOT NULL,
    occupant_cnic character varying(30),
    occupant_phone character varying(30),
    illegal_reason text,
    case_no character varying(100),
    court_name character varying(255),
    police_station character varying(255),
    administration_contact character varying(255),
    filed_date date,
    next_hearing_date date,
    decision_summary text,
    status public.eviction_status DEFAULT 'illegal_identified'::public.eviction_status NOT NULL,
    vacant_date date,
    remarks character varying(500),
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: eviction_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eviction_cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eviction_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eviction_cases_id_seq OWNED BY public.eviction_cases.id;


--
-- Name: eviction_hearings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eviction_hearings (
    id integer NOT NULL,
    eviction_case_id integer NOT NULL,
    hearing_date date NOT NULL,
    next_hearing_date date,
    proceedings text,
    decision_summary text,
    document_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: eviction_hearings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eviction_hearings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eviction_hearings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eviction_hearings_id_seq OWNED BY public.eviction_hearings.id;


--
-- Name: flat_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flat_assignments (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    flat_id integer NOT NULL,
    application_id integer,
    start_date date NOT NULL,
    end_date date,
    status public.assignment_status DEFAULT 'active'::public.assignment_status NOT NULL,
    allotment_order_no character varying(255),
    allotment_order_date date,
    vacated_reason character varying(500),
    remarks character varying(500),
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rent_amount bigint DEFAULT 0 NOT NULL
);


--
-- Name: flat_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flat_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flat_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flat_assignments_id_seq OWNED BY public.flat_assignments.id;


--
-- Name: industries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industries (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    registration_no character varying(100),
    address character varying(500),
    contact_person character varying(255),
    phone character varying(30),
    email character varying(255),
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    latitude numeric(10,7),
    longitude numeric(10,7)
);


--
-- Name: industries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.industries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: industries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.industries_id_seq OWNED BY public.industries.id;


--
-- Name: industry_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.industry_users (
    id integer NOT NULL,
    industry_id integer NOT NULL,
    user_id integer NOT NULL,
    designation character varying(255),
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: industry_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.industry_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: industry_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.industry_users_id_seq OWNED BY public.industry_users.id;


--
-- Name: late_fee_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.late_fee_rules (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    fee_type public.late_fee_type DEFAULT 'per_day'::public.late_fee_type NOT NULL,
    amount bigint NOT NULL,
    grace_days integer DEFAULT 0 NOT NULL,
    max_fee_amount bigint,
    effective_from date NOT NULL,
    effective_to date,
    is_active boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: late_fee_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.late_fee_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: late_fee_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.late_fee_rules_id_seq OWNED BY public.late_fee_rules.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    recipient_type public.recipient_type NOT NULL,
    recipient_id integer NOT NULL,
    application_id integer,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    notification_type character varying(100),
    status public.notification_status DEFAULT 'pending'::public.notification_status NOT NULL,
    sent_at timestamp without time zone,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: rent_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rent_invoices (
    id integer NOT NULL,
    flat_assignment_id integer NOT NULL,
    worker_id integer NOT NULL,
    billing_month date NOT NULL,
    rent_rate_id integer,
    rent_amount bigint DEFAULT 0 NOT NULL,
    due_date date NOT NULL,
    late_fee_rule_id integer,
    late_fee_amount bigint DEFAULT 0 NOT NULL,
    total_amount bigint DEFAULT 0 NOT NULL,
    paid_amount bigint DEFAULT 0 NOT NULL,
    payment_mode public.payment_mode DEFAULT 'manual'::public.payment_mode NOT NULL,
    deduction_status public.deduction_status DEFAULT 'not_required'::public.deduction_status NOT NULL,
    status public.rent_invoice_status DEFAULT 'unpaid'::public.rent_invoice_status NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rent_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rent_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rent_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rent_invoices_id_seq OWNED BY public.rent_invoices.id;


--
-- Name: rent_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rent_payments (
    id integer NOT NULL,
    rent_invoice_id integer NOT NULL,
    amount bigint NOT NULL,
    payment_date date NOT NULL,
    collected_user_id integer,
    payment_method character varying(100),
    receipt_no character varying(100),
    remarks character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    remittance_id integer
);


--
-- Name: rent_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rent_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rent_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rent_payments_id_seq OWNED BY public.rent_payments.id;


--
-- Name: rent_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rent_rates (
    id integer NOT NULL,
    colony_id integer,
    unit_type character varying(100),
    amount bigint NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    flat_id integer
);


--
-- Name: rent_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rent_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rent_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rent_rates_id_seq OWNED BY public.rent_rates.id;


--
-- Name: rent_remittances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rent_remittances (
    id integer NOT NULL,
    caretaker_user_id integer NOT NULL,
    received_by_user_id integer,
    total_amount bigint DEFAULT 0 NOT NULL,
    payment_count integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'received'::character varying NOT NULL,
    remarks character varying(500),
    received_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rent_remittances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rent_remittances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rent_remittances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rent_remittances_id_seq OWNED BY public.rent_remittances.id;


--
-- Name: residential_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.residential_units (
    id integer NOT NULL,
    flat_no character varying(255) NOT NULL,
    flat_address character varying(500) NOT NULL,
    flat_rooms integer,
    status public.flat_status DEFAULT 'empty'::public.flat_status NOT NULL,
    colony_id integer NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    latitude numeric(10,7),
    longitude numeric(10,7)
);


--
-- Name: residential_units_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.residential_units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: residential_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.residential_units_id_seq OWNED BY public.residential_units.id;


--
-- Name: task_proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_proofs (
    id integer NOT NULL,
    task_id integer NOT NULL,
    uploaded_by_user_id integer,
    image_document_id integer,
    latitude numeric(10,7),
    longitude numeric(10,7),
    accuracy numeric(10,2),
    distance_from_target_meters numeric(10,2),
    is_within_allowed_radius boolean DEFAULT false,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    remarks character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: task_proofs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.task_proofs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_proofs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.task_proofs_id_seq OWNED BY public.task_proofs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone_number character varying(30),
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    profile_photo character varying(500),
    role public.user_role DEFAULT 'care_taker_labour_colony'::public.user_role NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: utility_bill_fetch_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utility_bill_fetch_attempts (
    id integer NOT NULL,
    utility_connection_id integer NOT NULL,
    billing_month date NOT NULL,
    attempted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status public.fetch_attempt_status NOT NULL,
    api_response_code character varying(100),
    error_message character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: utility_bill_fetch_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utility_bill_fetch_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utility_bill_fetch_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utility_bill_fetch_attempts_id_seq OWNED BY public.utility_bill_fetch_attempts.id;


--
-- Name: utility_bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utility_bills (
    id integer NOT NULL,
    utility_connection_id integer,
    flat_assignment_id integer,
    worker_id integer,
    flat_id integer,
    utility_type public.utility_type NOT NULL,
    billing_month date NOT NULL,
    amount bigint DEFAULT 0 NOT NULL,
    due_date date,
    status public.bill_status DEFAULT 'unpaid'::public.bill_status NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: utility_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utility_bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utility_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utility_bills_id_seq OWNED BY public.utility_bills.id;


--
-- Name: utility_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utility_connections (
    id integer NOT NULL,
    flat_id integer NOT NULL,
    utility_type public.utility_type NOT NULL,
    provider_name character varying(255),
    consumer_number character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: utility_connections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utility_connections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utility_connections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utility_connections_id_seq OWNED BY public.utility_connections.id;


--
-- Name: utility_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utility_payments (
    id integer NOT NULL,
    utility_bill_id integer NOT NULL,
    amount bigint NOT NULL,
    payment_date date NOT NULL,
    collected_by_user_id integer,
    receipt_no character varying(100),
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: utility_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utility_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utility_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utility_payments_id_seq OWNED BY public.utility_payments.id;


--
-- Name: worker_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_applications (
    id integer NOT NULL,
    application_no character varying(100) NOT NULL,
    application_type public.application_type NOT NULL,
    status public.application_status DEFAULT 'draft'::public.application_status NOT NULL,
    worker_id integer NOT NULL,
    industry_id integer,
    submitted_by_user_id integer,
    current_flat_assignment_id integer,
    requested_colony_id integer,
    requested_unit_type character varying(100),
    submitted_at timestamp without time zone,
    verified_by integer,
    verified_at timestamp without time zone,
    verification_status public.verification_status DEFAULT 'pending'::public.verification_status,
    verification_remarks character varying(500),
    committee_meeting_id integer,
    committee_decision public.committee_decision,
    committee_decision_date date,
    committee_remarks character varying(500),
    approved_by integer,
    approved_at timestamp without time zone,
    rejected_by integer,
    rejected_at timestamp without time zone,
    rejected_reason character varying(500),
    priority_score integer DEFAULT 0,
    remarks character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    recommended_rent_amount bigint
);


--
-- Name: worker_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.worker_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: worker_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.worker_applications_id_seq OWNED BY public.worker_applications.id;


--
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    father_name character varying(255) NOT NULL,
    cnic character varying(15) NOT NULL,
    dob date NOT NULL,
    address character varying(500),
    essi_no character varying(255),
    eobi_no character varying(255),
    designation character varying(255),
    salary_per_month bigint,
    total_duration_service integer,
    total_payment_by character varying(50),
    total_number_dependents integer,
    mobile_no_1 character varying(20),
    mobile_no_2 character varying(20),
    worker_type public.worker_type DEFAULT 'industry'::public.worker_type NOT NULL,
    status public.worker_status DEFAULT 'pending'::public.worker_status NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: workers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workers_id_seq OWNED BY public.workers.id;


--
-- Name: zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zones (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    ad_user_id integer,
    created_at timestamp(6) without time zone DEFAULT now(),
    updated_at timestamp(6) without time zone DEFAULT now()
);


--
-- Name: zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zones_id_seq OWNED BY public.zones.id;


--
-- Name: asset_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_status_history ALTER COLUMN id SET DEFAULT nextval('public.asset_status_history_id_seq'::regclass);


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: caretaker_attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_attendance ALTER COLUMN id SET DEFAULT nextval('public.caretaker_attendance_id_seq'::regclass);


--
-- Name: caretaker_colonies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_colonies ALTER COLUMN id SET DEFAULT nextval('public.caretaker_colonies_id_seq'::regclass);


--
-- Name: caretaker_gps_tracking id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_gps_tracking ALTER COLUMN id SET DEFAULT nextval('public.caretaker_gps_tracking_id_seq'::regclass);


--
-- Name: caretaker_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_tasks ALTER COLUMN id SET DEFAULT nextval('public.caretaker_tasks_id_seq'::regclass);


--
-- Name: colonies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colonies ALTER COLUMN id SET DEFAULT nextval('public.colonies_id_seq'::regclass);


--
-- Name: complaint_budgets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_budgets ALTER COLUMN id SET DEFAULT nextval('public.complaint_budgets_id_seq'::regclass);


--
-- Name: complaints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);


--
-- Name: districts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts ALTER COLUMN id SET DEFAULT nextval('public.districts_id_seq'::regclass);


--
-- Name: document_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_types ALTER COLUMN id SET DEFAULT nextval('public.document_types_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: eviction_cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_cases ALTER COLUMN id SET DEFAULT nextval('public.eviction_cases_id_seq'::regclass);


--
-- Name: eviction_hearings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_hearings ALTER COLUMN id SET DEFAULT nextval('public.eviction_hearings_id_seq'::regclass);


--
-- Name: flat_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flat_assignments ALTER COLUMN id SET DEFAULT nextval('public.flat_assignments_id_seq'::regclass);


--
-- Name: industries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industries ALTER COLUMN id SET DEFAULT nextval('public.industries_id_seq'::regclass);


--
-- Name: industry_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_users ALTER COLUMN id SET DEFAULT nextval('public.industry_users_id_seq'::regclass);


--
-- Name: late_fee_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.late_fee_rules ALTER COLUMN id SET DEFAULT nextval('public.late_fee_rules_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: rent_invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_invoices ALTER COLUMN id SET DEFAULT nextval('public.rent_invoices_id_seq'::regclass);


--
-- Name: rent_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments ALTER COLUMN id SET DEFAULT nextval('public.rent_payments_id_seq'::regclass);


--
-- Name: rent_rates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_rates ALTER COLUMN id SET DEFAULT nextval('public.rent_rates_id_seq'::regclass);


--
-- Name: rent_remittances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_remittances ALTER COLUMN id SET DEFAULT nextval('public.rent_remittances_id_seq'::regclass);


--
-- Name: residential_units id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residential_units ALTER COLUMN id SET DEFAULT nextval('public.residential_units_id_seq'::regclass);


--
-- Name: task_proofs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_proofs ALTER COLUMN id SET DEFAULT nextval('public.task_proofs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: utility_bill_fetch_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bill_fetch_attempts ALTER COLUMN id SET DEFAULT nextval('public.utility_bill_fetch_attempts_id_seq'::regclass);


--
-- Name: utility_bills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills ALTER COLUMN id SET DEFAULT nextval('public.utility_bills_id_seq'::regclass);


--
-- Name: utility_connections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_connections ALTER COLUMN id SET DEFAULT nextval('public.utility_connections_id_seq'::regclass);


--
-- Name: utility_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_payments ALTER COLUMN id SET DEFAULT nextval('public.utility_payments_id_seq'::regclass);


--
-- Name: worker_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications ALTER COLUMN id SET DEFAULT nextval('public.worker_applications_id_seq'::regclass);


--
-- Name: workers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers ALTER COLUMN id SET DEFAULT nextval('public.workers_id_seq'::regclass);


--
-- Name: zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones ALTER COLUMN id SET DEFAULT nextval('public.zones_id_seq'::regclass);


--
-- Data for Name: asset_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_status_history (id, asset_id, status, repaired_image_id, created_at, updated_at) FROM stdin;
1	1	ok	\N	2026-06-07 08:09:31.089	2026-06-07 08:09:31.089
2	2	ok	\N	2026-06-11 10:50:02.661	2026-06-11 10:50:02.661
3	2	under_repair	\N	2026-06-11 10:50:21.91	2026-06-11 10:50:21.91
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assets (id, name, address, category, colony_id, created_at, updated_at, latitude, longitude) FROM stdin;
1	trans 1010	Near gate b	transformer	2	2026-06-07 08:09:31.03	2026-06-07 08:09:31.03	\N	\N
2	ROADW3Q	SDa	roads	3	2026-06-11 10:50:02.407	2026-06-11 10:50:02.407	33.9859890	71.4987069
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: caretaker_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.caretaker_attendance (id, user_id, duty_date, login_time, login_latitude, login_longitude, logout_time, logout_latitude, logout_longitude, status, created_at, updated_at) FROM stdin;
1	3	2026-05-31	2026-05-31 07:44:07.854	34.0000000	72.1300000	2026-05-31 07:44:17.201	34.0000000	72.1300000	completed	2026-05-31 07:44:07.854	2026-05-31 07:44:07.854
4	13	2026-06-08	2026-06-08 20:39:41.4	33.9644780	72.2305450	2026-06-08 20:46:18.304	34.0000000	72.1300000	completed	2026-06-08 20:39:41.4	2026-06-08 20:39:41.4
3	13	2026-06-08	2026-06-08 20:33:05.682	33.9644780	72.2305450	2026-06-11 09:59:22.28	33.9929406	71.4375680	completed	2026-06-08 20:33:05.682	2026-06-08 20:33:05.682
2	1	2026-06-05	2026-06-05 16:18:05.377	34.0151000	71.5249000	2026-06-13 16:08:24.843	33.9644780	72.2305450	completed	2026-06-05 16:18:05.377	2026-06-05 16:18:05.377
5	18	2026-06-13	2026-06-13 16:14:50.42	33.9644780	72.2305450	2026-06-13 16:14:57.416	33.9644780	72.2305450	completed	2026-06-13 16:14:50.42	2026-06-13 16:14:50.42
6	18	2026-06-14	2026-06-14 20:18:43.064	34.0151000	71.5249000	2026-06-14 20:24:38.5	34.0085192	71.4732607	completed	2026-06-14 20:18:43.064	2026-06-14 20:18:43.064
7	18	2026-06-14	2026-06-14 20:24:43.09	34.0085192	71.4732607	\N	\N	\N	active	2026-06-14 20:24:43.09	2026-06-14 20:24:43.09
\.


--
-- Data for Name: caretaker_colonies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.caretaker_colonies (id, user_id, colony_id, is_active, created_at, updated_at) FROM stdin;
1	21	2	f	2026-06-13 15:37:33.512	2026-06-13 15:37:33.512
3	21	3	t	2026-06-13 15:38:16.701	2026-06-13 15:38:16.701
5	18	2	t	2026-06-13 15:42:18.439	2026-06-13 15:42:18.439
6	13	1	t	2026-06-13 15:42:25.572	2026-06-13 15:42:25.572
\.


--
-- Data for Name: caretaker_gps_tracking; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.caretaker_gps_tracking (id, user_id, attendance_id, latitude, longitude, accuracy, recorded_at, battery_level, is_mock_location, created_at) FROM stdin;
1	1	2	34.0152000	71.5250000	11.00	2026-06-05 16:18:05.435	\N	f	2026-06-05 16:18:05.435
2	13	2	33.9644780	72.2305450	178.00	2026-06-08 20:33:05.69	\N	f	2026-06-08 20:33:05.69
3	13	3	33.9644780	72.2305450	178.00	2026-06-08 20:33:06.333	\N	f	2026-06-08 20:33:06.333
4	13	3	33.9644780	72.2305450	178.00	2026-06-08 20:39:41.545	\N	f	2026-06-08 20:39:41.545
5	13	3	33.9644780	72.2305450	178.00	2026-06-08 20:39:41.723	\N	f	2026-06-08 20:39:41.723
6	18	\N	33.9644780	72.2305450	178.00	2026-06-13 16:14:50.553	\N	f	2026-06-13 16:14:50.553
7	18	\N	33.9644780	72.2305450	178.00	2026-06-13 16:14:50.696	\N	f	2026-06-13 16:14:50.696
8	18	7	34.0085192	71.4732607	90.00	2026-06-14 20:24:43.55	\N	f	2026-06-14 20:24:43.55
9	18	7	34.0085053	71.4732686	88.00	2026-06-14 20:24:50.432	\N	f	2026-06-14 20:24:50.432
\.


--
-- Data for Name: caretaker_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.caretaker_tasks (id, asset_id, complaint_id, flat_id, assigned_to_user_id, assigned_by_user_id, task_title, task_description, target_latitude, target_longitude, allowed_radius_meters, status, assigned_at, due_at, created_at, updated_at) FROM stdin;
1	\N	\N	\N	1	\N	Flow task	Flow task desc	34.0152000	71.5250000	100	completed	2026-06-05 16:18:05.493	\N	2026-06-05 16:18:05.493	2026-06-05 16:18:05.493
2	\N	1	1	1	1	Complaint #1	Documented payload complaint	\N	\N	100	assigned	2026-06-05 16:18:58.43	\N	2026-06-05 16:18:58.43	2026-06-05 16:18:58.43
3	1	\N	2	13	\N	repiar this transformer	ksdvMklsdvmKLDVMkvmlkmsPCDio[s'	34.0000000	71.0000000	100	in_progress	2026-06-08 20:32:14.635	2026-06-10 20:32:00	2026-06-08 20:32:14.635	2026-06-08 20:32:14.635
4	\N	3	\N	3	22	Complaint #3	ijfioewrfjeior	\N	\N	100	assigned	2026-06-14 20:42:06.418	2026-06-26 20:42:00	2026-06-14 20:42:06.418	2026-06-14 20:42:06.418
\.


--
-- Data for Name: colonies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.colonies (id, name, address, created_by, created_at, updated_at, district_id, latitude, longitude, zone_id) FROM stdin;
1	Flow Colony 460492	Flow Address	\N	2026-06-05 16:18:04.218	2026-06-05 16:18:04.218	\N	\N	\N	\N
2	Test Colony 861	Worker Welfare Board Test Colony, Peshawar	\N	2026-06-06 07:42:16.708	2026-06-06 07:42:16.708	\N	\N	\N	\N
3	Meeting Demo Colony	Workers Welfare Board Meeting Demo Colony, Peshawar	1	2026-06-11 02:24:43.397494	2026-06-11 02:24:43.397494	\N	34.0151000	71.5249000	\N
\.


--
-- Data for Name: complaint_budgets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaint_budgets (id, complaint_id, budget, document_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaints (id, worker_id, colony_id, flat_id, complaint_desc, assigned_caretaker_id, status, created_at, updated_at, complaint_type, latitude, longitude, allowed_radius_meters, resolved_image_id, resolved_latitude, resolved_longitude, resolved_distance_meters, resolved_by, resolved_at, resolution_remarks) FROM stdin;
1	2	1	1	Documented payload complaint	1	resolved	2026-06-05 16:18:58.394	2026-06-05 16:18:58.394	\N	\N	\N	100	\N	\N	\N	\N	\N	\N	\N
3	\N	2	\N	ijfioewrfjeior	3	assigned	2026-06-14 20:26:46.209	2026-06-14 20:26:46.209	general	34.0085053	71.4732686	100	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.districts (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_types (id, name, code, module, is_required, allowed_file_type, max_file_size_mb, description, is_active, default_visibility, created_at, updated_at) FROM stdin;
1	CNIC	CNIC	worker	t	pdf,jpg,jpeg,png	5	Worker CNIC document	t	director	2026-06-05 16:10:39.148	2026-06-05 16:10:39.148
2	Domicile	DOMICILE	worker	f	pdf,jpg,jpeg,png	5	Worker domicile document	t	director	2026-06-05 16:10:39.212	2026-06-05 16:10:39.212
3	ESSI Verification	ESSI_VERIFICATION	worker	t	pdf,jpg,jpeg,png	5	ESSI verification proof	t	director	2026-06-05 16:10:39.222	2026-06-05 16:10:39.222
4	EOBI Verification	EOBI_VERIFICATION	worker	t	pdf,jpg,jpeg,png	5	EOBI verification proof	t	director	2026-06-05 16:10:39.232	2026-06-05 16:10:39.232
5	Appointment Letter	APPOINTMENT_LETTER	worker	t	pdf,jpg,jpeg,png	5	Employment appointment letter	t	director	2026-06-05 16:10:39.24	2026-06-05 16:10:39.24
6	Salary Proof	SALARY_PROOF	worker	t	pdf,jpg,jpeg,png	5	Worker salary proof	t	finance	2026-06-05 16:10:39.25	2026-06-05 16:10:39.25
7	Rent Receipt	RENT_RECEIPT	rent	f	pdf,jpg,jpeg,png	5	Rent payment receipt	t	finance	2026-06-05 16:10:39.26	2026-06-05 16:10:39.26
8	Task Proof Image	TASK_PROOF_IMAGE	task_proof	f	jpg,jpeg,png	5	Caretaker task proof image	t	caretaker	2026-06-05 16:10:39.269	2026-06-05 16:10:39.269
9	Complaint Resolution Proof	COMPLAINT_PROOF	complaints	f	jpg,jpeg,png,mp4,mov,webm,3gp	50	\N	t	caretaker	2026-06-13 14:30:51.664942	2026-06-13 14:30:51.664942
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, document_type_id, owner_type, owner_id, application_id, file_path, original_file_name, mime_type, file_size, status, visibility, uploaded_by, uploaded_at, verified_by, verified_at, rejection_reason, remarks, created_at, updated_at) FROM stdin;
1	1	worker	1	\N	uploads\\documents\\e591e877c4297f2e72714f1c407383b8	wwb-upload-test.png	image/png	68	approved	director	1	2026-06-05 16:11:13.518	1	2026-06-05 16:11:29.625	\N	Verified smoke test	2026-06-05 16:11:13.518	2026-06-05 16:11:13.518
2	8	worker	2	\N	uploads\\documents\\a36a6a3e8eadc8305ca8fb720e91ab38	flow-doc.png	image/png	68	approved	director	1	2026-06-05 16:18:04.101	1	2026-06-05 16:18:04.158	\N	Flow document verified	2026-06-05 16:18:04.101	2026-06-05 16:18:04.101
3	1	worker	3	3	uploads\\documents\\7cc13a6082e36061f10cc384b9d35037	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	7	2026-06-05 19:49:22.553	8	2026-06-06 07:14:55.297	\N	Approved from verification desk	2026-06-05 19:49:22.553	2026-06-05 19:49:22.553
4	2	worker	3	3	uploads\\documents\\dcfb7ef0f98ab599a59ccfc47dbff1bb	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	7	2026-06-05 19:49:22.592	8	2026-06-06 07:14:57.294	\N	Approved from verification desk	2026-06-05 19:49:22.592	2026-06-05 19:49:22.592
5	3	worker	3	3	uploads\\documents\\0b88e7572f69844258041f9769c2c4b9	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	7	2026-06-05 19:49:22.63	8	2026-06-06 07:14:58.306	\N	Approved from verification desk	2026-06-05 19:49:22.63	2026-06-05 19:49:22.63
6	4	worker	3	3	uploads\\documents\\2a937b9df09b531b799482d2ba3f1dbf	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	7	2026-06-05 19:49:22.681	8	2026-06-06 07:14:59.818	\N	Approved from verification desk	2026-06-05 19:49:22.681	2026-06-05 19:49:22.681
7	5	worker	3	3	uploads\\documents\\e11c54c5ac76b04d157b8f158d884014	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	7	2026-06-05 19:49:22.724	8	2026-06-06 07:15:00.811	\N	Approved from verification desk	2026-06-05 19:49:22.724	2026-06-05 19:49:22.724
8	6	worker	3	3	uploads\\documents\\2db378ebcd131af0e96283cbc38097a3	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	finance	7	2026-06-05 19:49:22.767	8	2026-06-06 07:15:02.097	\N	Approved from verification desk	2026-06-05 19:49:22.767	2026-06-05 19:49:22.767
9	8	allotment	3	3	uploads\\documents\\72b4145e151c6b27ecbd1a8104740864	ChatGPT Image May 22, 2026, 09_15_44 PM.png	image/png	1262432	pending	worker	9	2026-06-06 08:10:48.714	\N	\N	\N	Flat assignment notification attached by committee	2026-06-06 08:10:48.714	2026-06-06 08:10:48.714
10	8	task_proof	3	\N	uploads\\documents\\9167abad5c743ccff05f6eea69206823	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:33:40.56	\N	\N	\N	Task proof image. Repair amount: Rs. 5000	2026-06-08 20:33:40.56	2026-06-08 20:33:40.56
11	8	task_proof	3	\N	uploads\\documents\\db7d4b3c75a7fc68d4387790539167ce	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:39:53.823	\N	\N	\N	Task proof image. Payment amount: Rs. 2000	2026-06-08 20:39:53.823	2026-06-08 20:39:53.823
12	8	task_proof	3	\N	uploads\\documents\\6156dd97d880445694ba7cae882adeb5	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:39:54.537	\N	\N	\N	Task proof image. Payment amount: Rs. 2000	2026-06-08 20:39:54.537	2026-06-08 20:39:54.537
13	8	task_proof	3	\N	uploads\\documents\\1232a2c979cd17fb285fd0e524f7463c	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:39:54.799	\N	\N	\N	Task proof image. Payment amount: Rs. 2000	2026-06-08 20:39:54.799	2026-06-08 20:39:54.799
14	8	task_proof	3	\N	uploads\\documents\\f67e1ff3726b78a475a141a63307beeb	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:39:55.038	\N	\N	\N	Task proof image. Payment amount: Rs. 2000	2026-06-08 20:39:55.038	2026-06-08 20:39:55.038
15	8	task_proof	3	\N	uploads\\documents\\b3e03729bd947f41a04c24df06845543	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:39:55.288	\N	\N	\N	Task proof image. Payment amount: Rs. 2000	2026-06-08 20:39:55.288	2026-06-08 20:39:55.288
16	8	task_proof	3	\N	uploads\\documents\\f627ab4b8af471b0ad912a9820b0d81d	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:39:55.552	\N	\N	\N	Task proof image. Payment amount: Rs. 2000	2026-06-08 20:39:55.552	2026-06-08 20:39:55.552
17	8	task_proof	3	\N	uploads\\documents\\5f1c18ca2a44979a6a190c51972c74fd	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	caretaker	13	2026-06-08 20:39:56.432	\N	\N	\N	Task proof image. Payment amount: Rs. 2000	2026-06-08 20:39:56.432	2026-06-08 20:39:56.432
18	8	rent_payment	2	\N	uploads\\documents\\d0af23f91cfd8c1e6b2e5c4cb5968c77	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	finance	13	2026-06-08 20:45:33.626	\N	\N	\N	Rent bank_transfer proof for invoice #4	2026-06-08 20:45:33.626	2026-06-08 20:45:33.626
19	1	worker	4	4	uploads\\documents\\040fe55345e7f7ac1c2d3c8e53e7e0a5	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	15	2026-06-11 09:43:17.289	16	2026-06-11 09:52:23.057	\N	Approved from verification desk	2026-06-11 09:43:17.289	2026-06-11 09:43:17.289
20	2	worker	4	4	uploads\\documents\\cd2f43835cc51ae39b068075b4d579e7	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	15	2026-06-11 09:43:17.37	16	2026-06-11 09:52:24.73	\N	Approved from verification desk	2026-06-11 09:43:17.37	2026-06-11 09:43:17.37
21	3	worker	4	4	uploads\\documents\\d50ce501d46e5316b2d14b1051f1f109	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	15	2026-06-11 09:43:17.413	16	2026-06-11 09:52:25.508	\N	Approved from verification desk	2026-06-11 09:43:17.413	2026-06-11 09:43:17.413
22	4	worker	4	4	uploads\\documents\\efb2a57d7058d55e07841eb436099a8d	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	15	2026-06-11 09:43:17.454	16	2026-06-11 09:52:26.485	\N	Approved from verification desk	2026-06-11 09:43:17.454	2026-06-11 09:43:17.454
23	5	worker	4	4	uploads\\documents\\63e57c48cbec7e0072d63096beda5e37	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	director	15	2026-06-11 09:43:17.5	16	2026-06-11 09:52:27.351	\N	Approved from verification desk	2026-06-11 09:43:17.5	2026-06-11 09:43:17.5
24	6	worker	4	4	uploads\\documents\\c57524cb5fbf83b4f69c1a3c66ee5472	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	approved	finance	15	2026-06-11 09:43:17.55	16	2026-06-11 09:52:28.361	\N	Approved from verification desk	2026-06-11 09:43:17.55	2026-06-11 09:43:17.55
25	8	rent_payment	3	\N	uploads\\documents\\0ab87770084d99e0d9dab2fd7918a276	ChatGPT Image May 23, 2026, 12_00_09 AM.png	image/png	1363999	pending	finance	18	2026-06-11 10:23:53.895	\N	\N	\N	Rent bank_transfer proof for invoice #6	2026-06-11 10:23:53.895	2026-06-11 10:23:53.895
\.


--
-- Data for Name: eviction_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.eviction_cases (id, worker_id, colony_id, flat_id, occupant_name, occupant_cnic, occupant_phone, illegal_reason, case_no, court_name, police_station, administration_contact, filed_date, next_hearing_date, decision_summary, status, vacant_date, remarks, created_by, created_at, updated_at) FROM stdin;
1	\N	3	5	DEHJKH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	vacated	2026-06-11	\N	\N	2026-06-11 10:42:34.723	2026-06-11 10:42:34.723
2	3	2	2	zawar 	1623046594837	030431333339	isodfjsiofjo	\N	\N	\N	\N	\N	\N	\N	illegal_identified	\N	\N	\N	2026-06-14 20:39:45.234	2026-06-14 20:39:45.234
\.


--
-- Data for Name: eviction_hearings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.eviction_hearings (id, eviction_case_id, hearing_date, next_hearing_date, proceedings, decision_summary, document_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flat_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flat_assignments (id, worker_id, flat_id, application_id, start_date, end_date, status, allotment_order_no, allotment_order_date, vacated_reason, remarks, created_by, created_at, updated_at, rent_amount) FROM stdin;
1	2	1	2	2026-06-05	\N	active	ORD-460492	\N	\N	Flow assignment	1	2026-06-05 16:18:04.352	2026-06-05 16:18:04.352	0
2	3	2	3	2026-06-06	\N	active	\N	\N	\N	Monthly rent decided from worker basic pay for testing director flow	9	2026-06-06 08:10:48.748	2026-06-06 08:10:48.748	2500
\.


--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.industries (id, name, registration_no, address, contact_person, phone, email, status, created_by, created_at, updated_at, latitude, longitude) FROM stdin;
1	QA Textile Mills	REG-1780206823	Industrial Estate	Mr QA	03001234569	industry1780206823@example.com	active	\N	2026-05-31 05:53:43.529	2026-05-31 05:53:43.529	\N	\N
2	Manual Test Industry 828042	REG-828042	Peshawar	Manual Tester	03001234567	industry828042@example.com	active	\N	2026-06-05 18:43:19.356	2026-06-05 18:43:19.356	\N	\N
3	test industry	0325164978130	\N	h@a.com	0302	\N	active	\N	2026-06-05 18:44:29.789	2026-06-05 18:44:29.789	\N	\N
4	new name	0230320	Jehangira gara tehsil Lahor district Swabi\nJehangira gara tehsil Lahor district Swabi	Muhammad Haris	0304510230	mzawarshah01@gmail.com	active	\N	2026-06-11 09:36:36.235	2026-06-11 09:36:36.235	34.0030984	71.5735937
\.


--
-- Data for Name: industry_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.industry_users (id, industry_id, user_id, designation, is_primary, created_at) FROM stdin;
1	2	4	HR Manager	t	2026-06-05 18:43:19.511
2	4	15	hr	t	2026-06-11 09:37:45.26
\.


--
-- Data for Name: late_fee_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.late_fee_rules (id, name, fee_type, amount, grace_days, max_fee_amount, effective_from, effective_to, is_active, created_by, created_at, updated_at) FROM stdin;
1	Monthly rent late fee 10%	percentage	10	0	\N	2026-06-07	\N	t	\N	2026-06-07 07:32:49.009	2026-06-07 07:32:49.009
2	Monthly rent late fee 50%	percentage	50	0	\N	2026-06-07	\N	t	\N	2026-06-07 07:33:21.066	2026-06-07 07:33:21.066
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, recipient_type, recipient_id, application_id, title, message, notification_type, status, sent_at, read_at, created_at) FROM stdin;
1	worker	3	3	Flat Assigned	Your flat has been assigned. Please see the attached notification document.	flat_assignment	sent	2026-06-06 08:10:48.766	\N	2026-06-06 08:10:48.775
2	user	18	\N	Rent collection received	The accountant collected 1 rent payment(s) totalling 2500 from you.	rent_remittance_received	sent	2026-06-14 20:31:06.821	\N	2026-06-14 20:31:06.823
\.


--
-- Data for Name: rent_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rent_invoices (id, flat_assignment_id, worker_id, billing_month, rent_rate_id, rent_amount, due_date, late_fee_rule_id, late_fee_amount, total_amount, paid_amount, payment_mode, deduction_status, status, created_at, updated_at) FROM stdin;
1	1	2	2026-06-01	\N	0	2026-06-10	\N	0	0	500	manual	not_required	paid	2026-06-05 16:18:04.666	2026-06-05 16:18:04.666
2	2	3	2026-06-01	\N	2500	2026-06-05	\N	0	2500	0	manual	not_required	unpaid	2026-06-07 07:23:27.617	2026-06-07 07:23:27.617
3	1	2	2026-07-01	\N	0	2026-07-05	\N	0	0	0	manual	not_required	unpaid	2026-06-07 07:37:25.548	2026-06-07 07:37:25.548
4	2	3	2026-07-01	2	2500	2026-07-05	\N	0	2500	2500	manual	not_required	paid	2026-06-07 07:37:25.565	2026-06-07 07:37:25.565
5	1	2	2026-05-01	\N	0	2026-06-30	\N	0	0	0	manual	not_required	unpaid	2026-06-10 20:12:19.754	2026-06-10 20:12:19.754
6	2	3	2026-05-01	\N	2500	2026-06-30	\N	0	2500	2500	manual	not_required	paid	2026-06-10 20:12:19.773	2026-06-10 20:12:19.773
\.


--
-- Data for Name: rent_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rent_payments (id, rent_invoice_id, amount, payment_date, collected_user_id, payment_method, receipt_no, remarks, created_at, updated_at, remittance_id) FROM stdin;
1	1	500	2026-06-05	1	Cash	\N	\N	2026-06-05 16:18:04.854	2026-06-05 16:18:04.854	\N
2	4	2500	2026-06-08	13	bank_transfer	\N	\N	2026-06-08 20:45:33.553	2026-06-08 20:45:33.553	\N
3	6	2500	2026-06-11	18	bank_transfer	15612310	SDFCASdf	2026-06-11 10:23:53.813	2026-06-11 10:23:53.813	1
\.


--
-- Data for Name: rent_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rent_rates (id, colony_id, unit_type, amount, effective_from, effective_to, created_by, created_at, updated_at, flat_id) FROM stdin;
1	1	Type-A	1000	2026-06-01	\N	\N	2026-06-05 16:18:58.166	2026-06-05 16:18:58.166	\N
2	2	2	1000	2026-06-07	\N	\N	2026-06-07 06:27:31.522	2026-06-07 06:27:31.522	2
\.


--
-- Data for Name: rent_remittances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rent_remittances (id, caretaker_user_id, received_by_user_id, total_amount, payment_count, status, remarks, received_at, created_at, updated_at) FROM stdin;
1	18	14	2500	1	received	\N	2026-06-14 20:31:06.8	2026-06-14 20:31:06.8	2026-06-14 20:31:06.8
\.


--
-- Data for Name: residential_units; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.residential_units (id, flat_no, flat_address, flat_rooms, status, colony_id, created_by, created_at, updated_at, latitude, longitude) FROM stdin;
1	F-460492	Flow Block	2	filled	1	\N	2026-06-05 16:18:04.277	2026-06-05 16:18:04.277	\N	\N
2	A-861	Block A, Flat 861, Test Colony	2	filled	2	\N	2026-06-06 07:42:16.736	2026-06-06 07:42:16.736	\N	\N
3	A-101	bloack a street 1	2	empty	2	\N	2026-06-10 20:07:38.8	2026-06-10 20:07:38.8	33.9644780	72.2305450
4	MDC-B-201	Block B, Street 2, Meeting Demo Colony	3	empty	3	1	2026-06-11 02:24:43.397494	2026-06-11 02:24:43.397494	34.0154000	71.5252100
6	MDC-A-101	Block A, Street 1, Meeting Demo Colony	2	empty	3	1	2026-06-11 02:24:43.397494	2026-06-11 02:24:43.397494	34.0152100	71.5250100
5	MDC-A-102	Block A, Street 1, Meeting Demo Colony	2	empty	3	1	2026-06-11 02:24:43.397494	2026-06-11 02:24:43.397494	34.0152500	71.5250700
\.


--
-- Data for Name: task_proofs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_proofs (id, task_id, uploaded_by_user_id, image_document_id, latitude, longitude, accuracy, distance_from_target_meters, is_within_allowed_radius, uploaded_at, remarks, created_at) FROM stdin;
1	1	1	\N	34.0152000	71.5250000	10.00	0.00	t	2026-06-05 16:18:05.684	Flow proof	2026-06-05 16:18:05.684
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, phone_number, status, profile_photo, role, last_login_at, created_at, updated_at) FROM stdin;
1	Super Admin	admin@example.com	$2b$10$vlcmp2tNR9awfFoN1Hq1ouXMy0HjXg9f4BHSYDgKVOYuH2IpcZNvS	\N	active	\N	super_admin	\N	2026-05-30 12:06:57.251676	2026-05-30 12:06:57.251676
2	Finance User	finance1780206782@example.com	$2b$10$lLolz31eRhVaO10sfhseDO1JSfBE4oKACktio6QniPG3X6LJzGMei	03001234568	active	\N	finance_wing	\N	2026-05-31 05:53:02.638	2026-05-31 05:53:02.638
3	Test Caretaker	caretaker1780210517@example.com	$2b$10$wGy7p7J.cNnBfG7oYl.yTedbM8gXzN70WTI84IlwH3pg7zXjylby2	03001234567	active	\N	care_taker_labour_colony	\N	2026-05-31 06:55:17.444	2026-05-31 06:55:17.444
4	Industry User 828042	industry-user828042@example.com	$2b$10$/4x2vyppkUWPlG1bTQJYuOLOXsDwWlpp6tabd11340ICpJNOSN/M2	03001234567	active	\N	industry_admin	\N	2026-06-05 18:43:19.498	2026-06-05 18:43:19.498
5	Crud User Updated 165272	crud165272@example.com	$2b$10$E/TjumnNk77h4BU4jrymV.1ovQWlBVPmpHdSCUD27E9KPewWXTosK	03001234567	disabled	\N	finance_wing	\N	2026-06-05 18:48:51.213	2026-06-05 18:48:51.213
6	Strong User	strong435610@example.com	$2b$10$IUulhtLrZM.mYfAvenBRkeNCBeKIVNhri7vISZD3onwxdfGHyecuq	03001234567	active	\N	industry_admin	\N	2026-06-05 19:02:12.725	2026-06-05 19:02:12.725
7	Muhammad Haris	mzawarshah01@gmail.com	$2b$10$q/E3LAbe5rGxdfpk/A/noOsHVuFp1vsP7R3tLNPK/jq.2vyLc5GCO	03043133339	active	\N	industry_admin	\N	2026-06-05 19:23:29.936	2026-06-05 19:23:29.936
8	Muhammad Haris	mzawarshah0@gmail.com	$2b$10$IsV7bNlwJ1tOhLtVlsvZV.QdjwQ9HNXk.ODqaaUrSjvC4rlDiAWPK	03043133339	active	\N	colony_section	\N	2026-06-06 06:49:07.737	2026-06-06 06:49:07.737
9	za	z@e.com	$2b$10$c4B/4P4tsrmscJO5sZfqmuve5PqrqhXl.RRM0jcxKJr0xQtF2h6L.	03043133339	active	\N	secretary_kp_wwb	\N	2026-06-06 07:39:15.202	2026-06-06 07:39:15.202
10	Muhammad Haris	mzawarshah@gmail.com	$2b$10$gtKvXDaNqisdUIw3QIqnhu.Jwj4acN9wNhoIEEMcHb2D3k/ZCMelW	03043133339	active	\N	works_wing	\N	2026-06-07 08:07:38.788	2026-06-07 08:07:38.788
12	za	z@ca.com	$2b$10$7TlEOj8mjL0LvjW3RzIyZODIDYkPm4lnheerb8cPGvrKXxCgsUmUm	03043133339	active	\N	care_taker_labour_colony	\N	2026-06-08 20:28:35.602	2026-06-08 20:28:35.602
13	caretaker	c@care.com	$2b$10$GIGVNJd6.ii5nyPY8Hh1c.TiUeAwNiPJ96ZviT2Bt3M2iZfTT28G6	03043133339	active	\N	care_taker_labour_colony	\N	2026-06-08 20:30:07.746	2026-06-08 20:30:07.746
14	finance	finance@a.com	$2b$10$EHcw/upM27O3kGAwDd2ST.eu3e1anB7kuDjCD.Tx9mkj6mB.qptV.	03043133339	active	/uploads/users/user-1781122238539-757473726.jpg	finance_wing	\N	2026-06-10 20:10:38.495	2026-06-10 20:10:38.495
15	in	industry@a.com	$2b$10$u2wo23m.D3o9rV0IhALv1.MGB7BK1qlSRdkpRReY0n.bCPg4JONoy	03043133339	active	/uploads/users/user-1781170528878-589484850.png	industry_admin	\N	2026-06-11 09:35:28.819	2026-06-11 09:35:28.819
16	VERIFICATION	verification@a.com	$2b$10$SX6NqqVmDkY496XlBszHh.wong.tiCTlTmGdjeFRtEgVa2VV4ctWC	03043133339	active	/uploads/users/user-1781171258852-380744534.png	colony_section	\N	2026-06-11 09:47:38.826	2026-06-11 09:47:38.826
17	COMMITTE	committe@a.com	$2b$10$qT7Bg7LuB9N.iJWdFEvDw.aTP24FnDuFr6c8Q9cQd5zp6fCMuWHta	03043133339	active	/uploads/users/user-1781171468827-157227144.png	secretary_kp_wwb	\N	2026-06-11 09:51:08.798	2026-06-11 09:51:08.798
18	CARETAKER	care@a.com	$2b$10$B27fWWvzHjyBAYRqZWJWi.kffTF0vkeW7dHecXviGMmGrRmIojy5W	03043133339	active	/uploads/users/user-1781171935154-933654505.png	care_taker_labour_colony	\N	2026-06-11 09:58:55.129	2026-06-11 09:58:55.129
19	SECURITY	security@a.com	$2b$10$47AmL5BOm5GC6A0MIDuLCOFniTz3ayphflqLZ2385JD8kn3HMB2YK	03043133339	active	/uploads/users/user-1781174507722-674521139.png	legal_section	\N	2026-06-11 10:41:47.701	2026-06-11 10:41:47.701
20	Haris	assets@a.com	$2b$10$MFY/RivKG0l.lboAGsHVfeXkbYKTZ0rBGBu3BN3ODpCY4Ngubxvt6	03043133339	active	/uploads/users/user-1781174736797-434559843.png	works_wing	\N	2026-06-11 10:45:36.767	2026-06-11 10:45:36.767
21	colony	colony@a.com	$2b$10$HTWrMRsuO29iMCYPF07mVO0FOSEKsHogFC0YRBrZenVoiAKSik8H.	03043133339	active	/uploads/users/user-1781175815516-171813835.png	care_taker_labour_colony	\N	2026-06-11 11:03:35.451	2026-06-11 11:03:35.451
22	ad colony	adcolony@a.com	$2b$10$3CXQAEAqIZv.hLbm5Ynqle5K1SsRMNWNlKrg0iQSc9KbHZt86Gx.S	03043133339	active	/uploads/users/user-1781365487069-927257744.png	ad_colonies_zone1	\N	2026-06-13 15:44:47.043	2026-06-13 15:44:47.043
\.


--
-- Data for Name: utility_bill_fetch_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utility_bill_fetch_attempts (id, utility_connection_id, billing_month, attempted_at, status, api_response_code, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: utility_bills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utility_bills (id, utility_connection_id, flat_assignment_id, worker_id, flat_id, utility_type, billing_month, amount, due_date, status, created_by, created_at, updated_at) FROM stdin;
1	1	1	2	1	electricity	2026-06-01	2500	2026-06-20	partial	\N	2026-06-05 16:18:58.306	2026-06-05 16:18:58.306
\.


--
-- Data for Name: utility_connections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utility_connections (id, flat_id, utility_type, provider_name, consumer_number, is_active, created_at, updated_at) FROM stdin;
1	1	electricity	PESCO	PESCO-603127757	t	2026-06-05 16:18:58.229	2026-06-05 16:18:58.229
\.


--
-- Data for Name: utility_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utility_payments (id, utility_bill_id, amount, payment_date, collected_by_user_id, receipt_no, created_by, created_at, updated_at) FROM stdin;
1	1	1000	2026-06-05	1	\N	1	2026-06-05 16:18:58.344	2026-06-05 16:18:58.344
\.


--
-- Data for Name: worker_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.worker_applications (id, application_no, application_type, status, worker_id, industry_id, submitted_by_user_id, current_flat_assignment_id, requested_colony_id, requested_unit_type, submitted_at, verified_by, verified_at, verification_status, verification_remarks, committee_meeting_id, committee_decision, committee_decision_date, committee_remarks, approved_by, approved_at, rejected_by, rejected_at, rejected_reason, priority_score, remarks, created_at, updated_at, recommended_rent_amount) FROM stdin;
2	FLOW-APP-460492	new_allotment	flat_assigned	2	\N	1	1	\N	Type-A	2026-06-05 16:18:03.668	1	2026-06-05 16:18:03.722	failed	Flow verified	\N	approved	2026-06-05	Approved in flow test	1	2026-06-05 16:18:03.782	\N	\N	\N	0	Flow test	2026-06-05 16:18:03.609	2026-06-05 16:18:03.609	\N
1	APP-1780676098498	new_allotment	verification_failed	1	\N	1	\N	\N	Type-A	\N	8	2026-06-06 07:19:17.536	failed	One or more required documents were rejected.	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Smoke test application	2026-06-05 16:14:58.521	2026-06-05 16:14:58.521	\N
3	APP-1780688962431	new_allotment	flat_assigned	3	\N	7	2	\N	flat	\N	8	2026-06-06 07:15:06.439	passed	All required worker documents approved by verification desk.	\N	approved	2026-06-06	approved	9	2026-06-06 08:10:48.601	\N	\N	\N	0	Approved from web dashboard	2026-06-05 19:49:22.45	2026-06-05 19:49:22.45	\N
4	APP-1781170996930	new_allotment	submitted	4	\N	15	\N	\N	FLAT	\N	\N	\N	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	Created from web allotment form	2026-06-11 09:43:17.199	2026-06-11 09:43:17.199	\N
\.


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workers (id, name, father_name, cnic, dob, address, essi_no, eobi_no, designation, salary_per_month, total_duration_service, total_payment_by, total_number_dependents, mobile_no_1, mobile_no_2, worker_type, status, created_at, updated_at) FROM stdin;
1	Demo Client Worker	Demo Father	42101-2843401-1	1990-01-01	Demo address	\N	\N	Demo Worker	50000	\N	\N	\N	03000000000	\N	industry	pending	2026-06-05 16:14:58.48	2026-06-05 16:14:58.48
2	Flow Test Worker	Flow Test Father	42201460492	1991-01-01	Flow test address	\N	\N	Machine Operator	45000	\N	\N	\N	03001234567	\N	industry	active	2026-06-05 16:18:03.552	2026-06-05 16:18:03.552
3	zawar 	abbas	1623046594837	1998-12-07	c as klascklamsklcmkaslmcklasmckasmcklsmcklmkasmcklas	15020231231561560.	15615615615615610	manager	180000	\N	\N	3	030431333339	\N	industry	active	2026-06-05 19:49:22.418	2026-06-05 19:49:22.418
4	new worker	abbs	1502012156151	2000-12-05	sadsda	1612315610230561	02315632123123156	dr	15000	\N	\N	1	03043133339	\N	industry	pending	2026-06-11 09:43:17.171	2026-06-11 09:43:17.171
\.


--
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.zones (id, name, ad_user_id, created_at, updated_at) FROM stdin;
1	Zone 1	\N	2026-06-13 08:32:33.379905	2026-06-13 08:32:33.379905
2	Zone 2	\N	2026-06-13 08:32:33.379905	2026-06-13 08:32:33.379905
\.


--
-- Name: asset_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asset_status_history_id_seq', 3, true);


--
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assets_id_seq', 2, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: caretaker_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.caretaker_attendance_id_seq', 7, true);


--
-- Name: caretaker_colonies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.caretaker_colonies_id_seq', 6, true);


--
-- Name: caretaker_gps_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.caretaker_gps_tracking_id_seq', 9, true);


--
-- Name: caretaker_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.caretaker_tasks_id_seq', 4, true);


--
-- Name: colonies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.colonies_id_seq', 3, true);


--
-- Name: complaint_budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaint_budgets_id_seq', 1, false);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaints_id_seq', 3, true);


--
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.districts_id_seq', 1, false);


--
-- Name: document_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_types_id_seq', 9, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 25, true);


--
-- Name: eviction_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.eviction_cases_id_seq', 2, true);


--
-- Name: eviction_hearings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.eviction_hearings_id_seq', 1, false);


--
-- Name: flat_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.flat_assignments_id_seq', 2, true);


--
-- Name: industries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.industries_id_seq', 4, true);


--
-- Name: industry_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.industry_users_id_seq', 2, true);


--
-- Name: late_fee_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.late_fee_rules_id_seq', 2, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 2, true);


--
-- Name: rent_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rent_invoices_id_seq', 6, true);


--
-- Name: rent_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rent_payments_id_seq', 3, true);


--
-- Name: rent_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rent_rates_id_seq', 2, true);


--
-- Name: rent_remittances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rent_remittances_id_seq', 1, true);


--
-- Name: residential_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.residential_units_id_seq', 6, true);


--
-- Name: task_proofs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.task_proofs_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 22, true);


--
-- Name: utility_bill_fetch_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utility_bill_fetch_attempts_id_seq', 1, false);


--
-- Name: utility_bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utility_bills_id_seq', 1, true);


--
-- Name: utility_connections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utility_connections_id_seq', 1, true);


--
-- Name: utility_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utility_payments_id_seq', 1, true);


--
-- Name: worker_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.worker_applications_id_seq', 4, true);


--
-- Name: workers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workers_id_seq', 4, true);


--
-- Name: zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.zones_id_seq', 2, true);


--
-- Name: asset_status_history asset_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_status_history
    ADD CONSTRAINT asset_status_history_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: caretaker_attendance caretaker_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_attendance
    ADD CONSTRAINT caretaker_attendance_pkey PRIMARY KEY (id);


--
-- Name: caretaker_colonies caretaker_colonies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_colonies
    ADD CONSTRAINT caretaker_colonies_pkey PRIMARY KEY (id);


--
-- Name: caretaker_gps_tracking caretaker_gps_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_gps_tracking
    ADD CONSTRAINT caretaker_gps_tracking_pkey PRIMARY KEY (id);


--
-- Name: caretaker_tasks caretaker_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_tasks
    ADD CONSTRAINT caretaker_tasks_pkey PRIMARY KEY (id);


--
-- Name: colonies colonies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colonies
    ADD CONSTRAINT colonies_pkey PRIMARY KEY (id);


--
-- Name: complaint_budgets complaint_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_budgets
    ADD CONSTRAINT complaint_budgets_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: document_types document_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT document_types_code_key UNIQUE (code);


--
-- Name: document_types document_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT document_types_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: eviction_cases eviction_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_cases
    ADD CONSTRAINT eviction_cases_pkey PRIMARY KEY (id);


--
-- Name: eviction_hearings eviction_hearings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_hearings
    ADD CONSTRAINT eviction_hearings_pkey PRIMARY KEY (id);


--
-- Name: flat_assignments flat_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flat_assignments
    ADD CONSTRAINT flat_assignments_pkey PRIMARY KEY (id);


--
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);


--
-- Name: industries industries_registration_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_registration_no_key UNIQUE (registration_no);


--
-- Name: industry_users industry_users_industry_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_users
    ADD CONSTRAINT industry_users_industry_id_user_id_key UNIQUE (industry_id, user_id);


--
-- Name: industry_users industry_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_users
    ADD CONSTRAINT industry_users_pkey PRIMARY KEY (id);


--
-- Name: late_fee_rules late_fee_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.late_fee_rules
    ADD CONSTRAINT late_fee_rules_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: rent_invoices rent_invoices_flat_assignment_id_billing_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_invoices
    ADD CONSTRAINT rent_invoices_flat_assignment_id_billing_month_key UNIQUE (flat_assignment_id, billing_month);


--
-- Name: rent_invoices rent_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_invoices
    ADD CONSTRAINT rent_invoices_pkey PRIMARY KEY (id);


--
-- Name: rent_payments rent_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_pkey PRIMARY KEY (id);


--
-- Name: rent_rates rent_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_rates
    ADD CONSTRAINT rent_rates_pkey PRIMARY KEY (id);


--
-- Name: rent_remittances rent_remittances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_remittances
    ADD CONSTRAINT rent_remittances_pkey PRIMARY KEY (id);


--
-- Name: residential_units residential_units_colony_id_flat_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residential_units
    ADD CONSTRAINT residential_units_colony_id_flat_no_key UNIQUE (colony_id, flat_no);


--
-- Name: residential_units residential_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residential_units
    ADD CONSTRAINT residential_units_pkey PRIMARY KEY (id);


--
-- Name: task_proofs task_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_proofs
    ADD CONSTRAINT task_proofs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: utility_bill_fetch_attempts utility_bill_fetch_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bill_fetch_attempts
    ADD CONSTRAINT utility_bill_fetch_attempts_pkey PRIMARY KEY (id);


--
-- Name: utility_bills utility_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_pkey PRIMARY KEY (id);


--
-- Name: utility_bills utility_bills_utility_connection_id_billing_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_utility_connection_id_billing_month_key UNIQUE (utility_connection_id, billing_month);


--
-- Name: utility_connections utility_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_connections
    ADD CONSTRAINT utility_connections_pkey PRIMARY KEY (id);


--
-- Name: utility_connections utility_connections_utility_type_consumer_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_connections
    ADD CONSTRAINT utility_connections_utility_type_consumer_number_key UNIQUE (utility_type, consumer_number);


--
-- Name: utility_payments utility_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_payments
    ADD CONSTRAINT utility_payments_pkey PRIMARY KEY (id);


--
-- Name: worker_applications worker_applications_application_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_application_no_key UNIQUE (application_no);


--
-- Name: worker_applications worker_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_pkey PRIMARY KEY (id);


--
-- Name: workers workers_cnic_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_cnic_key UNIQUE (cnic);


--
-- Name: workers workers_eobi_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_eobi_no_key UNIQUE (eobi_no);


--
-- Name: workers workers_essi_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_essi_no_key UNIQUE (essi_no);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: caretaker_colonies_user_colony_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX caretaker_colonies_user_colony_key ON public.caretaker_colonies USING btree (user_id, colony_id);


--
-- Name: idx_caretaker_colonies_colony; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_caretaker_colonies_colony ON public.caretaker_colonies USING btree (colony_id);


--
-- Name: idx_caretaker_gps_user_recorded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_caretaker_gps_user_recorded_at ON public.caretaker_gps_tracking USING btree (user_id, recorded_at);


--
-- Name: idx_complaints_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_status ON public.complaints USING btree (status);


--
-- Name: idx_documents_application_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_application_id ON public.documents USING btree (application_id);


--
-- Name: idx_documents_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_owner ON public.documents USING btree (owner_type, owner_id);


--
-- Name: idx_eviction_cases_flat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eviction_cases_flat_id ON public.eviction_cases USING btree (flat_id);


--
-- Name: idx_eviction_cases_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eviction_cases_status ON public.eviction_cases USING btree (status);


--
-- Name: idx_eviction_hearings_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eviction_hearings_case_id ON public.eviction_hearings USING btree (eviction_case_id);


--
-- Name: idx_flat_assignments_flat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flat_assignments_flat_id ON public.flat_assignments USING btree (flat_id);


--
-- Name: idx_flat_assignments_worker_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flat_assignments_worker_id ON public.flat_assignments USING btree (worker_id);


--
-- Name: idx_rent_invoices_billing_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rent_invoices_billing_month ON public.rent_invoices USING btree (billing_month);


--
-- Name: idx_rent_invoices_worker_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rent_invoices_worker_id ON public.rent_invoices USING btree (worker_id);


--
-- Name: idx_rent_payments_remittance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rent_payments_remittance ON public.rent_payments USING btree (remittance_id);


--
-- Name: idx_rent_rates_flat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rent_rates_flat_id ON public.rent_rates USING btree (flat_id);


--
-- Name: idx_rent_remittances_caretaker; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rent_remittances_caretaker ON public.rent_remittances USING btree (caretaker_user_id);


--
-- Name: idx_utility_bills_billing_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_utility_bills_billing_month ON public.utility_bills USING btree (billing_month);


--
-- Name: idx_worker_applications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_worker_applications_status ON public.worker_applications USING btree (status);


--
-- Name: idx_worker_applications_worker_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_worker_applications_worker_id ON public.worker_applications USING btree (worker_id);


--
-- Name: unique_active_flat_assignment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_active_flat_assignment ON public.flat_assignments USING btree (flat_id) WHERE (status = 'active'::public.assignment_status);


--
-- Name: unique_active_worker_assignment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_active_worker_assignment ON public.flat_assignments USING btree (worker_id) WHERE (status = 'active'::public.assignment_status);


--
-- Name: asset_status_history asset_status_history_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_status_history
    ADD CONSTRAINT asset_status_history_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: asset_status_history asset_status_history_repaired_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_status_history
    ADD CONSTRAINT asset_status_history_repaired_image_id_fkey FOREIGN KEY (repaired_image_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: assets assets_colony_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_colony_id_fkey FOREIGN KEY (colony_id) REFERENCES public.colonies(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: caretaker_attendance caretaker_attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_attendance
    ADD CONSTRAINT caretaker_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: caretaker_colonies caretaker_colonies_colony_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_colonies
    ADD CONSTRAINT caretaker_colonies_colony_id_fkey FOREIGN KEY (colony_id) REFERENCES public.colonies(id) ON DELETE CASCADE;


--
-- Name: caretaker_colonies caretaker_colonies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_colonies
    ADD CONSTRAINT caretaker_colonies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: caretaker_gps_tracking caretaker_gps_tracking_attendance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_gps_tracking
    ADD CONSTRAINT caretaker_gps_tracking_attendance_id_fkey FOREIGN KEY (attendance_id) REFERENCES public.caretaker_attendance(id) ON DELETE CASCADE;


--
-- Name: caretaker_gps_tracking caretaker_gps_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_gps_tracking
    ADD CONSTRAINT caretaker_gps_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: caretaker_tasks caretaker_tasks_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_tasks
    ADD CONSTRAINT caretaker_tasks_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- Name: caretaker_tasks caretaker_tasks_assigned_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_tasks
    ADD CONSTRAINT caretaker_tasks_assigned_by_user_id_fkey FOREIGN KEY (assigned_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: caretaker_tasks caretaker_tasks_assigned_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_tasks
    ADD CONSTRAINT caretaker_tasks_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: caretaker_tasks caretaker_tasks_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_tasks
    ADD CONSTRAINT caretaker_tasks_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE SET NULL;


--
-- Name: caretaker_tasks caretaker_tasks_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caretaker_tasks
    ADD CONSTRAINT caretaker_tasks_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.residential_units(id) ON DELETE SET NULL;


--
-- Name: colonies colonies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colonies
    ADD CONSTRAINT colonies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: colonies colonies_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colonies
    ADD CONSTRAINT colonies_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id) ON DELETE SET NULL;


--
-- Name: colonies colonies_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colonies
    ADD CONSTRAINT colonies_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- Name: complaint_budgets complaint_budgets_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_budgets
    ADD CONSTRAINT complaint_budgets_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- Name: complaint_budgets complaint_budgets_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_budgets
    ADD CONSTRAINT complaint_budgets_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_assigned_caretaker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_assigned_caretaker_id_fkey FOREIGN KEY (assigned_caretaker_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_colony_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_colony_id_fkey FOREIGN KEY (colony_id) REFERENCES public.colonies(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.residential_units(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_resolved_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_resolved_image_id_fkey FOREIGN KEY (resolved_image_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- Name: documents documents_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.worker_applications(id) ON DELETE CASCADE;


--
-- Name: documents documents_document_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_type_id_fkey FOREIGN KEY (document_type_id) REFERENCES public.document_types(id) ON DELETE RESTRICT;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: documents documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: eviction_cases eviction_cases_colony_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_cases
    ADD CONSTRAINT eviction_cases_colony_id_fkey FOREIGN KEY (colony_id) REFERENCES public.colonies(id) ON DELETE SET NULL;


--
-- Name: eviction_cases eviction_cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_cases
    ADD CONSTRAINT eviction_cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: eviction_cases eviction_cases_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_cases
    ADD CONSTRAINT eviction_cases_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.residential_units(id) ON DELETE SET NULL;


--
-- Name: eviction_cases eviction_cases_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_cases
    ADD CONSTRAINT eviction_cases_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- Name: eviction_hearings eviction_hearings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_hearings
    ADD CONSTRAINT eviction_hearings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: eviction_hearings eviction_hearings_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_hearings
    ADD CONSTRAINT eviction_hearings_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: eviction_hearings eviction_hearings_eviction_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eviction_hearings
    ADD CONSTRAINT eviction_hearings_eviction_case_id_fkey FOREIGN KEY (eviction_case_id) REFERENCES public.eviction_cases(id) ON DELETE CASCADE;


--
-- Name: worker_applications fk_worker_applications_current_assignment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT fk_worker_applications_current_assignment FOREIGN KEY (current_flat_assignment_id) REFERENCES public.flat_assignments(id) ON DELETE SET NULL;


--
-- Name: flat_assignments flat_assignments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flat_assignments
    ADD CONSTRAINT flat_assignments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.worker_applications(id) ON DELETE SET NULL;


--
-- Name: flat_assignments flat_assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flat_assignments
    ADD CONSTRAINT flat_assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: flat_assignments flat_assignments_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flat_assignments
    ADD CONSTRAINT flat_assignments_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.residential_units(id) ON DELETE RESTRICT;


--
-- Name: flat_assignments flat_assignments_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flat_assignments
    ADD CONSTRAINT flat_assignments_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: industries industries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: industry_users industry_users_industry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_users
    ADD CONSTRAINT industry_users_industry_id_fkey FOREIGN KEY (industry_id) REFERENCES public.industries(id) ON DELETE CASCADE;


--
-- Name: industry_users industry_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.industry_users
    ADD CONSTRAINT industry_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: late_fee_rules late_fee_rules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.late_fee_rules
    ADD CONSTRAINT late_fee_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.worker_applications(id) ON DELETE SET NULL;


--
-- Name: rent_invoices rent_invoices_flat_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_invoices
    ADD CONSTRAINT rent_invoices_flat_assignment_id_fkey FOREIGN KEY (flat_assignment_id) REFERENCES public.flat_assignments(id) ON DELETE CASCADE;


--
-- Name: rent_invoices rent_invoices_late_fee_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_invoices
    ADD CONSTRAINT rent_invoices_late_fee_rule_id_fkey FOREIGN KEY (late_fee_rule_id) REFERENCES public.late_fee_rules(id) ON DELETE SET NULL;


--
-- Name: rent_invoices rent_invoices_rent_rate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_invoices
    ADD CONSTRAINT rent_invoices_rent_rate_id_fkey FOREIGN KEY (rent_rate_id) REFERENCES public.rent_rates(id) ON DELETE SET NULL;


--
-- Name: rent_invoices rent_invoices_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_invoices
    ADD CONSTRAINT rent_invoices_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: rent_payments rent_payments_collected_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_collected_user_id_fkey FOREIGN KEY (collected_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rent_payments rent_payments_remittance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_remittance_id_fkey FOREIGN KEY (remittance_id) REFERENCES public.rent_remittances(id) ON DELETE SET NULL;


--
-- Name: rent_payments rent_payments_rent_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_rent_invoice_id_fkey FOREIGN KEY (rent_invoice_id) REFERENCES public.rent_invoices(id) ON DELETE CASCADE;


--
-- Name: rent_rates rent_rates_colony_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_rates
    ADD CONSTRAINT rent_rates_colony_id_fkey FOREIGN KEY (colony_id) REFERENCES public.colonies(id) ON DELETE CASCADE;


--
-- Name: rent_rates rent_rates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_rates
    ADD CONSTRAINT rent_rates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rent_rates rent_rates_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_rates
    ADD CONSTRAINT rent_rates_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.residential_units(id) ON DELETE CASCADE;


--
-- Name: rent_remittances rent_remittances_caretaker_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_remittances
    ADD CONSTRAINT rent_remittances_caretaker_fkey FOREIGN KEY (caretaker_user_id) REFERENCES public.users(id);


--
-- Name: rent_remittances rent_remittances_received_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_remittances
    ADD CONSTRAINT rent_remittances_received_by_fkey FOREIGN KEY (received_by_user_id) REFERENCES public.users(id);


--
-- Name: residential_units residential_units_colony_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residential_units
    ADD CONSTRAINT residential_units_colony_id_fkey FOREIGN KEY (colony_id) REFERENCES public.colonies(id) ON DELETE CASCADE;


--
-- Name: residential_units residential_units_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residential_units
    ADD CONSTRAINT residential_units_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: task_proofs task_proofs_image_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_proofs
    ADD CONSTRAINT task_proofs_image_document_id_fkey FOREIGN KEY (image_document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: task_proofs task_proofs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_proofs
    ADD CONSTRAINT task_proofs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.caretaker_tasks(id) ON DELETE CASCADE;


--
-- Name: task_proofs task_proofs_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_proofs
    ADD CONSTRAINT task_proofs_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: utility_bill_fetch_attempts utility_bill_fetch_attempts_utility_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bill_fetch_attempts
    ADD CONSTRAINT utility_bill_fetch_attempts_utility_connection_id_fkey FOREIGN KEY (utility_connection_id) REFERENCES public.utility_connections(id) ON DELETE CASCADE;


--
-- Name: utility_bills utility_bills_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: utility_bills utility_bills_flat_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_flat_assignment_id_fkey FOREIGN KEY (flat_assignment_id) REFERENCES public.flat_assignments(id) ON DELETE SET NULL;


--
-- Name: utility_bills utility_bills_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.residential_units(id) ON DELETE SET NULL;


--
-- Name: utility_bills utility_bills_utility_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_utility_connection_id_fkey FOREIGN KEY (utility_connection_id) REFERENCES public.utility_connections(id) ON DELETE SET NULL;


--
-- Name: utility_bills utility_bills_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- Name: utility_connections utility_connections_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_connections
    ADD CONSTRAINT utility_connections_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.residential_units(id) ON DELETE CASCADE;


--
-- Name: utility_payments utility_payments_collected_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_payments
    ADD CONSTRAINT utility_payments_collected_by_user_id_fkey FOREIGN KEY (collected_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: utility_payments utility_payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_payments
    ADD CONSTRAINT utility_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: utility_payments utility_payments_utility_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utility_payments
    ADD CONSTRAINT utility_payments_utility_bill_id_fkey FOREIGN KEY (utility_bill_id) REFERENCES public.utility_bills(id) ON DELETE CASCADE;


--
-- Name: worker_applications worker_applications_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: worker_applications worker_applications_industry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_industry_id_fkey FOREIGN KEY (industry_id) REFERENCES public.industries(id) ON DELETE SET NULL;


--
-- Name: worker_applications worker_applications_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: worker_applications worker_applications_requested_colony_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_requested_colony_id_fkey FOREIGN KEY (requested_colony_id) REFERENCES public.colonies(id) ON DELETE SET NULL;


--
-- Name: worker_applications worker_applications_submitted_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_submitted_by_user_id_fkey FOREIGN KEY (submitted_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: worker_applications worker_applications_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: worker_applications worker_applications_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_applications
    ADD CONSTRAINT worker_applications_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: zones zones_ad_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_ad_user_id_fkey FOREIGN KEY (ad_user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

