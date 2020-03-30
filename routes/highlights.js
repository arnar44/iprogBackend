const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

function arrayToObject(array) {
  const res = array.reduce((obj, item) => {
    // eslint-disable-next-line no-param-reassign
    obj[item.title] = item;
    return obj;
  }, {});
  return res;
}

// Calls the scorebat API and returns the current higlights
async function higlightsRoute(req, res) {
  const url = 'https://www.scorebat.com/video-api/v1/';
  const response = await fetch(url);
  if (response.status < 200 || response.status > 299) {
    const status = response.status ? response.status : 500;
    const statusText = response.statusText ? response.statusText : 'Internal Server Error';
    return res.status(status).json({ error: statusText });
  }
  const result = await response.json();
  const toObj = arrayToObject(result);
  return res.status(200).json(toObj);
}

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', catchErrors(higlightsRoute));


module.exports = router;
