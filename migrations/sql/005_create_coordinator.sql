-- Contact people for an event (many per event)
CREATE TABLE IF NOT EXISTS coordinator (
    id       SERIAL       PRIMARY KEY,
    eventid  INTEGER      NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    name     TEXT,
    phone    VARCHAR(15),
    email    TEXT
);

CREATE INDEX IF NOT EXISTS idx_coordinator_eventid ON coordinator (eventid);
