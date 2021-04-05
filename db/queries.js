const bcrypt = require('bcrypt');
const { Client } = require('pg');
const xss = require('xss');

const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/iprog';

const {
  validateUser,
  validateTeam,
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

function queryError({
  error, details, code = 400, validation = [],
}) {
  if (validation.length === 0) console.error(error, details, validation);

  return {
    success: false,
    code,
    obj: {
      error,
      details,
      validation,
    },
  };
}

function querySuccess(item) {
  return {
    success: true,
    item,
  };
}

function prepareResult(rows, table, offset, limit, url, search) {
  const result = {
    links: {
      self: {
        href: `http://${url}/${table}${search}offset=${offset}&limit=${limit}`,
      },
    },
    limit,
    offset,
    items: rows,
  };

  // If offset results, insert path to 'prev' results
  if (offset > 0) {
    result.links.prev = {
      href: `http://${url}/${table}${search}offset=${offset - limit}&limit=${limit}`,
    };
  }

  // If there are no more results, don't return 'next' results
  if (!(rows.length < limit)) {
    result.links.next = {
      href: `http://${url}/${table}${search}offset=${Number(offset) + limit}&limit=${limit}`,
    };
  }

  return result;
}

/* Multi table queries */

async function getRecordById({ id, table, columns = '*' } = {}) {
  const q = `SELECT ${columns} FROM ${table} WHERE id = $1 LIMIT 1`;

  const result = await query(q, [id]);

  if (result.error) {
    return queryError({ error: `Error getting record from ${table}`, details: result.error });
  }

  if (result.rows.length === 0) {
    return queryError({ error: 'Record not found', code: 404 });
  }

  return querySuccess(result.rows[0]);
}

async function readAllRecords(table, conditions, values) {
  const q = `SELECT * FROM ${table} ${conditions}`;
  const result = await query(q, values);

  if (result.error) {
    return queryError({ error: 'Error fetching records', details: result.error });
  }

  return querySuccess(result.rows);
}

async function deleteRecordById({ id, table, columns = '*' } = {}) {
  const q = `DELETE FROM ${table} WHERE id = $1 RETURNING ${columns}`;

  const result = await query(q, [id]);

  if (result.error) {
    return queryError({ error: 'Error deleting record', details: result.error });
  }

  if (result.rowCount === 0) {
    return queryError({ error: 'Record not found!', code: 404 });
  }

  return querySuccess(result.rows[0]);
}

/* User queries */

async function createUser({ username = '', email = '', password = '' }) {
  const validation = validateUser({ username, email, password });

  if (validation.length > 0) {
    return queryError({ error: 'Validation error', validation });
  }

  const cleanUsername = xss(username);
  const cleanEmail = xss(email);
  const cleanPassword = await bcrypt.hash(xss(password), 11);


  const q = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email';

  const result = await query(q, [cleanUsername, cleanEmail, cleanPassword]);

  if (result.error) {
    return queryError({ error: 'Error creating user', details: result.error });
  }

  return querySuccess(result.rows[0]);
}

async function getAllUsers(offset = 0, limit = 10, url) {
  const q = 'SELECT id, username, email FROM users ORDER BY id OFFSET $1 Limit $2';

  const cleanOffset = Number(xss(offset));
  const cleanLimit = Number(xss(limit));

  const result = await query(q, [cleanOffset, cleanLimit]);

  if (result.error) {
    return queryError({ error: 'Error getting users from users table', details: result.error });
  }

  const { rows } = result;
  const preparedResult = prepareResult(rows, 'users', cleanOffset, cleanLimit, url, '/?');

  return querySuccess(preparedResult);
}

async function getUserById(id) {
  const q = 'SELECT id, username, email FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result.error) {
    return queryError({ error: 'Error finding user', details: result.error });
  }

  if (result.rows.length === 0) {
    return queryError({ error: 'User not found', code: 404 });
  }

  return querySuccess(result.rows[0]);
}

/* Query returns all user information! Query should only be used internally for authentication! */
async function getUserByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.error) {
    return queryError({ error: `Error finding user with username = ${username}`, details: result.error });
  }

  if (result.rowCount === 0) {
    const validation = {
      field: 'username',
      message: `No user with username = ${username} found`,
    };

    return queryError({ error: 'Validation error', validation });
  }

  if (result.rowCount > 1) {
    return queryError({ error: `Expected exactly 1 query result, got ${result.rowCount}`, code: 500 });
  }

  return querySuccess(result.rows[0]);
}

async function patchUser({
  user, newUsername, newEmail, newPassword,
}) {
  const username = newUsername ? xss(newUsername) : user.username;
  const email = newEmail ? xss(newEmail) : user.email;
  const password = newPassword ? xss(newPassword) : null;

  const validation = newPassword
    ? validateUser({ username, email, password })
    : validateUser({ username, email, password: 'validPassword' });

  if (validation.length > 0) {
    return queryError({ error: 'Validation error', validation });
  }

  let q;
  let values;

  if (newPassword) {
    const hashedPassword = await bcrypt.hash(password, 11);
    q = 'UPDATE users SET (username, email, password) = ($1, $2, $3) WHERE id = $4 RETURNING id, username, email';
    values = [username, email, hashedPassword, user.id];
  } else {
    q = 'UPDATE users SET (username, email) = ($1, $2) WHERE id = $3 RETURNING id, username, email';
    values = [username, email, user.id];
  }

  const result = await query(q, values);

  if (result.error) {
    return queryError({ error: 'Error updating user', details: result.error });
  }

  return querySuccess(result.rows[0]);
}

/* Team Queries */

async function createTeam({
  teamName, id, ownerName, lineup,
} = {}) {
  const cleanName = xss(teamName);
  const cleanLineup = xss(lineup);

  const validation = validateTeam(teamName, lineup);

  if (validation.length > 0) {
    return queryError({ error: 'Validation error', validation });
  }

  const q = 'INSERT INTO teams (team_name, owner_id, owner_username, lineup) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [cleanName, id, ownerName, cleanLineup];

  const result = await query(q, values);

  if (result.error) {
    return queryError({ error: 'Error creating team', details: result.error });
  }

  return querySuccess(result.rows[0]);
}

async function patchTeam({ oldTeam, name, lineup } = {}) {
  const cleanName = name ? xss(name) : oldTeam.team_name;
  const cleanLineup = lineup ? xss(lineup) : oldTeam.lineup;

  const validation = validateTeam(cleanName, cleanLineup);
  if (validation.length > 0) {
    return queryError({ error: 'Validation error', validation });
  }

  const q = 'UPDATE teams SET (team_name, lineup) = ($1, $2) WHERE id = $3 RETURNING *';
  const result = await query(q, [cleanName, cleanLineup, oldTeam.id]);

  if (result.error) {
    return queryError({ error: 'Error updating team', details: result.error });
  }

  return querySuccess(result.rows[0]);
}

module.exports = {
  createTeam,
  createUser,
  deleteRecordById,
  getAllUsers,
  getRecordById,
  getUserByUsername,
  getUserById,
  patchUser,
  patchTeam,
  readAllRecords,
};
