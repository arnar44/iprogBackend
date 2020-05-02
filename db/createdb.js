require('dotenv').config();

const fs = require('fs');
const util = require('util');

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/iprog';

const readFileAsync = util.promisify(fs.readFile);

async function query(q) {
  const client = new Client({ connectionString });

  await client.connect();

  try {
    const result = await client.query(q);

    const { rows } = result;
    return rows;
  } catch (err) {
    console.error('Error running query');
    throw err;
  } finally {
    await client.end();
  }
}

async function setup() {
  // Drop tables if they exist
  const drop = await readFileAsync('./db/sql/drop.sql');
  await query(drop.toString('utf-8'));
  console.info('Tables dropped');

  // Create tables
  const create = await readFileAsync('./db/sql/schema.sql');
  await query(create.toString('utf-8'));
  console.info('Tables created');

  // Insert users
  const insertUsers = await readFileAsync('./db/sql/insert-users.sql');
  await query(insertUsers.toString('utf-8'));
  console.info('Users inserted to tables');

  // Insert teams
  const insertTeams = await readFileAsync('./db/sql/insert-teams.sql');
  await query(insertTeams.toString('utf-8'));
  console.info('Users inserted to tables');
}

setup().catch((err) => {
  console.error('Error creating schema', err);
});
