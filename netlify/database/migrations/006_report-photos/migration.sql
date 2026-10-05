CREATE TABLE report_photos (
 report_id uuid PRIMARY KEY,
 pharmacy_id uuid NOT NULL,
 content_type text NOT NULL CHECK(content_type='image/jpeg'),
 data bytea NOT NULL CHECK(octet_length(data) BETWEEN 6 AND 1048576),
 sha256 text NOT NULL,
 FOREIGN KEY(report_id,pharmacy_id) REFERENCES reports(id,pharmacy_id)
);
CREATE TRIGGER immutable_report_photos BEFORE UPDATE OR DELETE ON report_photos FOR EACH ROW EXECUTE FUNCTION protect_report();
