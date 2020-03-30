const validator = require('validator');

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
  queryError,
};
