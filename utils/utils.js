const fs = require('fs');
const fetch = require('node-fetch');

const staticIds = require('../static/static-ids.json');

const {
  BASE_URL_FOOTBALL_API: baseUrl,
  RAPID_API_KEY,
  RAPID_API_HOST,
} = process.env;

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': RAPID_API_KEY,
    'x-rapidapi-host': RAPID_API_HOST,
  },
};

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function requestCheck(req, res, next) {
  const apiKey = req.get('x-rapidapi-key');
  const apiHost = req.get('x-rapidapi-host');

  if (RAPID_API_KEY !== apiKey || RAPID_API_HOST !== apiHost) {
    req.static = true;
  }

  return next();
}

async function updateStaticRoute(req, res, next) {
  if (req.static) {
    return next();
  }

  const { lastUpdate } = staticIds;

  const splitDate = lastUpdate.split('/');
  const updateMonth = Number(splitDate[0]);
  const updateYear = Number(splitDate[1]);

  const today = new Date();
  const currMonth = today.getMonth() + 1;
  const currYear = today.getFullYear();

  // Update static data
  if (currYear > updateYear || (currMonth >= 7 && updateMonth < 7)) {
    const premUrl = new URL('/v2/leagues/current/', baseUrl);
    const resPrem = await fetch(premUrl.href, options);
    const jsonPrem = await resPrem.json();

    const { leagues } = jsonPrem.api;

    const f1 = ['Premier League', 'Bundesliga 1', 'Primera Division', 'Serie A'];
    const f2 = ['England', 'Germany', 'Spain', 'Italy'];

    const result = leagues
      .filter((obj) => f1.includes(obj.name) && f2.includes(obj.country))
      .reduce((obj, item) => {
        const newObj = obj;
        newObj[item.country] = item.league_id;
        return newObj;
      }, {});

    const foundAll = 'England' in result && 'Germany' in result && 'Spain' in result && 'Italy' in result;

    if (!foundAll) {
      console.error('Error updating static league ids - Not all ids founds');
      req.static = true;
      return next();
    }

    const startYear = currMonth > 6 ? currYear : currYear - 1;
    const endYear = startYear < currYear ? currYear : currYear + 1;


    const staticCodes = {
      bundesligaId: result.Germany,
      laligaId: result.Spain,
      premId: result.England,
      serieAId: result.Italy,
      currSeason: `${startYear}-${endYear}`,
      lastUpdate: `${today.getMonth() + 1}/${today.getFullYear()}`,
    };

    const json = JSON.stringify(staticCodes);
    try {
      fs.writeFileSync('static/static-ids.json', json, 'utf8');
    } catch (err) {
      console.error('Error updating static league ids - Could not write static ids');
      req.static = true;
    }
  }

  return next();
}

const checkRequestAndUpdate = [requestCheck, catchErrors(updateStaticRoute)];

module.exports = {
  catchErrors,
  checkRequestAndUpdate,
};
