CREATE TABLE IF NOT EXISTS checklist_records (
 id uuid PRIMARY KEY, pharmacy_id uuid NOT NULL REFERENCES pharmacies,
 check_id text NOT NULL, title text NOT NULL, frequency text NOT NULL, owner_role text NOT NULL,
 questions jsonb NOT NULL, answers jsonb NOT NULL, notes jsonb NOT NULL,
 failures integer NOT NULL CHECK(failures>=0), created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), idempotency_key uuid NOT NULL, request_hash text NOT NULL,
 UNIQUE(created_by,idempotency_key),
 FOREIGN KEY(created_by,pharmacy_id) REFERENCES memberships(user_id,pharmacy_id)
);
CREATE INDEX checklist_records_site_date ON checklist_records(pharmacy_id,created_at DESC);
CREATE TRIGGER immutable_checklist_records BEFORE UPDATE OR DELETE ON checklist_records FOR EACH ROW EXECUTE FUNCTION protect_report();
