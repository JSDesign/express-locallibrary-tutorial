
// book controller

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookInstance');

const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// NOTE: use the async 'parallel' method here to pass an object with
// functions for getting the counts for each model
// these functions are all started at the same time
// when ALL of them have completed, the final callback is invoked
// with the counts in the 'results' parameter
// (or an error in the err parameter)

// NOTE: use the mongoosejs 'countDocuments' method here to get the number
// of instances of each model: the first argument is an optional set of
// conditions to match against and the second argument is a callback
// we simply pass an empty object as the match condition to find all
// documents of a collection

// NOTE: The callback function from async.parallel() above is a little
// unusual in that we render the page whether or not there was an error
// (normally you might use a separate execution path for handling
// the display of errors).


// export functions for each URL to be handled
// these are the callback functions to be used by router in a separate file

// NOTE: this controller exports a special `index()` function
// to show the site welcome (index) page
exports.index = (req, res) => {
  async.parallel({
    book_count: (callback) => {
      Book.countDocuments({}, callback);
    },
    book_instance_count: (callback) => {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: (callback) => {
      BookInstance.countDocuments({ status: 'Available' }, callback);
    },
    author_count: (callback) => {
      Author.countDocuments({}, callback);
    },
    genre_count: (callback) => {
      Genre.countDocuments({}, callback);
    }
  }, (err, results) => {
    res.render('index', {
      title: 'Local Library Home',
      error: err,
      data: results
    });
  });
}


// show ALL Books
// OLD
// exports.book_list = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book List`);
// };
exports.book_list = (req, res, next) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec((err, list_books) => {
      // if not successful
      if (err) { return next(err); }
      // if successful
      // render the book list .pug template
      // passing title and book list values to the template
      res.render('book_list', {
        title: 'Book List',
        book_list: list_books
      });
    });
};


// show Book DETAIL page
// OLD
// exports.book_detail = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Detail: ${req.params.id}`);
// };
exports.book_detail = (req, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: (callback) => {
      BookInstance.find({ 'book': req.params.id })
        .exec(callback)
    }
  }, (err, results) => {
    // if error in API usage
    if (err) { return next(err) }
    // if no results are returned
    if (results.book === null) {
      let err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // if successful
    // render the book_detail.pug template
    // passing title, book, book instances values to the template
    res.render('book_detail', {
      title: 'Title',
      book: results.book,
      book_instances: results.book_instance
    });
  });
};


// show Book CREATE form (GET request)
// OLD
// exports.book_create_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Create (GET)`);
// };
exports.book_create_get = (req, res, next) => {
  // get authors and genres to add to new book record
  async.parallel({
    authors: (callback) => {
      Author.find(callback);
    },
    genres: (callback) => {
      Genre.find(callback);
    }
  }, (err, results) => {
    // if error in API usage
    if (err) { return next(err); }
    // if successful
    // render the book_form.pug template
    // passing title, authors, genres values to the template
    res.render('book_form', {
      title: 'Create Book',
      authors: results.authors,
      genres: results.genres
    });
  });
};
// handle Book CREATE form (POST request)
// OLD
// exports.book_create_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Create (POST)`);
// };
exports.book_create_post = [
  // first convert received genre(s) to an array
  // for sanitizing each in the next step
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  // VALIDATE fields
  body('title', 'Title must be specified.')
    .isLength({ min: 1 }).trim(),
  body('author', 'Author must be specified.')
    .isLength({ min: 1 }).trim(),
  body('summary', 'Summary must be specified.')
    .isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must be specified.')
    .isLength({ min: 1 }).trim(),

  // SANITIZE fields (using wildcard)
  sanitizeBody('*')
    .trim().escape(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);

    // create a new book object with escaped and trimmed data
    let book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    });

    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      // get authors and genres (again) to add to new book record
      // because each book must be associated with an existing author and genre
      async.parallel({
        authors: (callback) => {
          Author.find(callback);
        },
        genres: (callback) => {
          Genre.find(callback);
        }
      }, (err, results) => {
        // if error in API usage
        if (err) { return next(err); }
        // if successful
        // mark whatever genres were selected as checked
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        // render the book_form.pug template
        // passing title, authors, genres, book, errors values to the template
        res.render('book_form', {
          title: 'Create Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        });
      });
      return;
    // if no errors
    } else {
      // save it, checking for DB errors
      book.save((err) => {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to its new detail page
        res.redirect(book.url);
      });
    }
  }
];


// show Book DELETE form (GET request)
// OLD
// exports.book_delete_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Delete (GET)`);
// };
exports.book_delete_get = (req, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id).exec(callback);
    },
    books_instances: (callback) => {
      BookInstance.find({ 'book': req.params.id }).exec(callback);
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    // if no results
    if (results.book === null) {
      res.redirect('/catalog/books');
    }
    // if successful
    // render book_delete.pug template
    // passing title, book, book instances values to the template
    res.render('book_delete', {
      title: 'Delete Book',
      book: results.book,
      book_instances: results.books_instances
    });
  });
};
// handle Book DELETE form (POST request)
// OLD
// exports.book_delete_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Delete (POST)`);
// };
exports.book_delete_post = (req, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.bookid).exec(callback);
    },
    books_instances: (callback) => {
      BookInstance.find({ 'book': req.params.bookid }).exec(callback)
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    if (results.books_instances.length > 0) {
      // if book has associated book instances
      // re-render book_delete.pug template
      // WITH ERROR MESSAGE
      // passing title, book, book instances values to the template
      res.render('book_delete', {
        title: 'Delete Book',
        book: results.book,
        book_instances: results.books_instances
      });
    } else {
      // if book has no associated book instances
      // delete the book object and redirect to list of books
      Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to book list
        res.redirect('/catalog/books');
      });
    }
  });
};


// show Book UPDATE form (GET request)
// OLD
// exports.book_update_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Update (GET)`);
// };
exports.book_update_get = (req, res, next) => {
  // get book, authors, genres to pre-populate form
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
    },
    authors: (callback) => {
      Author.find(callback);
    },
    genres: (callback) => {
      Genre.find(callback);
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    // if no results
    if (results.book === null) {
      let err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // if successful
    // mark whatever genres were selected as checked
    for (let all_genres_i = 0; all_genres_i < results.genres.length; all_genres_i++) {
      for (let book_genres_i = 0; book_genres_i < results.book.genre.length; book_genres_i++) {
        if (results.genres[all_genres_i]._id.toString() === results.book.genre[book_genres_i]._id.toString()) {
          results.genres[all_genres_i].checked = 'true';
        }
      }
    }
    // render the book_form.pug template
    // passing title, authors, genres, book, errors values to the template
    res.render('book_form', {
      title: 'Update Book',
      authors: results.authors,
      genres: results.genres,
      book: results.book
    });
  });
};
// handle Book UPDATE form (POST request)
// OLD
// exports.book_update_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Update (POST)`);
// };
exports.book_update_post = [
  // first convert received genre(s) to an array
  // for sanitizing each in the next step
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  // VALIDATE fields
  body('title', 'Title must be specified.')
    .isLength({ min: 1 }).trim(),
  body('author', 'Author must be specified.')
    .isLength({ min: 1 }).trim(),
  body('summary', 'Summary must be specified.')
    .isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must be specified.')
    .isLength({ min: 1 }).trim(),

  // SANITIZE fields
  sanitizeBody('title')
    .trim().escape(),
  sanitizeBody('author')
    .trim().escape(),
  sanitizeBody('summary')
    .trim().escape(),
  sanitizeBody('isbn')
    .trim().escape(),
  sanitizeBody('genre.*')
    .trim().escape(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);

    // create a new book object with escaped / trimmed data and the existing ID
    let book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
      // this is required or a new ID will be assigned!
      _id: req.params.id
    });

    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      // get authors and genres (again) to add to new book record created above (yes, we are updating)
      // because each book must be associated with an existing author and genre
      async.parallel({
        authors: (callback) => {
          Author.find(callback);
        },
        genres: (callback) => {
          Genre.find(callback);
        }
      }, (err, results) => {
        // if error in API usage
        if (err) { return next(err); }
        // if successful
        // mark whatever genres were selected as checked
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true'
          }
        }
        // render the book_form.pug template
        // passing title, authors, genres, book, errors values to the template
        res.render('book_form', {
          title: 'Update Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        });
      });
      return;
    // if no errors
    // update record
    } else {
      Book.findByIdAndUpdate(req.params.id, book, {}, (err, thebook) => {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to book detail page
        res.redirect(thebook.url);
      });
    }
  }
];
