// routes/algorithmRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/algorithmController');

router.get ("/",            ctrl.list);
router.post("/generate",    ctrl.generate);
router.get ("/generate",    ctrl.generate);
router.get ("/:id",         ctrl.detail);
router.get ("/:id/compare", ctrl.compare);

module.exports = router;