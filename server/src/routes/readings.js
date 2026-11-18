const express = require('express');
const { requireAuth } = require('../middleware/auth');
const readings = require('../controllers/readingController');

const router = express.Router();
router.use(requireAuth); 
router.get('/', readings.list);
router.post('/', readings.create);
router.put('/:id', readings.update);
router.delete('/:id', readings.remove);

module.exports = router;