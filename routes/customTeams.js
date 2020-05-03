const express = require('express');

const router = express.Router();
const { requireAuthentication } = require('../utils/authenticate');
const { readAll, createTeam, patchTeam } = require('../db/queries');

async function getAllCustomTeams(req, res) {
  const squads = await readAll('teams', '', []);

  if (squads[0]) {
    return res.status(200).json(squads);
  }

  // Don't think we need this
  return res.status(404).json({ error: 'No Teams Found' });
}

async function getCustomTeamById(req, res) {
  const { id } = req.params;

  const conditions = 'WHERE id = $1';
  const squad = await readAll('teams', conditions, [id]);

  if (squad[0]) {
    return res.status(200).json(squad);
  }

  return res.status(404).json({ error: 'Team Not Found' });
}

async function createRoute(req, res) {
  const result = await createTeam(req.body);

  if (!result.success) {
    return res.status(400).json(result.validation);
  }

  return res.status(201).json(result.item);
}

async function patchRoute(req, res) {
  const { id } = req.params;

  const result = await patchTeam(id, req.body);

  if (!result.success) {
    if (result.notfound) {
      return res.status(404).json({ error: 'Team not found' });
    }

    return res.status(400).json(result.validation);
  }

  return res.status(201).json(result.item);
}

async function getAllMyTeams(req, res) {
  const { id } = req.params;

  const conditions = 'WHERE owner_id = $1';
  const squad = await readAll('teams', conditions, [id]);

  if (squad[0]) {
    return res.status(200).json(squad);
  }

  return res.status(404).json({ error: 'No Teams Found For User' });
}


function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', catchErrors(getAllCustomTeams));
router.get('/:id', catchErrors(getCustomTeamById));
router.post('/', requireAuthentication, catchErrors(createRoute));
router.patch('/:id', requireAuthentication, catchErrors(patchRoute));
router.get('/my-teams/:id', requireAuthentication, catchErrors(getAllMyTeams));

module.exports = router;
