// https://api-football-v1.p.rapidapi.com/v2/events/157293
const EVENTS_157293 = {
    "api": {
        "results": 9,
        "events": [
            {
                "elapsed": 37,
                "elapsed_plus": null,
                "team_id": 38,
                "teamName": "Watford",
                "player_id": 18809,
                "player": "Deulofeu",
                "assist_id": 2475,
                "assist": "R. Pereyra",
                "type": "subst",
                "detail": "R. Pereyra",
                "comments": null
            },
            {
                "elapsed": 54,
                "elapsed_plus": null,
                "team_id": 38,
                "teamName": "Watford",
                "player_id": 2218,
                "player": "I. Sarr",
                "assist_id": 18805,
                "assist": "A. Doucouré",
                "type": "Goal",
                "detail": "Normal Goal",
                "comments": null
            },
            {
                "elapsed": 60,
                "elapsed_plus": null,
                "team_id": 38,
                "teamName": "Watford",
                "player_id": 2218,
                "player": "I. Sarr",
                "assist_id": 18808,
                "assist": "T. Deeney",
                "type": "Goal",
                "detail": "Normal Goal",
                "comments": null
            },
            {
                "elapsed": 61,
                "elapsed_plus": null,
                "team_id": 40,
                "teamName": "Liverpool",
                "player_id": 300,
                "player": "G. Wijnaldum",
                "assist_id": 295,
                "assist": "A. Lallana",
                "type": "subst",
                "detail": "A. Lallana",
                "comments": null
            },
            {
                "elapsed": 65,
                "elapsed_plus": null,
                "team_id": 40,
                "teamName": "Liverpool",
                "player_id": 297,
                "player": "A. Oxlade-Chamberlain",
                "assist_id": 305,
                "assist": "D. Origi",
                "type": "subst",
                "detail": "D. Origi",
                "comments": null
            },
            {
                "elapsed": 72,
                "elapsed_plus": null,
                "team_id": 38,
                "teamName": "Watford",
                "player_id": 18808,
                "player": "T. Deeney",
                "assist_id": 2218,
                "assist": "I. Sarr",
                "type": "Goal",
                "detail": "Normal Goal",
                "comments": null
            },
            {
                "elapsed": 79,
                "elapsed_plus": null,
                "team_id": 40,
                "teamName": "Liverpool",
                "player_id": 302,
                "player": "Roberto Firmino",
                "assist_id": 1101,
                "assist": "T. Minamino",
                "type": "subst",
                "detail": "T. Minamino",
                "comments": null
            },
            {
                "elapsed": 82,
                "elapsed_plus": null,
                "team_id": 38,
                "teamName": "Watford",
                "player_id": 2218,
                "player": "I. Sarr",
                "assist_id": 30812,
                "assist": "I. Pussetto",
                "type": "subst",
                "detail": "I. Pussetto",
                "comments": null
            },
            {
                "elapsed": 89,
                "elapsed_plus": null,
                "team_id": 38,
                "teamName": "Watford",
                "player_id": 18805,
                "player": "A. Doucouré",
                "assist_id": 18803,
                "assist": "N. Chalobah",
                "type": "subst",
                "detail": "N. Chalobah",
                "comments": null
            }
        ]
    }
}

// https://api-football-v1.p.rapidapi.com/v2/statistics/fixture/157293
const STATS_157293 = {
    "api": {
        "results": 16,
        "statistics": {
            "Shots on Goal": {
                "home": "5",
                "away": "1"
            },
            "Shots off Goal": {
                "home": "7",
                "away": "4"
            },
            "Total Shots": {
                "home": "14",
                "away": "7"
            },
            "Blocked Shots": {
                "home": "2",
                "away": "2"
            },
            "Shots insidebox": {
                "home": "10",
                "away": "2"
            },
            "Shots outsidebox": {
                "home": "4",
                "away": "5"
            },
            "Fouls": {
                "home": "4",
                "away": "8"
            },
            "Corner Kicks": {
                "home": "3",
                "away": "5"
            },
            "Offsides": {
                "home": "5",
                "away": "1"
            },
            "Ball Possession": {
                "home": "29%",
                "away": "71%"
            },
            "Yellow Cards": {
                "home": null,
                "away": null
            },
            "Red Cards": {
                "home": null,
                "away": null
            },
            "Goalkeeper Saves": {
                "home": "1",
                "away": "2"
            },
            "Total passes": {
                "home": "300",
                "away": "730"
            },
            "Passes accurate": {
                "home": "197",
                "away": "618"
            },
            "Passes %": {
                "home": "66%",
                "away": "85%"
            }
        }
    }
}

module.exports = {
    EVENTS_157293,
    STATS_157293,
}
