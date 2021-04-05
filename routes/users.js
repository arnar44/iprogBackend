const express = require('express');
const { requireAuthentication } = require('../utils/authenticate');

const {
  getAllUsers,
  getUserById,
  patchUser,
} = require('../db/queries');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function getAllUsersRoute(req, res) {
  const { offset = 0, limit = 10 } = req.query;
  const url = req.get('host');

  const result = await getAllUsers(offset, limit, url);

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(200).json(result.item);
}

function isItMe(req, res, next) {
  const { id } = req.params;
  const { user } = req;
  if (id === 'me' || id === user.id) {
    return res.status(200).json(user);
  }
  return next();
}

async function getUserByIdRoute(req, res) {
  const { id } = req.params;

  const result = await getUserById(id);

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(200).json(result.item);
}

async function patchUserRoute(req, res) {
  const { user } = req;
  const { username, email, password } = req.body;

  const result = await patchUser({
    user, newUsername: username, newEmail: email, newPassword: password,
  });

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(200).json(result.item);
}

router.get('/', requireAuthentication, catchErrors(getAllUsersRoute));
router.get('/:id', requireAuthentication, isItMe, catchErrors(getUserByIdRoute));
router.patch('/me', requireAuthentication, catchErrors(patchUserRoute));

module.exports = router;
