-- Student accounts (login via USN)
CREATE TABLE IF NOT EXISTS student (
    usn         VARCHAR(20)  PRIMARY KEY,
    name        VARCHAR(30)  NOT NULL,
    year_out    INTEGER      NOT NULL,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    password    TEXT         NOT NULL,
    dept        VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    email       TEXT         UNIQUE
);
