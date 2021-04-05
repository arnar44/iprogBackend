const validator = require('validator');
const JsonValidator = require('jsonschema').Validator;

function validateTeam(teamName, stringLineup) {
  const errors = [];

  if (typeof teamName !== 'string' || !validator.isLength(teamName, { min: 1, max: 64 })) {
    errors.push({
      field: 'Team Name',
      message: 'Team name must be a string of length 1 to 64 characters',
    });
  }

  let lineup;
  try {
    lineup = JSON.parse(stringLineup);
  } catch (e) {
    errors.push({
      property: 'lineup',
      message: 'lineup not on correct format, cannot be turned into json object',
    });
    return errors;
  }

  const v = new JsonValidator();

  const formationSchema = {
    id: '/simpleFormation',
    type: 'object',
    properties: {
      gk: {
        type: 'array',
        items: { type: 'string' },
      },
      def: {
        type: 'array',
        items: { type: 'string' },
      },
      mid: {
        type: 'array',
        items: { type: 'string' },
      },
      att: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['gk', 'def', 'mid', 'att'],
  };

  const schema = {
    id: '/simpleLineup',
    type: 'object',
    properties: {
      value: { type: 'integer' },
      label: { type: 'string' },
      formation: { $ref: '/simpleFormation' },
      team: { type: 'object' },
    },
    required: ['value', 'label', 'formation', 'team'],
  };

  v.addSchema(formationSchema, '/simpleFormation');
  const result = v.validate(lineup, schema);

  return errors.concat(result.errors);
}

function validateUser({
  username, password, email,
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

  if (!validator.isEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Email must be a valid email',
    });
  }

  return errors;
}

module.exports = {
  validateTeam,
  validateUser,
};
