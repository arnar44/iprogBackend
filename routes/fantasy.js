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

const router = express.Router();

// Calls the scorebat API and returns the current higlights
async function staticFantasy(req, res) {

}

async function myFantasy(req, res) {

}

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', catchErrors(staticFantasy));
router.get('/my-fantasy', catchErrors(myFantasy));

module.exports = router;
