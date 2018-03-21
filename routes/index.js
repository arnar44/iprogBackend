const express = require('express');
const { login } = require('../utils/authenticate');
const { createUser } = require('../db/queries');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function register(req, res) {
  const {
    username, name, password,
  } = req.body;

  const result = await createUser({ username, name, password });

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
    books: {
      books: '/books',
      book: '/book/{id}',
    },
    categories: '/categories',
    users: {
      users: '/users',
      user: '/users/{id}',
      read: '/users/{id}/read',
    },
    me: {
      me: '/users/me',
      profile: '/users/me/profile',
      read: '/users/me/read',
    },
  });
}

router.get('/', catchErrors(indexRoutes));
router.post('/register', catchErrors(register));
router.post('/login', catchErrors(login));

module.exports = router;
