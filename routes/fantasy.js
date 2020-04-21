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

function getGameWeek(events) {
  for (let i = 0; i < events.length; i += 1) {
    if (events[i].is_current) {
      return events[i];
    }
  }
  // If season over and none is true, return final week
  return events[events.length - 1];
}

function getPlayer(id, players) {
  for (let i = 0; i < players.length; i += 1) {
    if (players[i].id === id) {
      return {
        name: players[i].second_name,
        position: players[i].element_type,
      };
    }
  }

  return { name: 'not found', position: 'Not found' };
}

function processStatic(data, players) {
  return {
    data: {
      id: data.gameweek.id,
      name: data.gameweek.name,
      average_score: data.gameweek.average_entry_score,
      highest_score: data.gameweek.highest_score,
      chip_plays: [
        { name: 'Bench Boost', played: data.gameweek.chip_plays[0].num_played },
        { name: 'Free Hit', played: data.gameweek.chip_plays[1].num_played },
        { name: 'Wild Card', played: data.gameweek.chip_plays[2].num_played },
        { name: 'Triple Captain', played: data.gameweek.chip_plays[3].num_played },
      ],
      most_selected: getPlayer(data.gameweek.most_selected, players).name,
      most_transferred_in: getPlayer(data.gameweek.most_transferred_in, players).name,
      top_player: {
        name: getPlayer(data.gameweek.top_element, players).name,
        points: data.gameweek.top_element_info.points,
      },
      transfers_made: data.gameweek.transfers_made,
      most_captained: getPlayer(data.gameweek.most_captained, players).name,
      most_vice_captained: getPlayer(data.gameweek.most_vice_captained, players).name,
      total_players: data.total_players,
    },
  };
}

function getDT(data, players) {
  if (data.error) return { error: 'Dream team not found' };

  const dt = [];
  for (let i = 0; i < data.team.length; i += 1) {
    const p = getPlayer(data.team[i].element, players);
    dt.push({
      name: p.name,
      position: p.position,
      points: data.team[i].points,
    });
  }

  return {
    top_player: {
      name: getPlayer(data.top_player.id, players).name,
      points: data.top_player.points,
    },
    team: dt,
  };
}

async function get(url) {
  const response = await fetch(url);

  if (response.status < 200 || response.status > 299) {
    const status = response.status ? response.status : 500;
    const statusText = response.statusText ? response.statusText : 'Internal Server Error';
    return { code: status, error: statusText };
  }

  const result = await response.json();
  return result;
}

async function fetchStatic() {
  const result = await get('https://fantasy.premierleague.com/api/bootstrap-static/');
  if (result.error) return result;

  const gw = getGameWeek(result.events);
  const staticData = processStatic(
    { gameweek: gw, total_players: result.total_players },
    result.elements,
  );

  staticData.players = result.elements;
  staticData.timestamp = getDate();

  const dtResult = await get(`https://fantasy.premierleague.com/api/dream-team/${gw.id}`);
  staticData.dreamTeam = getDT(dtResult, result.elements);


  fs.writeFile('./static/staticFantasy.json', JSON.stringify(staticData), 'utf8', (err) => {
    if (err) console.error('Did not save static');
  });

  return staticData;
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
  // fetch dream team -> process and send as part of return

  return res.status(200).json([staticData.data, staticData.dreamTeam]);
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
