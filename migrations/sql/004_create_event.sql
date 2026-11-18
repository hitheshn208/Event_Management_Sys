-- Events hosted by an organization at a venue
CREATE TABLE IF NOT EXISTS event (
    id              SERIAL   PRIMARY KEY,
    name            TEXT     NOT NULL,
    category        TEXT,
    description     TEXT,
    event_date      DATE,
    event_time      TIME,
    group_chatlink  TEXT,
    organizerid     INTEGER  NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    venueid         INTEGER  REFERENCES venue(id) ON DELETE RESTRICT,
    imgurl          TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_organizerid ON event (organizerid);
CREATE INDEX IF NOT EXISTS idx_event_date_time   ON event (event_date, event_time);
