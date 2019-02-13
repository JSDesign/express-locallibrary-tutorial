
// catalog route

// import Express and create a `router` object
const express = require('express');
const router = express.Router();

// import handler functions from controller modules
const book_controller = require('../controllers/bookController');
const author_controller = require('../controllers/authorController');
const genre_controller = require('../controllers/genreController');
const book_instance_controller = require('../controllers/bookInstanceController');


//// BOOK ROUTES ////

// GET catalog home page
router.get('/', book_controller.index);

// NOTE: the following must come before routes that use the Book ID param from the controller
// route GET requests to CREATE a Book
router.get('/book/create', book_controller.book_create_get);
// route POST requests to CREATE a Book
router.post('/book/create', book_controller.book_create_post);

// route GET requests to DELETE a Book
router.get('/book/:id/delete', book_controller.book_delete_get);
// route POST requests to DELETE a Book
router.post('/book/:id/delete', book_controller.book_delete_post);

// route GET requests to UPDATE a Book
router.get('/book/:id/update', book_controller.book_update_get);
// route POST requests to UPDATE a Book
router.post('/book/:id/update', book_controller.book_update_post);

// route GET requests to show single Book detail page
router.get('/book/:id', book_controller.book_detail);

// route GET requests to show all Books
router.get('/books', book_controller.book_list);


//// AUTHOR ROUTES ////

// NOTE: the following must come before routes that use the Author ID param from the controller
// route GET requests to CREATE an Author
router.get('/author/create', author_controller.author_create_get);
// route POST requests to CREATE an Author
router.post('/author/create', author_controller.author_create_post);

// route GET requests to DELETE an Author
router.get('/author/:id/delete', author_controller.author_delete_get);
// route POST requests to DELETE an Author
router.post('/author/:id/delete', author_controller.author_delete_post);

// route GET requests to UPDATE an Author
router.get('/author/:id/update', author_controller.author_update_get);
// route POST requests to UPDATE an Author
router.post('/author/:id/update', author_controller.author_update_post);

// route GET requests to show single Author detail page
router.get('/author/:id', author_controller.author_detail);

// route GET requests to show all Authors
router.get('/authors', author_controller.author_list);


//// GENRE ROUTES ////

// NOTE: the following must come before routes that use the Genre ID param from the controller
// route GET requests to CREATE a Genre
router.get('/genre/create', genre_controller.genre_create_get);
// route POST requests to CREATE a Genre
router.post('/genre/create', genre_controller.genre_create_post);

// route GET requests to DELETE a Genre
router.get('/genre/:id/delete', genre_controller.genre_delete_get);
// route POST requests to DELETE a Genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// route GET requests to UPDATE a Genre
router.get('/genre/:id/update', genre_controller.genre_update_get);
// route POST requests to UPDATE a Genre
router.post('/genre/:id/update', genre_controller.genre_update_post);

// route GET requests to show single Genre detail page
router.get('/genre/:id', genre_controller.genre_detail);

// route GET requests to show all Genre
router.get('/genres', genre_controller.genre_list);


//// BOOK INSTANCE ROUTES ////

// NOTE: the following must come before routes that use the Book Instance ID param from the controller
// route GET requests to CREATE a Book Instance
router.get('/bookinstance/create', book_instance_controller.book_instance_create_get);
// route POST requests to CREATE a Book Instance
router.post('/bookinstance/create', book_instance_controller.book_instance_create_post);

// route GET requests to DELETE a Book Instance
router.get('/bookinstance/:id/delete', book_instance_controller.book_instance_delete_get);
// route POST requests to DELETE a Book Instance
router.post('/bookinstance/:id/delete', book_instance_controller.book_instance_delete_post);

// route GET requests to UPDATE a Book Instance
router.get('/bookinstance/:id/update', book_instance_controller.book_instance_update_get);
// route POST requests to UPDATE a Book Instance
router.post('/bookinstance/:id/update', book_instance_controller.book_instance_update_post);

// route GET request to show single Book Instance detail page
router.get('/bookinstance/:id', book_instance_controller.book_instance_detail);

// route GET requests to show all Book Instances
router.get('/bookinstances', book_instance_controller.book_instance_list);


// add `router` object to module exports so it can be imported elsewhere
module.exports = router;
