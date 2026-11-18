-- Clubs / departments that host events
CREATE TABLE IF NOT EXISTS organization (
    id        SERIAL  PRIMARY KEY,
    name      TEXT    NOT NULL UNIQUE,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    username  TEXT    NOT NULL UNIQUE
);
