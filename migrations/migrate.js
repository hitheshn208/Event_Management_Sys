// Runs every pending .sql file in ./sql in filename order.
// Applied files are recorded in the schema_migrations table, so re-running is safe.
// Usage: node migrations/migrate.js

const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

const SQL_DIR = path.join(__dirname, "sql");

async function migrate() {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename    TEXT PRIMARY KEY,
                applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const applied = new Set(
            (await client.query("SELECT filename FROM schema_migrations")).rows.map((r) => r.filename)
        );

        const files = fs
            .readdirSync(SQL_DIR)
            .filter((f) => f.endsWith(".sql"))
            .sort();

        const pending = files.filter((f) => !applied.has(f));

        if (pending.length === 0) {
            console.log("Database is up to date. No migrations to run.");
            return;
        }

        for (const file of pending) {
            const sql = fs.readFileSync(path.join(SQL_DIR, file), "utf8");

            try {
                await client.query("BEGIN");
                await client.query(sql);
                await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
                await client.query("COMMIT");
                console.log(`Applied  ${file}`);
            } catch (err) {
                await client.query("ROLLBACK");
                console.error(`Failed   ${file}: ${err.message}`);
                throw err;
            }
        }

        console.log(`Done. ${pending.length} migration(s) applied.`);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(() => {
    process.exitCode = 1;
});
