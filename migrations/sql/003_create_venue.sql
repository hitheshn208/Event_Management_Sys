-- Halls where events take place (looked up by block + hall)
CREATE TABLE IF NOT EXISTS venue (
    id     SERIAL  PRIMARY KEY,
    block  TEXT    NOT NULL,
    hall   TEXT    NOT NULL,
    UNIQUE (block, hall)
);
