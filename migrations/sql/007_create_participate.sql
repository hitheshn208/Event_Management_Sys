-- Student registrations; team members share the same team_name per event
CREATE TABLE IF NOT EXISTS participate (
    usn          VARCHAR(20)  NOT NULL REFERENCES student(usn) ON DELETE CASCADE,
    eventid      INTEGER      NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    hasattended  BOOLEAN      DEFAULT FALSE,
    team_name    TEXT,
    PRIMARY KEY (usn, eventid)
);

CREATE INDEX IF NOT EXISTS idx_participate_event_team ON participate (eventid, team_name);
