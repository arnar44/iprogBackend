require('dotenv').config();

const express = require('express');

const index = require('./routes/index');
const users = require('./routes/users');
const highlights = require('./routes/highlights');
const fantasy = require('./routes/fantasy');
const football = require('./routes/football');
const players = require('./routes/players');
const customTeams = require('./routes/customTeams');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-rapidapi-key, x-rapidapi-host');
  next();
});

app.use('/', index);
app.use('/users', users);
app.use('/highlights', highlights);
app.use('/fantasy', fantasy);
app.use('/football', football);
app.use('/players', players);
app.use('/custom-teams', customTeams);

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

app.use(notFoundHandler);
app.use(errorHandler);

const {
  PORT: port = 3000,
  HOST: host = '127.0.0.1',
} = process.env;

app.listen(port, () => {
  console.info(`Server running at http://${host}:${port}/`);
});
