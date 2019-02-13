
// genre controller

const Genre = require('../models/genre');
const Book = require('../models/book');

const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// export functions for each URL to be handled
// these are the callback functions to be used by router in a separate file

// show ALL Genre page
// OLD
// exports.genre_list = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre List`);
// };
exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, list_genres) => {
      // if not successful
      if (err) { return next(err); }
      // if successful
      // render the genre_list.pug template
      // passing title and genre list values to the template
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genres
      });
    });
};


// show Genre DETAIL page
// OLD
// exports.genre_detail = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre Detail: ${req.params.id}`);
// };
exports.genre_detail = (req, res, next) => {
  async.parallel({
    genre: (callback) => {
      Genre.findById(req.params.id)
        .exec(callback);
    },
    genre_books: (callback) => {
      Book.find({ 'genre': req.params.id })
        .exec(callback);
    }
  }, (err, results) => {
    // if error in API usage
    if (err) { return next(err) }
    // if no results are returned
    if (results.genre === null) {
      let err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    // if successful
    // render the genre_detail.pug template
    // passing title, genre, and genre books values to the template
    res.render('genre_detail', {
      title: 'Genre Detail',
      genre: results.genre,
      genre_books: results.genre_books
    });
  });
};


// show Genre CREATE form (GET request)
// OLD
// exports.genre_create_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre Create (GET)`);
// };
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', { title: 'Create New Genre' });
};
// handle Genre CREATE form submit (POST request) with VALIDATION and SANITIZATION
// OLD
// exports.genre_create_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre Create (POST)`);
// };
exports.genre_create_post = [
  // VALIDATE field
  // name field is not empty
  body('name')
    .isLength({ min: 1 }).trim().withMessage('A Genre name is required.'),

  // SANITIZE field
  // trim and escape name field
  sanitizeBody('name').trim().escape(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);
    // create a new genre object with escaped and trimmed data
    let genre = new Genre({
      name: req.body.name
    });
    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array()
      });
      return;
    // if no errors
    } else {
      // check if genre already exists
      Genre.findOne({ name: req.body.name })
        .exec((err, found_genre) => {
          // if not successful
          if (err) { return next(err); }
          // if genre exists
          if (found_genre) {
            // genre already exists, redirect to its detail page
            res.redirect(found_genre.url);
          // if genre does not exist
          } else {
            // save it, checking for DB errors
            genre.save((err) => {
              // if not successful
              if (err) { return next(err); }
              // if successful
              // redirect to its new detail page
              res.redirect(genre.url);
            });
          }
        })
    }
  }
];


// show Genre DELETE form (GET request)
// OLD
// exports.genre_delete_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre Delete (GET)`);
// };
exports.genre_delete_get = (req, res, next) => {
  async.parallel({
    genre: (callback) => {
      Genre.findById(req.params.id).exec(callback);
    },
    genres_books: (callback) => {
      Book.find({ 'genre': req.params.id }).exec(callback);
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    // if no results
    if (results.genre === null) {
      res.redirect('/catalog/genres');
    }
    // if successful
    // render genre_delete.pug template
    // passing title, genre, genres books values to the template
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: results.genre,
      genre_books: results.genres_books
    });
  });
};
// handle Genre DELETE form (POST request)
// OLD
// exports.genre_delete_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre Delete (POST)`);
// };
exports.genre_delete_post = (req, res, next) => {
  async.parallel({
    genre: (callback) => {
      Genre.findById(req.params.genreid).exec(callback);
    },
    genres_books: (callback) => {
      Book.find({ 'genre': req.params.genreid }).exec(callback);
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    if (results.genres_books.length > 0) {
      // if genre has associated books
      // re-render genre_delete.pug template
      // WITH ERROR MESSAGE
      // passing title, genre, genre books values to the template
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genres_books
      });
    } else {
      // if genre has no associated books
      // delete the genre object and redirect to list of genres
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to genre list
        res.redirect('/catalog/genres');
      });
    }
  });
};


// show Genre UPDATE form (GET request)
// OLD
// exports.genre_update_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre Update (GET)`);
// };
exports.genre_update_get = (req, res, next) => {
  // get genre data
  Genre.findById(req.params.id, (err, genre) => {
    // if not successful
    if (err) { return next(err); }
    // if no results
    if (genre === null) {
      let err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    // if successful
    // render the genre_form.pug template
    // passing title and genre values to the template
    res.render('genre_form', {
      title: 'Update Genre',
      genre: genre
    });
  });
};
// handle Genre UPDATE form (POST request)
// OLD
// exports.genre_update_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Genre Update (POST)`);
// };
exports.genre_update_post = [
  // VALIDATE fields
  body('name')
    .isLength({ min: 1 }).trim().withMessage('A Genre name is required.'),

  // SANITIZE fields
  sanitizeBody('name').trim().escape(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);

    // create a new genre object with escaped / trimmed data and the existing id
    let genre = new Genre({
      name: req.body.name,
      // this is required or a new ID will be assigned!
      _id: req.params.id
    });

    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Update Genre',
        genre: genre,
        errors: errors.array()
      });
      return;
    // if no errors
    // update record
    } else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, thegenre) => {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to genre detail page
        res.redirect(thegenre.url);
      });
    }
  }
];
