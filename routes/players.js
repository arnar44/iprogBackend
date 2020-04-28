const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const router = express.Router();

const { currSeason } = require('../static/static-ids');

const {
  Liverpool2020,
  Chelsea2020,
  RealMadrid2020,
} = require('../static/static-squads');

const {
  BASE_URL_FOOTBALL_API: baseUrl,
  RAPID_API_KEY,
  RAPID_API_HOST,
  NODE_ENV,
} = process.env;

function isNumeric(value) {
  return /^\d+$/.test(value);
}

async function allPlayers(req, res) {
  const { id } = req.params;
  const apiKey = req.get('x-rapidapi-key');
  const apiHost = req.get('x-rapidapi-host');

  if (!isNumeric(id)) {
    return res.status(400).json({ error: 'Invalid Team ID' });
  }

  if (RAPID_API_KEY !== apiKey || RAPID_API_HOST !== apiHost) {
    return res.status(401).json({ error: 'Invalid Api key' });
  }

  const teamUrl = new URL(`/v2/players/squad/${id}/${currSeason}`, baseUrl);

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    },
  };

  const responseTeam = await fetch(teamUrl.href, options);
  const jsonTeam = await responseTeam.json();

  return res.status(200).json([jsonTeam]);
}


function staticPlayers(req, res, next) {
  if (NODE_ENV !== 'static') {
    return next();
  }

  const { id } = req.params;

  if (id < 100) {
    return res.status(200).json([Liverpool2020]);
  }
  if (id < 200) {
    return res.status(200).json([Chelsea2020]);
  }

  return res.status(200).json([RealMadrid2020]);
}


function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/:id', staticPlayers, catchErrors(allPlayers));

module.exports = router;
