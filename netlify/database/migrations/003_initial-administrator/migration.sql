CREATE TABLE installation_authorisation (key text PRIMARY KEY, identity_fingerprint text NOT NULL CHECK(length(identity_fingerprint)=64));
INSERT INTO installation_authorisation(key,identity_fingerprint) VALUES('initial-organisations','a6407709dba24793a5c1069ed62fb3596417ebb5c0288f77cbb2d41788fefdd8');
