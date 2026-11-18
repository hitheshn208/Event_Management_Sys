const BaseRepository = require("./BaseRepository");

const COUNT = BaseRepository.REGISTERED_COUNT_SQL;

class RegistrationRepository extends BaseRepository {
    async isRegistered(eventId, usn, client) {
        return (await this.one("SELECT 1 FROM participate WHERE eventid = $1 AND usn = $2", [eventId, usn], client)) !== null;
    }

    async findAlreadyRegistered(eventId, usns, client) {
        if (!usns.length) return [];
        const rows = await this.many("SELECT usn FROM participate WHERE eventid = $1 AND usn = ANY($2)", [eventId, usns], client);
        return rows.map((row) => row.usn);
    }

    /** @param {import("../domain/registration/Registration")[]} registrations */
    async insertMany(registrations, client) {
        if (!registrations.length) return;
        const values = [];
        const placeholders = registrations.map((reg, i) => {
            values.push(reg.usn, reg.eventId, reg.teamName);
            const b = i * 3;
            return `($${b + 1}, $${b + 2}, $${b + 3})`;
        });
        await this.run(`INSERT INTO participate (usn, eventid, team_name) VALUES ${placeholders.join(", ")}`, values, client);
    }

    /** Current number of registrations (students or teams) for an event. */
    async countForEvent(eventId, client) {
        const row = await this.one(
            `SELECT ${COUNT} AS total
            FROM rules r
            LEFT JOIN participate p ON p.eventid = r.eventid
            WHERE r.eventid = $1`,
            [eventId],
            client
        );
        return row ? row.total : 0;
    }

    listEventsForStudent(usn) {
        return this.many(
            `SELECT e.id, e.name, e.category, e.event_date, e.event_time, r.isindividual, o.name AS organizer_name
            FROM participate p
            JOIN event e ON e.id = p.eventid
            JOIN rules r ON r.eventid = e.id
            JOIN organization o ON o.id = e.organizerid
            WHERE p.usn = $1
            ORDER BY e.event_date ASC, e.event_time ASC`,
            [usn]
        );
    }

    /** Participants as the organizer sees them: students, or teams with members. */
    async listParticipants(event) {
        if (event.isIndividual) {
            return this.many(
                `SELECT p.usn, s.name
                FROM participate p
                JOIN student s ON s.usn = p.usn
                WHERE p.eventid = $1
                ORDER BY p.usn ASC`,
                [event.id]
            );
        }

        const rows = await this.many(
            `SELECT p.team_name,
                    json_agg(jsonb_build_object('usn', s.usn, 'name', s.name) ORDER BY s.name, s.usn) AS members
            FROM participate p
            JOIN student s ON s.usn = p.usn
            WHERE p.eventid = $1
            GROUP BY p.team_name
            ORDER BY p.team_name ASC`,
            [event.id]
        );
        return rows.map((row) => ({ team_name: row.team_name, members: Array.isArray(row.members) ? row.members : [] }));
    }

    /**
     * Cancels the student's entry. For a team entry the whole team is removed.
     * @returns {Promise<boolean>} false if the student wasn't registered
     */
    async cancel(eventId, usn) {
        const { rowCount } = await this.run(
            `WITH registration AS (
                SELECT team_name FROM participate WHERE eventid = $1 AND usn = $2 LIMIT 1
            )
            DELETE FROM participate p
            USING registration r
            WHERE p.eventid = $1
              AND (
                  (r.team_name IS NULL AND p.usn = $2)
                  OR (r.team_name IS NOT NULL AND p.team_name = r.team_name)
              )`,
            [eventId, usn]
        );
        return rowCount > 0;
    }
}

module.exports = RegistrationRepository;
