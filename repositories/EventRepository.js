const BaseRepository = require("./BaseRepository");

const COUNT = BaseRepository.REGISTERED_COUNT_SQL;

/**
 * Event + its rules row (1:1, part of the event). One shared query builds the
 * student-facing view, which used to be copy-pasted in two model functions.
 */
const STUDENT_EVENT_SQL = (where) => `SELECT
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
            ${COUNT} AS registered,
            COALESCE(
                (
                    SELECT json_agg(jsonb_build_object('name', c.name, 'phone', c.phone, 'email', c.email))
                    FROM coordinator c
                    WHERE c.eventid = e.id
                ),
                '[]'::json
            ) AS coordinators,
            EXISTS (
                SELECT 1 FROM participate ps WHERE ps.eventid = e.id AND ps.usn = $1
            ) AS is_registered
        FROM event e
        JOIN rules r ON r.eventid = e.id
        JOIN venue v ON v.id = e.venueid
        JOIN organization o ON o.id = e.organizerid
        LEFT JOIN participate p ON p.eventid = e.id
        ${where}
        GROUP BY e.id, r.eventid, v.id, o.id
        ORDER BY e.event_date ASC, e.event_time ASC`;

class EventRepository extends BaseRepository {
    // ---- student views -------------------------------------------------------

    listForStudent(usn) {
        return this.many(STUDENT_EVENT_SQL(""), [usn]);
    }

    findForStudent(eventId, usn, client) {
        return this.one(STUDENT_EVENT_SQL("WHERE e.id = $2"), [usn, eventId], client);
    }

    // ---- organizer views -----------------------------------------------------

    listForOrganizer(orgId) {
        return this.many(
            `SELECT e.id, e.name, e.category, e.event_date, e.event_time, e.imgurl,
                    r.isindividual, r.total_capacity, v.block, v.hall,
                    ${COUNT} AS registered
            FROM event e
            JOIN rules r ON r.eventid = e.id
            JOIN venue v ON v.id = e.venueid
            LEFT JOIN participate p ON p.eventid = e.id
            WHERE e.organizerid = $1
            GROUP BY e.id, r.eventid, v.id`,
            [orgId]
        );
    }

    listRegistrationSummary(orgId) {
        return this.many(
            `SELECT e.id, e.name, e.event_date, e.event_time,
                    ${COUNT} AS total_registrations
            FROM event e
            JOIN rules r ON r.eventid = e.id
            LEFT JOIN participate p ON p.eventid = e.id
            WHERE e.organizerid = $1
            GROUP BY e.id
            ORDER BY e.event_date DESC, e.event_time DESC, e.name ASC`,
            [orgId]
        );
    }

    findSummaryForOrganizer(eventId, orgId) {
        return this.one(
            `SELECT e.id, e.name, e.category, e.event_date, e.event_time, e.imgurl,
                    r.isindividual, r.total_capacity, r.min_members, r.max_members,
                    v.block, v.hall, o.name AS organizer_name
            FROM event e
            JOIN rules r ON r.eventid = e.id
            JOIN venue v ON v.id = e.venueid
            JOIN organization o ON o.id = e.organizerid
            WHERE e.id = $1 AND e.organizerid = $2`,
            [eventId, orgId]
        );
    }

    /** Full editable record, including coordinators. Scoped to the owner. */
    findEditable(eventId, orgId) {
        return this.one(
            `SELECT e.id, e.name, e.category, e.description, e.event_date, e.event_time,
                    e.group_chatlink, e.imgurl, e.organizerid,
                    r.isindividual, r.total_capacity, r.min_members, r.max_members, r.department_allowed,
                    v.id AS venue_id, v.block, v.hall,
                    (
                        SELECT COALESCE(json_agg(jsonb_build_object('id', c.id, 'name', c.name, 'phone', c.phone, 'email', c.email)), '[]')
                        FROM coordinator c
                        WHERE c.eventid = e.id
                    ) AS coordinators
            FROM event e
            JOIN rules r ON r.eventid = e.id
            JOIN venue v ON v.id = e.venueid
            WHERE e.id = $1 AND e.organizerid = $2`,
            [eventId, orgId]
        );
    }

    async isOwnedBy(eventId, orgId, client) {
        return (await this.one("SELECT 1 FROM event WHERE id = $1 AND organizerid = $2", [eventId, orgId], client)) !== null;
    }

    /** Locks the event row so concurrent registrations are checked one at a time. */
    async lockForRegistration(eventId, client) {
        return (await this.one("SELECT id FROM event WHERE id = $1 FOR UPDATE", [eventId], client)) !== null;
    }

    // ---- writes --------------------------------------------------------------

    async insert(event, client) {
        const row = await this.one(
            `INSERT INTO event (name, category, description, event_date, event_time, group_chatlink, organizerid, venueid, imgurl)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [event.name, event.category, event.description, event.date, event.time, event.groupChatLink, event.organizerId, event.venue.id, event.imageUrl],
            client
        );
        event.id = row.id;

        const rules = event.toRulesRecord();
        await this.run(
            `INSERT INTO rules (eventid, isindividual, total_capacity, min_members, max_members, department_allowed)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [event.id, rules.isindividual, rules.total_capacity, rules.min_members, rules.max_members, rules.department_allowed],
            client
        );
        return event;
    }

    /** Updates the event and its rules. A null imageUrl keeps the current image. */
    async update(event, client) {
        await this.run(
            `UPDATE event
            SET name = $1, category = $2, description = $3, event_date = $4, event_time = $5,
                group_chatlink = $6, venueid = $7, imgurl = COALESCE($8, imgurl)
            WHERE id = $9 AND organizerid = $10`,
            [event.name, event.category, event.description, event.date, event.time, event.groupChatLink, event.venue.id, event.imageUrl, event.id, event.organizerId],
            client
        );

        const rules = event.toRulesRecord();
        await this.run(
            `UPDATE rules
            SET isindividual = $1, total_capacity = $2, min_members = $3, max_members = $4, department_allowed = $5
            WHERE eventid = $6`,
            [rules.isindividual, rules.total_capacity, rules.min_members, rules.max_members, rules.department_allowed, event.id],
            client
        );
        return event;
    }

    /** @returns {Promise<boolean>} false if the event doesn't exist or isn't owned by orgId */
    async delete(eventId, orgId) {
        const { rowCount } = await this.run("DELETE FROM event WHERE id = $1 AND organizerid = $2", [eventId, orgId]);
        return rowCount > 0;
    }
}

module.exports = EventRepository;
