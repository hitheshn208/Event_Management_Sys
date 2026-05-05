const { Pool } = require("pg")
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