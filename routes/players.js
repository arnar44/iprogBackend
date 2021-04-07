const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const {
  catchErrors,
  checkRequestAndUpdate,
} = require('../utils/utils');

const staticIds = require('../static/static-ids.json');

const {
  bundesTeams,
  laligaTeams,
  premTeams,
  serieATeams,
} = require('../static/static-LeagueTeams');

const {
  Liverpool2020,
  Chelsea2020,
  RealMadrid2020,
} = require('../static/static-squads');

const {
  BASE_URL_FOOTBALL_API: baseUrl,
  RAPID_API_KEY,
  RAPID_API_HOST,
  DATABASE_ENVIRONMENT,
} = process.env;

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': RAPID_API_KEY,
    'x-rapidapi-host': RAPID_API_HOST,
  },
};

function sortTeams(arr) {
  return arr.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (b.name > a.name) return -1;
    return 0;
  });
}

function isNumeric(value) {
  return /^\d+$/.test(value);
}

async function allPlayers(req, res) {
  const { id } = req.params;

  if (!isNumeric(id)) {
    return res.status(400).json({ error: 'Invalid Team ID' });
  }

  const teamUrl = new URL(`/v2/players/squad/${id}/${staticIds.currSeason}`, baseUrl);
  const responseTeam = await fetch(teamUrl.href, options);
  const jsonTeam = await responseTeam.json();

  if (!jsonTeam || !jsonTeam.api || !jsonTeam.api.players) {
    return res.status(500).json({ error: 'Error communicating with rapid api' });
  }

  if (jsonTeam.api.players.length === 0) {
    return res.status(404).json({ error: 'Team not found' });
  }

  return res.status(200).json([jsonTeam]);
}

async function leagueTeamMap(req, res) {
  const premUrl = new URL(`/v2/teams/league/${staticIds.premId}`, baseUrl);
  const bundesUrl = new URL(`/v2/teams/league/${staticIds.bundesligaId}`, baseUrl);
  const laligaUrl = new URL(`/v2/teams/league/${staticIds.laligaId}`, baseUrl);
  const serieAUrl = new URL(`/v2/teams/league/${staticIds.serieAId}`, baseUrl);

  const [
    resPrem,
    resBundes,
    resLaliga,
    resSerieA,
  ] = await Promise.all([
    fetch(premUrl.href, options),
    fetch(bundesUrl.href, options),
    fetch(laligaUrl.href, options),
    fetch(serieAUrl.href, options),
  ]);

  const [
    jsonPrem,
    jsonBundes,
    jsonLaliga,
    jsonSerieA,
  ] = await Promise.all([
    resPrem.json(),
    resBundes.json(),
    resLaliga.json(),
    resSerieA.json(),
  ]);

  const sortedPrem = sortTeams(jsonPrem.api.teams);
  const sortedBundes = sortTeams(jsonBundes.api.teams);
  const sortedSerieA = sortTeams(jsonSerieA.api.teams);
  const sortedLaLiga = sortTeams(jsonLaliga.api.teams);

  return res.status(200).json([
    { title: 'Premier League', teams: sortedPrem },
    { title: 'Bundesliga', teams: sortedBundes },
    { title: 'Serie A', teams: sortedSerieA },
    { title: 'LaLiga', teams: sortedLaLiga },
  ]);
}

function staticPlayers(req, res, next) {
  if (DATABASE_ENVIRONMENT !== 'development' && !req.static) {
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

function staticTeamMap(req, res, next) {
  if (DATABASE_ENVIRONMENT !== 'development' && !req.static) {
    return next();
  }

  const sortedPrem = sortTeams(premTeams.api.teams);
  const sortedBundes = sortTeams(bundesTeams.api.teams);
  const sortedSerieA = sortTeams(serieATeams.api.teams);
  const sortedLaLiga = sortTeams(laligaTeams.api.teams);


  return res.status(200).json([
    { title: 'Premier League', teams: sortedPrem },
    { title: 'Bundesliga', teams: sortedBundes },
    { title: 'Serie A', teams: sortedSerieA },
    { title: 'LaLiga', teams: sortedLaLiga },
  ]);
}

router.get('/', checkRequestAndUpdate, staticTeamMap, catchErrors(leagueTeamMap));
router.get('/:id', checkRequestAndUpdate, staticPlayers, catchErrors(allPlayers));

module.exports = router;
