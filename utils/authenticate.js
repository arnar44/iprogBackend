const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const {
  createUser,
  getRecordById,
  getUserById,
  getUserByUsername,
} = require('../db/queries');

const auth = express();

const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime,
} = process.env;

if (!jwtSecret) {
  console.error('JWT_SECRET not registered in .env');
  process.exit(1);
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function verify(jwtData, done) {
  const { id } = jwtData;
  const result = await getUserById(id);

  if (!result.success) {
    // User not found -> send 401 unauth
    if (result.code === 404) return done(null, false, { name: 'Not found' });
    // Otherwise there was a query error -> error gets handled later
    return done(result.obj);
  }

  return done(null, result.item);
}

passport.use(new Strategy(jwtOptions, verify));
auth.use(passport.initialize());

async function comparePasswords(hash, password) {
  const result = await bcrypt.compare(hash, password);

  return result;
}

async function login(req, res) {
  const { username, password } = req.body;
  const result = await getUserByUsername(username);

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  const userInfo = result.item;
  const passwordIsCorrect = await comparePasswords(password, userInfo.password);

  if (passwordIsCorrect) {
    const payload = { id: userInfo.id };
    const tokenOptions = { expiresIn: parseInt(tokenLifetime, 10) };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);

    const user = {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
    };

    return res.json({ token, user });
  }

  const serverResponse = {
    error: 'Invalid password',
    details: '',
    validation: [{
      field: 'password',
      message: 'Invalid password',
    }],
  };

  return res.status(401).json(serverResponse);
}

async function register(req, res) {
  const { username, email, password } = req.body;

  const result = await createUser({ username, email, password });

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(201).json(result.item);
}

function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';
        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}

async function addRecordToRequest(req, res, next) {
  const reqToParams = {
    customteams: {
      table: 'teams',
      columns: '*',
    },
  };

  const id = Number(req.params.id);
  const reqBase = req.baseUrl.replace('/', '').replace('-', '');

  const parsedId = parseFloat(id);

  // eslint-disable-next-line no-bitwise
  if (Number.isNaN(id) || (parsedId | 0) !== parsedId) {
    return res.status(400).json({ error: 'ID is not an integer' });
  }

  const params = reqToParams[reqBase];
  // Check if we know what record to get
  if (!params) {
    return res.status(400).json({ error: `Record associated with ${reqBase} cant be looked up` });
  }

  const result = await getRecordById({ id, table: params.table, columns: params.columns });

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  req.record = result.item;

  return next();
}

function requireOwner(req, res, next) {
  const { id } = req.user;
  // eslint-disable-next-line camelcase
  const { owner_id } = req.record;

  // eslint-disable-next-line camelcase
  if (id === owner_id) return next();

  return res.status(403).json({ error: 'Forbidden' });
}

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const requireOwnerAuth = [requireAuthentication, catchErrors(addRecordToRequest), requireOwner];


module.exports = {
  addRecordToRequest,
  login,
  register,
  requireAuthentication,
  requireOwnerAuth,
};
