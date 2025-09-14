const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const { validateReport } = require('../middleware/validation');
const upload = require('../middleware/upload');

/**
 * @route   GET /api/reports
 * @desc    Get all reports (optionally filtered by bounds)
 * @access  Public
 */
router.get('/', reportController.getAllReports);

/**
 * @route   GET /api/reports/my
 * @desc    Get current user's reports
 * @access  Private
 */
router.get('/my', authenticateToken, reportController.getUserReports);

/**
 * @route   GET /api/reports/:id
 * @desc    Get a specific report by ID
 * @access  Public
 */
router.get('/:id', reportController.getReportById);

/**
 * @route   POST /api/reports
 * @desc    Create a new report
 * @access  Private
 */
router.post('/', 
  authenticateToken, 
  upload.single('image'), 
  validateReport, 
  reportController.createReport
);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a report (only owner or official)
 * @access  Private
 */
router.delete('/:id', authenticateToken, reportController.deleteReport);

module.exports = router;

