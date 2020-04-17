const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const {
  BUNDESLIGA_04_18,
  LALIGA_04_22,
  PREMIER_04_18,
  SERIEA_04_19,
} = require('./static');

const {
  BASE_URL_FOOTBALL_API: baseUrl,
  RAPID_API_KEY,
  RAPID_API_HOST,
  NODE_ENV,
} = process.env;

// Calls the scorebat API and returns the current higlights
async function listFixtures(req, res) {
  // TODO get
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
    { team: 'Bundesliga', data: jsonBundesliga.api },
    { team: 'La Liga', data: jsonLaLiga.api },
    { team: 'Premier League', data: jsonPrem.api },
    { team: 'Searie A', data: jsonSerieA.api },
  ]);
}


async function staticFixtures(req, res, next) {
  if (NODE_ENV !== 'static') {
    return next();
  }

  return res.status(200).json([
    { team: 'Bundesliga', data: BUNDESLIGA_04_18.api },
    { team: 'La Liga', data: LALIGA_04_22.api },
    { team: 'Premier League', data: PREMIER_04_18.api },
    { team: 'Searie A', data: SERIEA_04_19.api },
  ]);
}


function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}


router.get('/:date', staticFixtures, catchErrors(listFixtures));


module.exports = router;
