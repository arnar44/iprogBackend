const validator = require('validator');

function validateBook({
  title, isbn13, author, description, category,
}) {
  const errors = [];

  // const stringPages = pages.toString();
  if (typeof title !== 'string' || !validator.isLength(title, { min: 1, max: 180 })) {
    errors.push({
      field: 'title',
      message: 'Title must be a string of length 1 to 100 characters',
    });
  }
  if (!isbn13 || Number.isNaN(isbn13) || !validator.isLength(isbn13, { min: 13, max: 13 })) {
    errors.push({
      field: 'isbn13',
      message: 'ISBN13 must be 13 digit string made of numbers',
    });
  }

  if (typeof category !== 'string' || !validator.isLength(category, { min: 1, max: 255 })) {
    errors.push({
      field: 'category',
      message: 'Category must be a valid category of type string',
    });
  }
  // Ekki krafa, en ef eitthvað slegið inn þá þarf hann að vera réttur
  if (author && typeof author !== 'string') {
    errors.push({
      field: 'author',
      message: 'Author must be of type string',
    });
  }
  // Ekki krafa, en ef eitthvað slegið inn þá þarf hann að vera réttur
  if (description && typeof description !== 'string') {
    errors.push({
      field: 'bio',
      message: 'Bio must be of type string',
    });
  }
  return errors;
}

function validateCategory(name) {
  const errors = [];
  if (typeof name !== 'string' || !validator.isLength(name, { min: 1, max: 30 })) {
    errors.push({
      field: 'name',
      message: 'Category name must be a string of length 1 to 30 characters',
    });
  }

  return errors;
}

function validateUser({
  username, password, name,
}) {
  const errors = [];

  if (!validator.isLength(username, { min: 3, max: 30 })) {
    errors.push({
      field: 'username',
      message: 'Username must be a string of length 3 to 30 characters',
    });
  }

  if (!validator.isLength(password, { min: 6, max: 30 })) {
    errors.push({
      field: 'password',
      message: 'Password must be a string of length 6 to 30 characters',
    });
  }

  if (!validator.isLength(name, { min: 0, max: 30 })) {
    errors.push({
      field: 'name',
      message: 'Name must be a string of length 1 to 255 characters',
    });
  }

  return errors;
}

function queryError(err, msg) {
  // 23505 er error kóði fyrir unique violation
  // 23503 er error kóði fyrir foreign key violation
  if (err.code === '23505' || err.code === '23503') {
    return {
      success: false,
      validation: [{ error: err.code }],
      item: '',
    };
  }
  // Ef það var ekki 23505 eða 23503 villa þá er það óþekkt villa sem við köstum
  console.error(msg, err);
  throw err;
}

module.exports = {
  validateBook,
  validateCategory,
  validateUser,
  queryError,
};
