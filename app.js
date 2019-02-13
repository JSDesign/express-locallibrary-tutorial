
// this is the "real" application entry point
// from MDN tutorial https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs
// code: https://github.com/mdn/express-locallibrary-tutorial

// to run this app locally via terminal
// * from the directory in which files are located *
//
// without nodemon
// 'DEBUG=express-locallibrary-tutorial:* npm start'
// with nodemon
// 'DEBUG=express-locallibrary-tutorial:* npm run devstart'

// then visit any of these:
// http://localhost:3000
// http://localhost:3000/catalog
// http://localhost:3000/catalog/books
// http://localhost:3000/catalog/bookinstances
// http://localhost:3000/catalog/authors
// http://localhost:3000/catalog/genres
// http://localhost:3000/catalog/book/5846437593935e2f8c2aa226
// http://localhost:3000/catalog/book/create


// start by importing useful node libraries
// including the dependencies downloaded using npm
// specified in package.json
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');


//// ROUTES ////

// now import route modules to be used further down
// more can be added whenever needed
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');


//// PERFORMANCE + SECURITY ////

// import a compression library to compress the HTTP response we send
// can be used on specific routes, or all routes
// FYI aparently we wouldn't use this middleware for a "high-traffic website"
// instead we would use a "reverse proxy like Nginx"
// wetf that means
// import the helmet library to protect against well-known web vulnerabilities
// by setting appropriate HTTP headers
const compression = require('compression');
const helmet = require('helmet');


//// APP OBJECT ////

// create `app` object using imported express module
const app = express();

// use the helmet middleware to add headers
// not sure if this needs to be here, right under the app declaration
app.use(helmet());


//// MONGOOSE CONNECTION ////

// set up mongoose connection
// MongoDB database MODELS are COLLECTIONS of DOCUMENTS
    // (these relate to TABLES of ROWS in SQL databases)
// these models can be searched
// the model's instances represent individual documents
// which can be saved and retrieved
const mongoose = require('mongoose');
const mongoDB = 'mongodb://jeannie:shittypassword1@ds233500.mlab.com:33500/sandbox_local_library';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error'));


//// VIEW ENGINE (pug) ////

// first `views` value is the sub folder where views will live
// then `view engine` value is the template library itself
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//// BASIC MIDDLEWARE ////

// call `app.use()` to add all the middleware libraries
// imported above into the request handling chain
// plus Express' own middleware `static` for setting the public directory
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
// use the imported compression middleware on all routes
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));


//// ROUTES MIDDLEWARE ////

// and here use the previously imported route handling modules
// and specify their actual route **_prefixes_** as well
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);


//// ERRORS MIDDLEWARE ////

// finally use handler middleware methods for errors and HTTP 404 responses
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


//// ERROR HANDLING ////

// error handler method
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//// MODULE EXPORTS ////

// add `app` object to module exports so it can get imported
// by initial application entry point /bin/www
module.exports = app;
