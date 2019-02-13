
// book instance controller

const BookInstance = require('../models/bookInstance');
const Book = require('../models/book');

const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// export functions for each URL to be handled
// these are the callback functions to be used by router in a separate file

// show ALL Book Instances
// OLD
// exports.book_instance_list = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance List`);
// };
exports.book_instance_list = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec((err, list_book_instances) => {
      // if not successful
      if (err) { return next(err); }
      // if successful
      // render book_instance_list.pug template
      // passing title and book instance list values to the template
      res.render('book_instance_list', {
        title: 'Book Instance List',
        book_instance_list: list_book_instances
      });
    });
}


// show specific Book Instance DETAIL page
// OLD
// exports.book_instance_detail = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance detail: ${req.params.id}`);
// };
exports.book_instance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, book_instance) => {
      // if not successful
      if (err) { return next(err); }
      // if successful
      // render the book_instance_detail.pug template
      // passing title and book instance values to the template
      res.render('book_instance_detail', {
        title: 'Book Instance',
        book_instance: book_instance
      });
    });
};


// show Book Instance CREATE form (GET request)
// OLD
// exports.book_instance_create_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance Create (GET)`);
// };
exports.book_instance_create_get = (req, res, next) => {
  Book.find({}, 'title')
    .exec((err, books) => {
      // if not successful
      if (err) { return next(err); }
      // if successful
      // render the book_instance_form.pug template
      // passing title and book list (all books) values to the template
      res.render('book_instance_form', {
        title: 'Create Book Instance',
        book_list: books
      });
    });
};
// handle Book Instance CREATE form (POST request)
// OLD
// exports.book_instance_create_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance Create (POST)`);
// };
exports.book_instance_create_post = [
  // VALIDATE fields
  body('book', 'Book must be specified.')
    .isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified.')
    .isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date entered.')
    .optional({ checkFalsy: true }).isISO8601(),

  // SANITIZE fields
  sanitizeBody('book')
    .trim().escape(),
  sanitizeBody('imprint')
    .trim().escape(),
  sanitizeBody('status')
    .trim().escape(),
  sanitizeBody('due_back')
    .toDate(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);

    // create a new book instance object with escaped and trimmed data
    let bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });

    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      // get book (again) to add to new book instance record
      // because each book instance must be associated with an existing book
      Book.find({}, 'title')
        .exec((err, books) => {
          // if not successful
          if (err) { return next(err); }
          // if successful
          // render the book_instance_form.pug template
          // passing title, book list (all books), selected book, errors, book instance values to the template
          res.render('book_instance_form', {
            title: 'Create Book Instance',
            book_list: books,
            selected_book: bookInstance.book._id,
            errors: errors.array(),
            bookInstance: bookInstance
          });
        });
      return;
    // if no errors
    } else {
      // save it, checking for DB errors
      bookInstance.save((err) => {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to its new instance page
        res.redirect(bookInstance.url);
      });
    }
  }
];


// show Book Instance DELETE form (GET request)
// OLD
// exports.book_instance_delete_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance Delete (GET)`);
// };
exports.book_instance_delete_get = (req, res, next) => {
  // get book instance data and populate its book data so we have access to the title
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, book_instance) => {
      // if not successful
      if (err) { return next(err); }
      // if no results are returned
      // redirect back to book instances list
      if (book_instance === null) {
        res.redirect('/catalog/bookinstances');
      }
      // if successful
      // render the book_instance_delete.pug template
      // passing title and book instance values to the template
      res.render('book_instance_delete', {
        title: 'Delete Book Instance',
        book_instance: book_instance
      });
    });
};
// handle Book Instance DELETE form (POST request)
// OLD
// exports.book_instance_delete_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance Delete (POST)`);
// };
exports.book_instance_delete_post = (req, res, next) => {
  BookInstance.findById(req.params.bookinstanceid)
    .exec((err, book_instance) => {
      // if not successful
      if (err) { return next(err); }
      // if successful
      // delete the book instance object and redirect to list of book instances
      BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to list of book instances
        res.redirect('/catalog/bookinstances');
      });
    });
};


// show Book Instance UPDATE form (GET request)
// OLD
// exports.book_instance_update_get = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance Update (GET)`);
// };
exports.book_instance_update_get = (req, res, next) => {
  // get book instance data and populate its book data so we have access to the title
  async.parallel({
    book_instance: (callback) => {
      BookInstance.findById(req.params.id)
        .populate('book')
        .exec(callback)
    },
    books: (callback) => {
      Book.find(callback)
    }
  }, (err, results) => {
    // if not successful
    if (err) { return next(err); }
    // if no results
    if (results.book_instance === null) {
      let err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
    }
    // if successful
    // render the book_instance_form.pug template
    // passing title, book list (all books), selected book, book instance values to the template
    res.render('book_instance_form', {
      title: 'Update Book Instance',
      book_list: results.books,
      selected_book: results.book_instance.book._id,
      bookInstance: results.book_instance
    });
  });
};
// handle Book Instance UPDATE form (POST request)
// OLD
// exports.book_instance_update_post = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Book Instance Update (POST)`);
// };
exports.book_instance_update_post = [
  // VALIDATE fields
  body('book', 'Book must be specified.').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified.').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date.').optional({ checkFalsy: true }).isISO8601(),

  // SANITIZE fields
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // PROCESS request after validation and sanitization
  (req, res, next) => {
    // extract any validation errors from the request, to be used later
    const errors = validationResult(req);

    // create a new book instance object with escaped / trimmed data and the existing ID
    let bookInstance = new BookInstance({
      book: req.body.book,
      instance: req.body.instance,
      status: req.body.status,
      due_back: req.body.due_back,
      // this is required or a new ID will be assigned!
      _id: req.params.id
    });

    // handle errors
    // if errors, render the form again with sanitized values and error messages
    // isEmpty() is a express-validator method
    if (!errors.isEmpty()) {
      // get book (again) to update to add to new book instance record created above (yes, we are updating)
      // because each book instance must be associated with an existing book
      Book.find({}, 'title')
        .exec((err, books) => {
          // if not successful
          if (err) { return next(err); }
          // if successful
          // render the book_instance_form.pug template
          // passing title, book list (all books), selected book, book instance, errors values to the template
          res.render('book_instance_form', {
            title: 'Update Book Instance',
            book_list: books,
            selected_book: book_instance.book._id,
            bookInstance: book_instance,
            errors: errors.array()
          });
      });
      return;
    // if no errors
    // update record
    } else {
      BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {}, (err, thebookinstance) => {
        // if not successful
        if (err) { return next(err); }
        // if successful
        // redirect to book instance detail page
        res.redirect(thebookinstance.url);
      });
    }
  }
];
