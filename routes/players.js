const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const { currSeason } = require('../static/static-ids');

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
  bundesligaId,
  laligaId,
  premId,
  serieAId,
} = require('../static/static-ids');

const {
  BASE_URL_FOOTBALL_API: baseUrl,
  RAPID_API_KEY,
  RAPID_API_HOST,
  NODE_ENV,
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

  const teamUrl = new URL(`/v2/players/squad/${id}/${currSeason}`, baseUrl);
  const responseTeam = await fetch(teamUrl.href, options);
  const jsonTeam = await responseTeam.json();

  return res.status(200).json([jsonTeam]);
}

async function leagueTeamMap(req, res) {
  const premUrl = new URL(`/v2/teams/league/${premId}`, baseUrl);
  const bundesUrl = new URL(`/v2/teams/league/${bundesligaId}`, baseUrl);
  const laligaUrl = new URL(`/v2/teams/league/${laligaId}`, baseUrl);
  const serieAUrl = new URL(`/v2/teams/league/${serieAId}`, baseUrl);

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

function staticTeamMap(req, res, next) {
  if (NODE_ENV !== 'static') {
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


function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function requestCheck(req, res, next) {
  const apiKey = req.get('x-rapidapi-key');
  const apiHost = req.get('x-rapidapi-host');

  if (RAPID_API_KEY !== apiKey || RAPID_API_HOST !== apiHost) {
    return res.status(401).json({ error: 'Invalid Api key' });
  }

  return next();
}


router.get('/', staticTeamMap, requestCheck, catchErrors(leagueTeamMap));
router.get('/:id', staticPlayers, requestCheck, catchErrors(allPlayers));

module.exports = router;
