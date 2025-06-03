// routes/heatmapRoutes.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/heatmapController');

router.get('/', ctrl.page);

// exemplo: /heatmap/data/2024/23  (23ª semana de 2024)
router.get('/data/:year/:week', ctrl.data);

module.exports = router;
