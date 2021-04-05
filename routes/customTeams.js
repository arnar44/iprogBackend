const express = require('express');

const router = express.Router();
const {
  addRecordToRequest,
  requireAuthentication,
  requireOwnerAuth,
} = require('../utils/authenticate');

const {
  createTeam,
  deleteRecordById,
  patchTeam,
  readAllRecords,
} = require('../db/queries');

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function getAllCustomTeams(req, res) {
  const result = await readAllRecords('teams', '', []);

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(200).json(result.item);
}

async function createRoute(req, res) {
  const { teamName, ownerName, lineup } = req.body;
  const { id } = req.user;

  const result = await createTeam({
    teamName, ownerName, lineup, id,
  });

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(201).json(result.item);
}

async function getCustomTeamById(req, res) {
  const { record } = req;

  if (!record) throw new Error('Article record to delete not found!');

  return res.status(200).json(req.record);
}

async function patchRoute(req, res) {
  const oldTeam = req.record;
  const {
    // eslint-disable-next-line camelcase
    team_name,
    lineup,
  } = req.body;

  const result = await patchTeam({ oldTeam, name: team_name, lineup });

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(200).json(result.item);
}

async function deleteRoute(req, res) {
  const { record } = req;

  if (!record) throw new Error('Team to delete not found!');

  const result = await deleteRecordById({ id: record.id, table: 'teams' });

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  delete req.record;

  return res.status(200).json(result.item);
}

async function getAllMyTeams(req, res) {
  const { id } = req.user;

  const result = await readAllRecords('teams', 'WHERE owner_id = $1', [id]);

  if (!result.success) {
    return res.status(result.code).json(result.obj);
  }

  return res.status(200).json(result.item);
}

router.get('/', catchErrors(getAllCustomTeams));
router.post('/', requireAuthentication, catchErrors(createRoute));
router.get('/:id', catchErrors(addRecordToRequest), catchErrors(getCustomTeamById));
router.patch('/:id', requireOwnerAuth, catchErrors(patchRoute));
router.delete('/:id', requireOwnerAuth, catchErrors(deleteRoute));
router.get('/my-teams/me', requireAuthentication, catchErrors(getAllMyTeams));


module.exports = router;
