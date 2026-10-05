CREATE TABLE database_control (id boolean PRIMARY KEY DEFAULT true CHECK(id), writes_paused boolean NOT NULL DEFAULT false);
INSERT INTO database_control(id,writes_paused) VALUES(true,false);
