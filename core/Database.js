const { Pool } = require("pg");
const dbConfig = require("../config/database");

/**
 * «Singleton» — the one PostgreSQL connection pool for the whole process.
 *
 * Every repository needs a pool, but opening several pools would multiply
 * connections and make transactions impossible to share. getInstance() is
 * the only way to obtain it.
 */
class Database {
    static #instance = null;
    static #constructing = false;

    #pool;

    constructor() {
        if (!Database.#constructing) {
            throw new Error("Database is a singleton. Use Database.getInstance().");
        }
        this.#pool = new Pool(dbConfig);
    }

    /** @returns {Database} */
    static getInstance() {
        if (!Database.#instance) {
            Database.#constructing = true;
            Database.#instance = new Database();
            Database.#constructing = false;
        }
        return Database.#instance;
    }

    /** Runs one statement on any free connection. */
    query(text, params) {
        return this.#pool.query(text, params);
    }

    /**
     * Runs `work(client)` inside BEGIN/COMMIT on a single connection.
     * Anything thrown inside rolls the whole unit back.
     */
    async transaction(work) {
        const client = await this.#pool.connect();
        try {
            await client.query("BEGIN");
            const result = await work(client);
            await client.query("COMMIT");
            return result;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /** Dedicated connection for scripts (e.g. migrations). Caller must release(). */
    connect() {
        return this.#pool.connect();
    }

    end() {
        return this.#pool.end();
    }
}

module.exports = Database;
