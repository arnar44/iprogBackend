/*
Endpoints:
https://fantasy.premierleague.com/api/bootstrap-static/
Events: gameweek events
game_settings: Fantasy game rules
phases: start stop of months + overall (rules)
total_players: ...
elements: players
elements_stats: labels for what players can do (rules)
element_types: types of players (gk, defender...) (rules)

Team history:
https://fantasy.premierleague.com/api/entry/{team_id}/history/

Dream Team:
https://fantasy.premierleague.com/api/dream-team/{week}

Leagues: (league ids found in entry (above))
https://fantasy.premierleague.com/api/leagues-classic/{league-id}/standings/
https://fantasy.premierleague.com/api/leagues-h2h/{league-id}/standings/

Authentication needed:
https://fantasy.premierleague.com/api/my-team/{team-id}/
- team info
https://fantasy.premierleague.com/api/entry/{team-id}/
- user info (+ leagues and status)
Transfers:
https://fantasy.premierleague.com/api/entry/{team-id}/transfers-latest/

User gögn:
    my team
        -transfer suggestions
    league status

Static gögn:
    Current dream team
    Current Gameweek
        -avrg points
        -highest-points
        -chips played
        -most-tranfered in
        -most-selected
        -top-player
            -points
*/

const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const router = express.Router();

const staticPath = './static/staticFantasy.json';

async function fetchStatic() {
  const bootstrapUrl = 'https://fantasy.premierleague.com/api/bootstrap-static/';
  const response = await fetch(bootstrapUrl);

  if (response.status < 200 || response.status > 299) {
    const status = response.status ? response.status : 500;
    const statusText = response.statusText ? response.statusText : 'Internal Server Error';
    return { code: status, error: statusText };
  }

  const result = await response.json();
  result.timestamp = Date.now();
  const jsonResult = JSON.stringify(result);

  fs.writeFile('./static/staticFantasy.json', jsonResult, 'utf8');

  return result;
}

function getBootstrap() {
  let fetchNew;
  let pData;
  try {
    const data = fs.readFileSync(staticPath);
    pData = JSON.parse(data);
    const timeDiff = parseInt((Date.now() - pData.timestamp) / (60 * 60 * 24 * 1000), 10);
    fetchNew = timeDiff >= 1;
  } catch (err) {
    fetchNew = true;
  }

  if (fetchNew) {
    pData = fetchStatic();
  }

  return pData;
}

// Returns fantasy data that we want but does not require authentication
async function staticFantasy(req, res) {
  const staticData = getBootstrap();
  if (staticData.error) {
    return res.status(staticData.status).json({ error: staticData.error });
  }

  // call some function here that processes static data (or do when we fetch and read)
  return res.status(200).json(staticData);
}


// Returns fantasy data that requires authentication
async function myFantasy(req, res) {

}

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', catchErrors(staticFantasy));
router.get('/my-fantasy', catchErrors(myFantasy));

module.exports = router;
