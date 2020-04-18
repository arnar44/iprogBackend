const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const {
  BUNDESLIGA_04_18,
  BUNDESLIGA_02_29,
  LALIGA_04_22,
  LALIGA_02_29,
  PREMIER_04_18,
  PREMIER_02_29,
  SERIEA_04_19,
  SERIEA_02_29
} = require('./static');

const {
  BASE_URL_FOOTBALL_API: baseUrl,
  RAPID_API_KEY,
  RAPID_API_HOST,
  NODE_ENV,
} = process.env;

// Calls the scorebat API and returns the current higlights
async function listFixtures(req, res) {
  const { date } = req.params;
  const apiKey = req.get('x-rapidapi-key');
  const apiHost = req.get('x-rapidapi-host');

  // Little security hihi 🚀
  if (RAPID_API_KEY !== apiKey || RAPID_API_HOST !== apiHost) {
    return res.status(401).json({ error: 'Invalid Api key' });
  }

  const bundesliga = new URL(`/v2/fixtures/league/754/${date}`, baseUrl);
  const laLiga = new URL(`/v2/fixtures/league/775/${date}`, baseUrl);
  const prem = new URL(`/v2/fixtures/league/524/${date}`, baseUrl);
  const serieA = new URL(`/v2/fixtures/league/891/${date}`, baseUrl);


  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    },
  };

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


async function staticFixtures(req, res, next) {
  if (NODE_ENV !== 'static') {
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


function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}


router.get('/:date', staticFixtures, catchErrors(listFixtures));


module.exports = router;
