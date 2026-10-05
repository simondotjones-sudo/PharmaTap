ALTER TABLE organisations ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE pharmacies ADD COLUMN county text;
ALTER TABLE pharmacies ADD COLUMN source_url text;
CREATE TABLE organisation_memberships (
 user_id text NOT NULL, organisation_id uuid NOT NULL REFERENCES organisations,
 role text NOT NULL CHECK(role IN ('admin')), active boolean NOT NULL DEFAULT true,
 PRIMARY KEY(user_id,organisation_id)
);
CREATE TABLE installation_setup (
 key text PRIMARY KEY, configured_user_id text NOT NULL, completed_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO organisations(id,name,is_demo) VALUES('b118137f-b4ca-46df-a329-5b66ab329a23','Demo',true),('876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Stacks Pharmacies',false) ON CONFLICT(id) DO UPDATE SET name=excluded.name,is_demo=excluded.is_demo;
INSERT INTO pharmacies(id,organisation_id,name) VALUES('a0e2cc87-2fb0-4a72-9bb4-1f8f4eeb476e','b118137f-b4ca-46df-a329-5b66ab329a23','Demo Skerries'),('5fb23fd1-a239-4a6d-980d-a8bef1a018b2','b118137f-b4ca-46df-a329-5b66ab329a23','Demo Marley Park') ON CONFLICT(id) DO UPDATE SET name=excluded.name;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('9dcb245e-4026-5ccf-901c-82f77759925e','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Bettystown','Meath','https://www.stackspharmacy.ie/locations/1') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('994d69d8-7397-58f1-9c10-672f17a6b31e','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Callan','Kilkenny','https://www.stackspharmacy.ie/locations/2') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('847d20f0-5c6e-556f-825e-91855538b419','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Skerries','Dublin','https://www.stackspharmacy.ie/locations/7') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('1d00985a-6a2a-5b6e-82d7-22b6742c0698','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Tullow','Carlow','https://www.stackspharmacy.ie/locations/9') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('bf41ab0f-6dce-5ac3-b7d3-b02762b9df92','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Ratoath','Meath','https://www.stackspharmacy.ie/locations/10') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('e42aef0e-b4a3-58f3-9a1d-10499da41ffb','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Marley Park','Dublin','https://www.stackspharmacy.ie/locations/11') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('6ab7d539-771e-553a-9af6-a95aba87879d','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Lusk','Dublin','https://www.stackspharmacy.ie/locations/12') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('4cf5753b-59c6-501d-9965-fd0ea1171c87','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Moyross','Limerick','https://www.stackspharmacy.ie/locations/13') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('79898231-cb22-568f-bfe8-6f7b0a35999f','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Laytown','Meath','https://www.stackspharmacy.ie/locations/14') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('50d9b6da-0532-5c99-a939-5e7f6461f9ec','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Clongriffin','Dublin','https://www.stackspharmacy.ie/locations/22') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('978ecb1c-6085-5ff7-817b-f8d94e3f6a15','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Gorey','Wexford','https://www.stackspharmacy.ie/locations/23') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('71f06c78-143e-56ce-8d07-49790cefcfa5','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Glasnevin','Dublin','https://www.stackspharmacy.ie/locations/24') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('f60933fe-f03d-5081-9896-12b646086b1e','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Kilbarrack','Dublin','https://www.stackspharmacy.ie/locations/25') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('a284f7e6-46ff-53fe-84bc-4e7c29c68128','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Darndale','Dublin','https://www.stackspharmacy.ie/locations/26') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('7242b2d7-2fe1-5fc4-97c9-8c39cce71b26','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Passage West','Cork','https://www.stackspharmacy.ie/locations/60') ON CONFLICT(id) DO NOTHING;
INSERT INTO pharmacies(id,organisation_id,name,county,source_url) VALUES('e7515288-e7f3-5907-bf7d-444bc5919b1a','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d','Ballymount','Dublin','https://www.stackspharmacy.ie/locations/74') ON CONFLICT(id) DO NOTHING;
