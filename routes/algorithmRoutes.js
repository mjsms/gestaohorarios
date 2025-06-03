const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/algorithmController');




router.get("/", ctrl.list);
router.get("/:id", ctrl.detail);
router.get("/:id/compare", ctrl.compare);


module.exports = router;
