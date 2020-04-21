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

function getDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function shouldFetch(d2) {
  const d1 = getDate();
  const d1Split = d1.split('/');
  const d2Split = d2.split('/');
  if (parseInt(d1Split[2], 10) < parseInt(d2Split[2], 10)) return true;
  if (parseInt(d1Split[1], 10) < parseInt(d2Split[1], 10)) return true;
  if (parseInt(d1Split[0], 10) < parseInt(d2Split[0], 10)) return true;
  return false;
}

async function fetchStatic() {
  const bootstrapUrl = 'https://fantasy.premierleague.com/api/bootstrap-static/';
  const response = await fetch(bootstrapUrl);

  if (response.status < 200 || response.status > 299) {
    const status = response.status ? response.status : 500;
    const statusText = response.statusText ? response.statusText : 'Internal Server Error';
    return { code: status, error: statusText };
  }

  const result = await response.json();

  const filteredRes = {
    events: result.events,
    total_players: result.total_players,
    players: result.elements,
    player_types: result.element_types,
    timestamp: getDate(),
  };

  const jsonResult = JSON.stringify(filteredRes);

  fs.writeFile('./static/staticFantasy.json', jsonResult, 'utf8', (err) => {
    if (err) console.error('Did not save static');
  });

  return result;
}

function getBootstrap() {
  let fetchNew;
  let pData;
  try {
    const data = fs.readFileSync(staticPath);
    pData = JSON.parse(data);
    fetchNew = shouldFetch(pData.timestamp);
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

  // get current gameweek stats

  return res.status(200).json({});
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
