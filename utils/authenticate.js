const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const {
  findByUsername,
  getUserById,
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

  if (!result.success || !result.id) {
    return done(null, false);
  }

  return done(done, result);
}

passport.use(new Strategy(jwtOptions, verify));
auth.use(passport.initialize());

async function comparePasswords(hash, password) {
  const result = await bcrypt.compare(hash, password);

  return result;
}

async function login(req, res) {
  const { username, password } = req.body;
  const userAll = await findByUsername(username);

  if (!userAll) {
    return res.status(401).json({ error: 'No such user' });
  }

  const passwordIsCorrect = await comparePasswords(password, userAll.password);

  if (passwordIsCorrect) {
    const payload = { id: userAll.id };
    const tokenOptions = { expiresIn: parseInt(tokenLifetime, 10) };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);

    const user = {
      id: userAll.id,
      username: userAll.username,
      email: userAll.email,
    };

    return res.json({ token, user });
  }

  return res.status(401).json({ error: 'Invalid password' });
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

module.exports = {
  login,
  requireAuthentication,
};
