const express = require('express');
const { login, register } = require('../utils/authenticate');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
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
