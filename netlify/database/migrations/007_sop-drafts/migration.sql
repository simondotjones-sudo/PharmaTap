CREATE TABLE IF NOT EXISTS sop_drafts (
 id uuid PRIMARY KEY,
 pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
 title text NOT NULL CHECK (length(title) BETWEEN 3 AND 160),
 category text NOT NULL,
 version_label text NOT NULL,
 review_date date NOT NULL,
 supplier text NOT NULL DEFAULT '',
 content text NOT NULL DEFAULT '',
 pdf bytea,
 created_by text NOT NULL,
 request_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (length(content)>0 OR pdf IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS sop_drafts_pharmacy ON sop_drafts(pharmacy_id,created_at DESC);
