
// author controller

const Author = require('../models/author');
const Book = require('../models/book');

const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// export functions for each URL to be handled
// these are the callback functions to be used by router in a separate file

// show ALL Authors page
// OLD
// exports.author_list = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author List`);
// };
exports.author_list = (req, res, next) => {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec((err, list_authors) => {
      // if not successful
      if (err) { return next(err); }
      // if successful
      // render the author_list.pug template
      // passing title and author list values to the template
      res.render('author_list', {
        title: 'Author List',
        author_list: list_authors
      });
    });
};


// show Author DETAIL page
// OLD
// exports.author_detail = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author Detail: ${req.params.id}`);
// };
exports.author_detail = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.params.id)
        .exec(callback)
    },
    authors_books: (callback) => {
      Book.find({ 'author': req.params.id }, 'title summary')
        .exec(callback)
    }
  }, (err, results) => {
    // if error in API usage
    if (err) { return next(err); }
    // if no results are returned
    if (results.author === null) {
      let err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    // if successful
    // render the author_detail.pug template
    // passing title, author, author books values to the template
    res.render('author_detail', {
      title: 'Author Detail',
      author: results.author,
      author_books: results.authors_books
    });
  });
};


// show Author CREATE form (GET request)
// OLD
// exports.author_create_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author Create (GET)`);
// };
exports.author_create_get = (req, res, next) => {
  res.render('author_form', { title: 'Create Author' });
};
// handle Author CREATE form (POST request)
// OLD
// exports.author_create_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author Create (POST)`);
// };
exports.author_create_post = [
  // VALIDATE fields
  body('first_name')
    .isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
  // FYI two different ways to attach error message using express-validator
  // one as an argument - useful when one message can work with all checks performed
  // and one using the withMessage method - useful when each check needs a different message
  body('date_of_birth', 'Invalid date of birth.')
    .optional({ checkFalsy: true }).isISO8601(),
  body('date_of_death')
    .optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date of death.'),

  // SANITIZE fields
  sanitizeBody('first_name').trim().escape(),
  sanitizeBody('family_name').trim().escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);
    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array()
      });
      return;
    // if no errors
    } else {
      // create a new author object with escaped and trimmed data
      let author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });
      // save it, checking for DB errors
      author.save((err) => {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to its new detail page
        res.redirect(author.url);
      });
    }
  }
];


// show Author DELETE form (GET request)
// OLD
// exports.author_delete_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author Delete (GET)`);
// };
exports.author_delete_get = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.params.id).exec(callback);
    },
    authors_books: (callback) => {
      Book.find({ 'author': req.params.id }).exec(callback);
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    // if no results
    if (results.author === null) {
      res.redirect('/catalog/authors');
    }
    // if successful
    // render author_delete.pug template
    // passing title, author, author books values to the template
    res.render('author_delete', {
      title: 'Delete Author',
      author: results.author,
      author_books: results.authors_books
    });
  });
};
// handle Author DELETE form (POST request)
// OLD
// exports.author_delete_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author Delete (POST)`);
// };
exports.author_delete_post = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.body.authorid).exec(callback)
    },
    authors_books: (callback) => {
      Book.find({ 'author': req.body.authorid }).exec(callback)
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    if (results.authors_books.length > 0) {
      // if author has associated books
      // render author_delete.pug template
      // WITH ERROR MESSAGE
      // passing title, author, author books values to the template
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        author_books: results.authors_books
      });
    } else {
      // if author has no associated books
      // delete the author object and redirect to list of authors
      Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to author list
        res.redirect('/catalog/authors');
      });
    }
  });
};


// show Author UPDATE form (GET request)
// OLD
// exports.author_update_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author Update (GET)`);
// };
exports.author_update_get = (req, res, next) => {
  // get author data
  Author.findById(req.params.id, (err, author) => {
    // if not successful
    if (err) { return next(err); }
    // if no results
    if (author === null) {
      let err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    // if successful
    // render the author_form.pug template
    // passing title and author values to the template
    res.render('author_form', {
      title: 'Update Author',
      author: author
    });
  });
};
// handle Author UPDATE form (POST request)
// OLD
// exports.author_update_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author Update (POST)`);
// };
exports.author_update_post = [
  // VALIDATE fields
  body('first_name')
    .isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth.')
    .optional({ checkFalsy: true }).isISO8601(),
  body('date_of_death', 'Invalid date of death.')
    .optional({ checkFalsy: true }).isISO8601(),

  // SANITIZE fields
  sanitizeBody('first_name').trim().escape(),
  sanitizeBody('family_name').trim().escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);

    // create a new author object with escaped / trimmed data and the existing id
    let author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      // this is required or a new ID will be assigned!
      _id: req.params.id
    });

    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Update Author',
        author: author,
        errors: errors.array()
      });
      return;
    // if no errors
    // update record
    } else {
      Author.findByIdAndUpdate(req.params.id, author, {}, (err, theauthor) => {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to author detail page
        res.redirect(theauthor.url);
      });
    }
  }
];
