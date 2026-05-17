const db = require("../config/database");

exports.getStudentInfoByUsn = async (usn) => {
    const response = await db.query(
        "SELECT usn, name, email FROM student WHERE usn = $1",
        [usn]
    );

    return response.rows[0] || null;
};

exports.getEventsForStudentDashboard = async (usn) => {
    const response = await db.query(
        `SELECT
            e.id,
            e.name,
            e.category,
            e.description,
            e.event_date,
            e.event_time,
            e.imgurl,
            e.group_chatlink,
            r.isindividual,
            r.total_capacity,
            r.min_members,
            r.max_members,
            r.department_allowed,
            v.block,
            v.hall,
            o.name AS organizer_name,
            COUNT(DISTINCT CASE
                WHEN r.isindividual THEN p.usn
                ELSE p.team_name
            END)::int AS registered,
            COALESCE(
                (
                    SELECT json_agg(
                        jsonb_build_object(
                            'name', c.name,
                            'phone', c.phone,
                            'email', c.email
                        )
                    )
                    FROM coordinator c
                    WHERE c.eventid = e.id
                ),
                '[]'::json
            ) AS coordinators,
            EXISTS (
                SELECT 1
                FROM participate ps
                WHERE ps.eventid = e.id AND ps.usn = $1
            ) AS is_registered
        FROM event e
        JOIN rules r
            ON r.eventid = e.id
        JOIN venue v
            ON v.id = e.venueid
        JOIN organization o
            ON o.id = e.organizerid
        LEFT JOIN participate p
            ON p.eventid = e.id
        GROUP BY
            e.id,
            e.name,
            e.category,
            e.description,
            e.event_date,
            e.event_time,
            e.imgurl,
            e.group_chatlink,
            r.isindividual,
            r.total_capacity,
            r.min_members,
            r.max_members,
            r.department_allowed,
            v.block,
            v.hall,
            o.name
        ORDER BY e.event_date ASC, e.event_time ASC`,
        [usn]
    );

    return response.rows;
};

exports.getEventRegistrationInfo = async (eventId, usn) => {
    const response = await db.query(
        `SELECT
            e.id,
            e.name,
            e.category,
            e.description,
            e.event_date,
            e.event_time,
            e.imgurl,
            e.group_chatlink,
            r.isindividual,
            r.total_capacity,
            r.min_members,
            r.max_members,
            r.department_allowed,
            v.block,
            v.hall,
            o.name AS organizer_name,
            COUNT(DISTINCT CASE
                WHEN r.isindividual THEN p.usn
                ELSE p.team_name
            END)::int AS registered,
            COALESCE(
                (
                    SELECT json_agg(
                        jsonb_build_object(
                            'name', c.name,
                            'phone', c.phone,
                            'email', c.email
                        )
                    )
                    FROM coordinator c
                    WHERE c.eventid = e.id
                ),
                '[]'::json
            ) AS coordinators,
            EXISTS (
                SELECT 1
                FROM participate ps
                WHERE ps.eventid = e.id AND ps.usn = $2
            ) AS is_registered
        FROM event e
        JOIN rules r
            ON r.eventid = e.id
        JOIN venue v
            ON v.id = e.venueid
        JOIN organization o
            ON o.id = e.organizerid
        LEFT JOIN participate p
            ON p.eventid = e.id
        WHERE e.id = $1
        GROUP BY
            e.id,
            e.name,
            e.category,
            e.description,
            e.event_date,
            e.event_time,
            e.imgurl,
            e.group_chatlink,
            r.isindividual,
            r.total_capacity,
            r.min_members,
            r.max_members,
            r.department_allowed,
            v.block,
            v.hall,
            o.name` ,
        [eventId, usn]
    );

    return response.rows[0] || null;
};

exports.getMissingStudents = async (usns) => {
    if (!usns || usns.length === 0) {
        return [];
    }

    const response = await db.query(
        "SELECT usn FROM student WHERE usn = ANY($1)",
        [usns]
    );

    const existing = new Set(response.rows.map((row) => row.usn));
    return usns.filter((usn) => !existing.has(usn));
};

exports.getAlreadyRegisteredMembers = async (eventId, usns) => {
    if (!usns || usns.length === 0) {
        return [];
    }

    const response = await db.query(
        "SELECT usn FROM participate WHERE eventid = $1 AND usn = ANY($2)",
        [eventId, usns]
    );

    return response.rows.map((row) => row.usn);
};

exports.registerStudentsForEvent = async (eventId, usns, teamName = null) => {
    if (!usns || usns.length === 0) {
        return;
    }

    const values = [];
    const placeholders = [];

    usns.forEach((usn, index) => {
        const base = index * 3;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
        values.push(usn, eventId, teamName);
    });

    await db.query(
        `INSERT INTO participate (usn, eventid, team_name) VALUES ${placeholders.join(",")}`,
        values
    );
};

exports.getRegisteredEventsForStudent = async (usn) => {
    const response = await db.query(
        `SELECT
            e.id,
            e.name,
            e.category,
            e.event_date,
            e.event_time,
            r.isindividual,
            o.name AS organizer_name
        FROM participate p
        JOIN event e
            ON e.id = p.eventid
        JOIN rules r
            ON r.eventid = e.id
        JOIN organization o
            ON o.id = e.organizerid
        WHERE p.usn = $1
        GROUP BY
            e.id,
            e.name,
            e.category,
            e.event_date,
            e.event_time,
            r.isindividual,
            o.name
        ORDER BY e.event_date ASC, e.event_time ASC`,
        [usn]
    );

    return response.rows;
};

exports.cancelStudentRegistration = async (eventId, usn) => {
    const response = await db.query(
        `WITH registration AS (
            SELECT team_name
            FROM participate
            WHERE eventid = $1 AND usn = $2
            LIMIT 1
        )
        DELETE FROM participate p
        USING registration r
        WHERE p.eventid = $1
          AND (
              (r.team_name IS NULL AND p.usn = $2)
              OR (r.team_name IS NOT NULL AND p.team_name = r.team_name)
          )
        RETURNING p.eventid`,
        [eventId, usn]
    );

    return response.rowCount > 0;
};
