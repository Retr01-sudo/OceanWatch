const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireOfficial } = require('../middleware/auth');
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
 * @route   PATCH /api/reports/:id/verify
 * @desc    Verify a report (admin/official only)
 * @access  Private - Official Role Required
 */
router.patch('/:id/verify', authenticateToken, requireOfficial, reportController.verifyReport);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a report (admin/official only)
 * @access  Private - Official Role Required
 */
router.delete('/:id', authenticateToken, requireOfficial, reportController.deleteReport);

/**
 * @route   POST /api/reports/bulk-delete
 * @desc    Bulk delete multiple reports (admin/official only)
 * @access  Private - Official Role Required
 */
router.post('/bulk-delete', authenticateToken, requireOfficial, reportController.bulkDeleteReports);

module.exports = router;

