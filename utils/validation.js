const validator = require('validator');

function validateTeam({ teamName, team }) {
  const errors = [];

  if (typeof teamName !== 'string' || !validator.isLength(teamName, { min: 1, max: 64 })) {
    errors.push({
      field: 'Team Name',
      message: 'Team name must be a string of length 1 to 64 characters',
    });
  }

  if (!team.label) {
    errors.push({
      field: 'Team label',
      message: 'Team must have a formation label',
    });
  }

  // eslint-disable-next-line max-len
  if (!team.formation || !team.formation.gk || !team.formation.def || !team.formation.mid || !team.formation.att) {
    errors.push({
      field: 'Team formation',
      message: 'Team must contain formation and postions for gk, def, mid and att',
    });
  }

  if (!team.team || Object.keys(team.team).length !== 11) {
    errors.push({
      field: 'Team players',
      message: 'Team must contain team object with 11 players',
    });
  }

  return errors;
}

function validateUser({
  username, password, name,
}) {
  const errors = [];

  if (typeof username !== 'string' || !validator.isLength(username, { min: 3, max: 30 })) {
    errors.push({
      field: 'username',
      message: 'Username must be a string of length 3 to 30 characters',
    });
  }

  if (typeof password !== 'string' || !validator.isLength(password, { min: 6, max: 30 })) {
    errors.push({
      field: 'password',
      message: 'Password must be a string of length 6 to 30 characters',
    });
  }

  if (typeof name !== 'string' || !validator.isLength(name, { min: 1, max: 100 })) {
    errors.push({
      field: 'name',
      message: 'Name must be a string of length 1 to 100 characters',
    });
  }

  return errors;
}


function queryError(err, msg) {
  console.error(msg, err);
  return {
    success: false,
    validation: [{ error: err }],
    item: '',
  };
}

module.exports = {
  validateUser,
  validateTeam,
  queryError,
};
