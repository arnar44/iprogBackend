const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

// Calls the scorebat API and returns the current higlights
async function footballRoute() {

}

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', catchErrors(footballRoute));


module.exports = router;
