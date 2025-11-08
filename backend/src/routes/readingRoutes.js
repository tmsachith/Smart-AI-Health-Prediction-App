const express = require('express');
const {
  addReading,
  getUserReadings,
  getReadingById,
  getLatestReading,
  deleteReading,
} = require('../controllers/readingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Reading routes
router.post('/add', addReading);
router.get('/user/:id', getUserReadings);
router.get('/user/:id/latest', getLatestReading);
router.get('/:id', getReadingById);
router.delete('/:id', deleteReading);

module.exports = router;
