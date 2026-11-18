-- Participation rules, exactly one row per event.
-- NOTE: column order matters - organizerModel.addrules uses a positional
-- "INSERT INTO rules VALUES($1..$6)".
CREATE TABLE IF NOT EXISTS rules (
    eventid             INTEGER  PRIMARY KEY REFERENCES event(id) ON DELETE CASCADE,
    isindividual        BOOLEAN  NOT NULL DEFAULT TRUE,
    total_capacity      INTEGER  CHECK (total_capacity IS NULL OR total_capacity >= 0),
    min_members         INTEGER  CHECK (min_members IS NULL OR min_members >= 1),
    max_members         INTEGER,
    department_allowed  TEXT,
    CHECK (min_members IS NULL OR max_members IS NULL OR max_members >= min_members)
);
