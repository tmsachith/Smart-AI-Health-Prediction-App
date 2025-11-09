const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  uploadReport,
  getUserReports,
  getReportById,
  deleteReport,
  getReportStats
} = require('../controllers/reportController');

/**
 * @route   POST /api/reports/upload
 * @desc    Upload medical report (image or PDF)
 * @access  Private
 */
router.post('/upload', protect, upload.single('reportFile'), uploadReport);

/**
 * @route   GET /api/reports
 * @desc    Get all reports for logged-in user
 * @access  Private
 * @query   status, reportType, limit, page
 */
router.get('/', protect, getUserReports);

/**
 * @route   GET /api/reports/stats
 * @desc    Get report statistics for user
 * @access  Private
 */
router.get('/stats', protect, getReportStats);

/**
 * @route   GET /api/reports/:id
 * @desc    Get single report by ID
 * @access  Private
 */
router.get('/:id', protect, getReportById);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete report
 * @access  Private
 */
router.delete('/:id', protect, deleteReport);

module.exports = router;
