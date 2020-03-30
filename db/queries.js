const bcrypt = require('bcrypt');
const { Client } = require('pg');
// const xss = require('xss');

const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/iprog';

const {
  validateUser,
  queryError,
} = require('../utils/validation');

async function query(q, values = []) {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const result = await client.query(q, values);
    return result;
  } catch (err) {
    return { error: err };
  } finally {
    await client.end();
  }
}

// Fall sem les töflu 'table' með skilyrðum 'params'
async function readAll(table, conditions, values) {
  const q = `SELECT * FROM ${table} ${conditions}`;
  const result = await query(q, values);
  if (result.error) {
    const msg = `Error reading table ${table}`;
    return queryError(result.error, msg);
  }
  const { rows } = result;
  return rows;
}

async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function createUser({ username, name, password } = {}) {
  const validation = validateUser({ username, name, password });

  if (validation.length > 0) {
    return {
      success: false,
      validation,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 11);

  const q = 'INSERT INTO users (username, name, password) VALUES ($1, $2, $3) RETURNING id, username, name, profile';

  const result = await query(q, [username, name, hashedPassword]);

  if (result.error) {
    const msg = 'Error reading categories';
    return queryError(result.error, msg);
  }

  return {
    success: true,
    validation: [],
    item: result.rows[0],
  };
}

async function readUsers(params, values) {
  const q = `SELECT id, username, name, profile FROM users ${params}`;
  const result = await query(q, values);
  if (result.error) {
    const msg = 'Error reading table users';
    return queryError(result.error, msg);
  }
  const { rows } = result;
  return rows;
}


async function patchMe(req) {
  const qq = 'SELECT * FROM users WHERE id = $1';
  const user = await query(qq, [req.user[0].id]);

  const {
    username,
    name: oldName,
    password: oldPassword,
    id: userId,
  } = user.rows[0];

  const {
    name = oldName,
    password = oldPassword,
  } = req.body;

  let validation;
  if (req.body.password) {
    validation = validateUser({ username, name, password });
  } else {
    validation = validateUser({ username, name, password: 'isGood' });
  }

  if (validation.length > 0) {
    return {
      success: false,
      validation,
    };
  }

  const hashedPassword = req.body.password
    ? await bcrypt.hash(password, 11)
    : password;

  const q = 'UPDATE users SET (password, name)  = ($1, $2) WHERE id = $3 RETURNING id, username, name, profile';
  const values = [hashedPassword, name, userId];

  const result = await query(q, values);

  if (result.error) {
    const msg = 'Error updating user';
    return queryError(result.error, msg);
  }

  return {
    success: true,
    validation: [],
    item: result.rows,
  };
}


module.exports = {
  readAll,
  findByUsername,
  readUsers,
  createUser,
  patchMe,
};
