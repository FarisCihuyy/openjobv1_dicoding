require("dotenv").config();

const USER = process.env.PGUSER;
const PASSWORD = process.env.PGPASSWORD;
const HOST = process.env.PGHOST;
const PORT = process.env.PGPORT;
const DATABASE = process.env.PGDATABASE;

const databaseUrl = `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`;

module.exports = {
  databaseUrl,
  dir: "./migrations",
};
