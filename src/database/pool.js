const { Pool } = require("pg");
require("dotenv").config();

const USER = process.env.PGUSER;
const PASSWORD = process.env.PGPASSWORD;
const HOST = process.env.PGHOST;
const PORT = process.env.PGPORT;
const DATABASE = process.env.PGDATABASE;

const pool = new Pool({
  user: USER,
  password: PASSWORD,
  host: HOST,
  port: PORT,
  database: DATABASE,
});

module.exports = pool;
