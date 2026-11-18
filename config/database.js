const { Pool, types } = require("pg")

// Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Dates,
// so they don't shift by a day when serialised to JSON in non-UTC timezones.
types.setTypeParser(types.builtins.DATE, (value) => value);
const dotenv = require('dotenv');
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

module.exports = pool;

// async function test() {
//     const res = await pool.query("SELECT current_database()");
//     const tim = await pool.query("SELECT NOW()");
// console.log(res.rows, tim.rows);
// }

// test();