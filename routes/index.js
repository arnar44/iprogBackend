const express = require('express');
const { login } = require('../utils/authenticate');
const { createUser } = require('../db/queries');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function register(req, res) {
  const {
    username, email, password,
  } = req.body;

  const result = await createUser({ username, email, password });

  if (!result.success) {
    return res.status(400).json(result.validation);
  }

  return res.status(201).json(result.item);
}

async function indexRoutes(req, res) {
  return res.json({
    authentication: {
      register: '/register',
      login: '/login',
    },
    users: {
      users: '/users',
      user: '/users/{id}',
    },
    me: {
      me: '/users/me',
      profile: '/users/me/profile',
    },
    highlights: '/highlights',
    football: {
      fixtures: '/football/{YYYY-MM-DD}',
      statistic: '/football/fixture/statistics/{fixtureId}',
      event: 'football/fixture/events/{fixtureId}',
    },
    players: {
      squad: '/players/{id}',
    },
  });
}

router.get('/', catchErrors(indexRoutes));
router.post('/register', catchErrors(register));
router.post('/login', catchErrors(login));

module.exports = router;
