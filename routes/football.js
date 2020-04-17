const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const {
  BUNDESLIGA_04_18,
  LALIGA_04_22,
  PREMIER_04_18,
  SERIEA_04_19
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
  const apiHost = req.get('x-rapidapi-host')

  // Little security hihi 🚀
  if (RAPID_API_KEY !== apiKey || RAPID_API_HOST !== apiHost) {
    return res.status(401).json({ error: 'Invalid Api key' });
  }

  const bundesliga = new URL(`/v2/fixtures/league/754/${date}`, baseUrl);
  const laLiga = new URL(`/v2/fixtures/league/775/${date}`, baseUrl);
  const prem = new URL(`/v2/fixtures/league/524/${date}`, baseUrl);
  const serieA = new URL(`/v2/fixtures/league/891/${date}`, baseUrl);

  console.log(baseUrl, bundesliga);


  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
  }

  const [
    response_bundesliga,
    response_laLiga,
    response_prem,
    response_serieA
  ] = await Promise.all([
    fetch(bundesliga.href, options),
    fetch(laLiga.href, options),
    fetch(prem.href, options),
    fetch(serieA.href, options)
  ]);

  const [
    json_bundesliga,
    json_laLiga,
    json_prem,
    json_serieA
  ] = await Promise.all([
    response_bundesliga.json(),
    response_laLiga.json(),
    response_prem.json(),
    response_serieA.json()
  ]);

  res.status(200).json({
    bundesliga: json_bundesliga.api,
    laLiga: json_laLiga.api,
    prem: json_prem.api,
    serieA: json_serieA.api
  });
}


async function staticFixtures(req, res, next) {
  if (NODE_ENV !== 'static') {
    return next();
  }

  res.status(200).json({
    bundesliga: BUNDESLIGA_04_18.api,
    laLiga: LALIGA_04_22.api,
    prem: PREMIER_04_18.api,
    serieA: SERIEA_04_19.api
  });
}


function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}


router.get('/:date', staticFixtures, catchErrors(listFixtures));


module.exports = router;
