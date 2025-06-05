const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/icalController');

router.get('/class/:id', ctrl.classFeed);   // /ical/class/123
// (se quiseres também por sala: router.get('/room/:id', ctrl.roomFeed))

module.exports = router;
