
// users route

const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

// lol
// router.get('/cool/', function(req, res, next) {
//   res.send('You\'re so cool!');
// });

module.exports = router;
