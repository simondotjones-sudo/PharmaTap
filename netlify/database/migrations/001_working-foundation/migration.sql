CREATE TABLE organisations (id uuid PRIMARY KEY, name text NOT NULL);
CREATE TABLE pharmacies (id uuid PRIMARY KEY, organisation_id uuid NOT NULL REFERENCES organisations, name text NOT NULL, timezone text NOT NULL DEFAULT 'Europe/Dublin', UNIQUE(id, organisation_id));
CREATE TABLE memberships (user_id text NOT NULL, pharmacy_id uuid NOT NULL REFERENCES pharmacies, display_name text NOT NULL, role text NOT NULL CHECK(role IN ('staff','manager','superintendent')), active boolean NOT NULL DEFAULT true, PRIMARY KEY(user_id,pharmacy_id));
CREATE TABLE reports (
 id uuid PRIMARY KEY, pharmacy_id uuid NOT NULL REFERENCES pharmacies,
 type text NOT NULL CHECK(type IN ('Near miss','Medication error','Complaint','Safety concern','Maintenance')),
 title text NOT NULL CHECK(length(title) BETWEEN 3 AND 160), detail text NOT NULL CHECK(length(detail) BETWEEN 10 AND 4000),
 occurred_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), created_by text NOT NULL,
 idempotency_key uuid NOT NULL, request_hash text NOT NULL,
 UNIQUE(created_by,idempotency_key), UNIQUE(id,pharmacy_id),
 FOREIGN KEY(created_by,pharmacy_id) REFERENCES memberships(user_id,pharmacy_id)
);
CREATE TABLE actions (
 id uuid PRIMARY KEY, pharmacy_id uuid NOT NULL, report_id uuid NOT NULL UNIQUE,
 owner_id text NOT NULL, due_at timestamptz NOT NULL, status text NOT NULL DEFAULT 'Open' CHECK(status IN ('Open','Awaiting review','Closed')),
 resolution text NOT NULL DEFAULT '', version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(report_id,pharmacy_id) REFERENCES reports(id,pharmacy_id),
 FOREIGN KEY(owner_id,pharmacy_id) REFERENCES memberships(user_id,pharmacy_id)
);
CREATE TABLE audit_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, pharmacy_id uuid NOT NULL REFERENCES pharmacies,
 entity_id uuid NOT NULL, actor_id text NOT NULL, event text NOT NULL,
 payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(actor_id,pharmacy_id) REFERENCES memberships(user_id,pharmacy_id)
);
CREATE INDEX reports_pharmacy_date ON reports(pharmacy_id,created_at DESC);
CREATE INDEX actions_owner_status ON actions(pharmacy_id,owner_id,status);
CREATE INDEX audit_entity ON audit_events(pharmacy_id,entity_id,id);
CREATE FUNCTION protect_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Audit events are append only'; END $$;
CREATE TRIGGER immutable_audit BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION protect_audit();

CREATE FUNCTION protect_report() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Submitted reports are append only'; END $$;
CREATE TRIGGER immutable_reports BEFORE UPDATE OR DELETE ON reports FOR EACH ROW EXECUTE FUNCTION protect_report();
