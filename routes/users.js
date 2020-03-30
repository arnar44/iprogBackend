const express = require('express');
const { requireAuthentication } = require('../utils/authenticate');

const {
  patchMe,
  readUsers,
} = require('../db/queries');
const { getAll } = require('../utils/utils');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function userById(req, res) {
  const { id } = req.params;

  const conditions = 'WHERE id = $1';
  const result = await readUsers(conditions, [id]);

  if (result.error) {
    return res.status(400).json(result.error);
  }

  if (result.length === 0) {
    return res.status(404).json({ error: `User id: ${id} not found` });
  }

  return res.status(200).json(result);
}

function isItMe(req, res, next) {
  const { id } = req.params;
  if (id === 'me') {
    const { user } = req;
    return res.status(200).json(user);
  }
  return next();
}

// Fall sem kallar á readUsers til að lesa notendur
async function userRoute(req, res) {
  const result = await getAll(req, 'users');
  return res.json(result);
}

async function patchUser(req, res) {
  const result = await patchMe(req);

  if (!result.success) {
    const errorMsg = result.error
      ? res.status(400).json(result.error)
      : res.status(400).json(result.validation);
    return errorMsg;
  }

  return res.status(200).json(result.item);
}

router.get('/:id', requireAuthentication, isItMe, catchErrors(userById));
router.get('/', requireAuthentication, catchErrors(userRoute));
router.patch('/me', requireAuthentication, catchErrors(patchUser));

module.exports = router;
