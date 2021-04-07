const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const {
  catchErrors,
  checkRequestAndUpdate,
} = require('../utils/utils');

const {
  BUNDESLIGA_04_18,
  BUNDESLIGA_02_29,
  LALIGA_04_22,
  LALIGA_02_29,
  PREMIER_04_18,
  PREMIER_02_29,
  SERIEA_04_19,
  SERIEA_02_29,
} = require('../static/static-fixtures');

const { EVENTS_157293, STATS_157293 } = require('../static/static-details');

const staticIds = require('../static/static-ids.json');

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

async function listFixtures(req, res) {
  const { date } = req.params;

  const bundesliga = new URL(`/v2/fixtures/league/${staticIds.bundesligaId}/${date}`, baseUrl);
  const laLiga = new URL(`/v2/fixtures/league/${staticIds.laligaId}/${date}`, baseUrl);
  const prem = new URL(`/v2/fixtures/league/${staticIds.premId}/${date}`, baseUrl);
  const serieA = new URL(`/v2/fixtures/league/${staticIds.serieAId}/${date}`, baseUrl);

  const [
    responseBundesliga,
    responseLaLiga,
    responsePrem,
    responseSerieA,
  ] = await Promise.all([
    fetch(bundesliga.href, options),
    fetch(laLiga.href, options),
    fetch(prem.href, options),
    fetch(serieA.href, options),
  ]);

  const [
    jsonBundesliga,
    jsonLaLiga,
    jsonPrem,
    jsonSerieA,
  ] = await Promise.all([
    responseBundesliga.json(),
    responseLaLiga.json(),
    responsePrem.json(),
    responseSerieA.json(),
  ]);

  return res.status(200).json([
    { title: 'Bundesliga', data: jsonBundesliga.api },
    { title: 'La Liga', data: jsonLaLiga.api },
    { title: 'Premier League', data: jsonPrem.api },
    { title: 'Searie A', data: jsonSerieA.api },
  ]);
}

async function fixtureEvents(req, res) {
  const { id } = req.params;

  const url = new URL(`/v2/events/${id}`, baseUrl);

  const response = await fetch(url.href, options);
  const json = await response.json();

  return res.status(200).json({ data: json.api });
}

async function fixtureStats(req, res) {
  const { id } = req.params;

  const urlFixture = new URL(`/v2/statistics/fixture/${id}`, baseUrl);

  const response = await fetch(urlFixture.href, options);
  const json = await response.json();

  return res.status(200).json({ data: json.api });
}

function staticFixtures(req, res, next) {
  if (DATABASE_ENVIRONMENT !== 'development' && !req.static) {
    return next();
  }

  const { date } = req.params;

  if (date === 'OLD') {
    return res.status(200).json([
      { title: 'Bundesliga', data: BUNDESLIGA_02_29.api },
      { title: 'La Liga', data: LALIGA_02_29.api },
      { title: 'Premier League', data: PREMIER_02_29.api },
      { title: 'Searie A', data: SERIEA_02_29.api },
    ]);
  }

  return res.status(200).json([
    { title: 'Bundesliga', data: BUNDESLIGA_04_18.api },
    { title: 'La Liga', data: LALIGA_04_22.api },
    { title: 'Premier League', data: PREMIER_04_18.api },
    { title: 'Searie A', data: SERIEA_04_19.api },
  ]);
}

function staticEvents(req, res, next) {
  if (DATABASE_ENVIRONMENT !== 'development' && !req.static) {
    return next();
  }

  return res.status(200).json({ data: EVENTS_157293.api });
}

function staticStats(req, res, next) {
  if (DATABASE_ENVIRONMENT !== 'development' && !req.static) {
    return next();
  }

  return res.status(200).json({ data: STATS_157293.api });
}

router.get('/:date', checkRequestAndUpdate, staticFixtures, catchErrors(listFixtures));
router.get('/fixture/events/:id', checkRequestAndUpdate, staticEvents, catchErrors(fixtureEvents));
router.get('/fixture/statistics/:id', checkRequestAndUpdate, staticStats, catchErrors(fixtureStats));

module.exports = router;
