const bcrypt = require('bcrypt');
const { Client } = require('pg');
const xss = require('xss');

const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/iprog';

const {
  validateUser,
  validateTeam,
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

async function createUser({ username, email, password } = {}) {
  const validation = validateUser({ username, email, password });

  if (validation.length > 0) {
    return {
      success: false,
      validation,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 11);

  const q = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, profile';

  const result = await query(q, [username, email, hashedPassword]);

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
  const q = `SELECT id, username, email, profile FROM users ${params}`;
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

async function createTeam({ teamName, ownerId, lineup } = {}) {
  const validation = validateTeam(teamName);

  if (validation.length > 0) {
    return {
      success: false,
      validation,
    };
  }

  const stringTeam = JSON.stringify(lineup);

  const cleanName = xss(teamName);
  const cleanId = xss(ownerId);
  const cleanLineup = xss(stringTeam);

  const q = 'INSERT INTO teams (team_name, owner_id, lineup) VALUES ($1, $2, $3) RETURNING *';
  const values = [cleanName, cleanId, cleanLineup];

  const result = await query(q, values);

  if (result.error) {
    const msg = 'Error Creating Team';
    return queryError(result.error, msg);
  }

  return {
    success: true,
    validation: [],
    item: result.rows[0],
  };
}

async function patchTeam(id, body, uId) {
  const conditions = 'WHERE id = $1';
  const oldTeam = await readAll('teams', conditions, [id]);

  if (!oldTeam[0]) {
    return {
      success: false,
      notfound: true,
    };
  }

  if (oldTeam[0].owner_id !== uId) {
    return {
      success: false,
      authentication: true,
    };
  }

  const {
    teamName = oldTeam[0].team_name,
    lineup = JSON.parse(oldTeam[0].lineup),
  } = body;


  const validation = validateTeam(teamName);
  if (validation.length > 0) {
    return {
      success: false,
      validation,
    };
  }

  const cleanName = xss(teamName);
  const cleanLineup = xss(JSON.stringify(lineup));

  const q = 'UPDATE teams SET team_name = $1, lineup = $2 WHERE id = $3 RETURNING *';
  const values = [cleanName, cleanLineup, id];

  const result = await query(q, values);

  if (result.error) {
    const msg = 'Error updating team';
    return queryError(result.error, msg);
  }

  return {
    success: true,
    validation: [],
    item: result.rows[0],
  };
}

async function del(id, req) {
  const q = 'DELETE FROM teams WHERE id = $1 AND owner_id = $2 returning *';

  const result = await query(q, [id, req.user[0].id]);

  if (result.error) {
    const msg = 'Error running query';
    return queryError(result.error, msg);
  }
  const { rows } = result;

  return rows;
}


module.exports = {
  readAll,
  findByUsername,
  readUsers,
  createUser,
  patchMe,
  createTeam,
  patchTeam,
  del,
};
