const Database = require("../core/Database");

/**
 * Common base for data-access classes. Every method accepts an optional
 * `client` so several repositories can take part in one transaction.
 */
class BaseRepository {
    constructor(db = Database.getInstance()) {
        this.db = db;
    }

    run(sql, params = [], client = null) {
        return (client || this.db).query(sql, params);
    }

    async one(sql, params, client) {
        const { rows } = await this.run(sql, params, client);
        return rows[0] || null;
    }

    async many(sql, params, client) {
        const { rows } = await this.run(sql, params, client);
        return rows;
    }
}

/** Registrations count: students for individual events, distinct teams for team events. */
BaseRepository.REGISTERED_COUNT_SQL = `COUNT(DISTINCT CASE
                WHEN r.isindividual THEN p.usn
                ELSE p.team_name
            END)::int`;

module.exports = BaseRepository;
