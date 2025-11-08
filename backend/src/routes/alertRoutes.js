const express = require('express');
const {
  getUserAlerts,
  getAlertById,
  markAlertAsRead,
  acknowledgeAlert,
  markAllAlertsAsRead,
  deleteAlert,
  createAlert,
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Alert routes
router.get('/user/:id', getUserAlerts);
router.get('/:id', getAlertById);
router.put('/:id/read', markAlertAsRead);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/user/:id/read-all', markAllAlertsAsRead);
router.delete('/:id', deleteAlert);
router.post('/create', createAlert);

module.exports = router;
