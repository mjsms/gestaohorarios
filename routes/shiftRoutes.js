const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/shiftController');

// página HTML
router.get('/',      ctrl.list);

// feed para o Tabulator
router.get('/json',  ctrl.json);

module.exports = router;
