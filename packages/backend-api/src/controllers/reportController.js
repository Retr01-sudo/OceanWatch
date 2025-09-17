const { validationResult } = require('express-validator');
const ReportService = require('../services/reportService');
const pool = require('../config/database');
const path = require('path');

/**
 * Get all reports
 */
const getAllReports = async (req, res) => {
  try {
    const { bounds, severity, from, to, status, eventType } = req.query;
    const filters = {
      bounds,
      severity: severity ? severity.split(',') : null,
      from,
      to,
      status,
      eventType: eventType ? eventType.split(',') : null
    };
    const reports = await ReportService.getAllReports(filters);

    res.json({
      success: true,
      data: {
        reports: reports.map(report => ({
          id: report.id,
          event_type: report.event_type,
          severity_level: report.severity_level,
          report_language: report.report_language,
          brief_title: report.brief_title,
          description: report.description,
          image_url: report.image_url,
          video_url: report.video_url,
          phone_number: report.phone_number,
          address: report.address,
          is_verified: report.is_verified,
          created_at: report.created_at,
          user_email: report.user_email,
          user_role: report.user_role,
          location: {
            latitude: parseFloat(report.latitude),
            longitude: parseFloat(report.longitude)
          }
        }))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching reports'
    });
  }
};

/**
 * Create a new report
 */
const createReport = async (req, res) => {
  try {
    // CRITICAL SAFEGUARD: Validate user authentication and prevent ghost reports
    if (!req.user || !req.user.id) {
      console.error('SECURITY ALERT: Report creation attempted without valid user authentication', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body
      });
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create reports'
      });
    }

    // Log report creation attempt for audit trail
    console.log('Report creation initiated', {
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: req.body.event_type,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Report creation validation failed', {
        userId: req.user.id,
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // SAFEGUARD: Validate required fields to prevent incomplete reports
    // Convert latitude/longitude to PostGIS location format
    let location = null;
    if (req.body.latitude && req.body.longitude) {
      location = `POINT(${req.body.longitude} ${req.body.latitude})`;
    } else if (req.body.location) {
      location = req.body.location;
    }

    if (!req.body.event_type || !location) {
      console.warn('Report creation blocked - missing required fields', {
        userId: req.user.id,
        missingFields: {
          event_type: !req.body.event_type,
          location: !location,
          latitude: !req.body.latitude,
          longitude: !req.body.longitude
        },
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: event_type and location (latitude/longitude) are mandatory'
      });
    }

    // Extract data from request
    const reportData = {
      event_type: req.body.event_type,
      severity_level: req.body.severity_level || 'Medium',
      report_language: req.body.report_language || 'English',
      brief_title: req.body.brief_title,
      description: req.body.description || `${req.body.event_type} reported`, // Provide default description
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      video_url: req.body.video_url,
      phone_number: req.body.phone_number,
      address: req.body.address,
      location: location // Use converted location
    };

    // Create the report using service
    const report = await ReportService.createReport(reportData, req.user.id);

    // Log successful report creation
    console.log('Report created successfully', {
      reportId: report.id,
      userId: req.user.id,
      userEmail: req.user.email,
      eventType: report.event_type,
      severityLevel: report.severity_level,
      isVerified: report.is_verified,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });

  } catch (error) {
    console.error('CRITICAL ERROR: Report creation failed', {
      userId: req.user?.id || 'unknown',
      userEmail: req.user?.email || 'unknown',
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's reports
 */
const getUserReports = async (req, res) => {
  try {
    const reports = await Report.findByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        reports: reports.map(report => ({
          id: report.id,
          event_type: report.event_type,
          description: report.description,
          image_url: report.image_url,
          created_at: report.created_at,
          location: {
            latitude: parseFloat(report.latitude),
            longitude: parseFloat(report.longitude)
          }
        }))
      }
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user reports'
    });
  }
};

/**
 * Get a specific report by ID
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: {
        report: {
          id: report.id,
          event_type: report.event_type,
          description: report.description,
          image_url: report.image_url,
          created_at: report.created_at,
          user_email: report.user_email,
          user_role: report.user_role,
          location: {
            latitude: parseFloat(report.latitude),
            longitude: parseFloat(report.longitude)
          }
        }
      }
    });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching report'
    });
  }
};

/**
 * Delete a report (admin only - comprehensive deletion)
 */
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportId = parseInt(id);
    
    // Validate report ID
    if (isNaN(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }
    
    // Import deletion service
    const DeletionService = require('../services/deletionService');
    
    // Validate that report exists before attempting deletion
    const reportExists = await DeletionService.validateReportExists(reportId);
    if (!reportExists) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Perform comprehensive deletion
    const result = await DeletionService.deleteReportCompletely(reportId, req.user.id);
    
    res.json({
      success: true,
      message: 'Report and all associated data deleted successfully',
      data: {
        reportId: reportId,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user.email
      }
    });
    
  } catch (error) {
    console.error('Delete report error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Internal server error while deleting report';
    if (error.message === 'Report not found') {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    } else if (error.message.includes('permission')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete this report'
      });
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
};

/**
 * Verify a report (admin only - updates is_verified field)
 */
const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportId = parseInt(id);
    
    // Validate report ID
    if (isNaN(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }
    
    // Update the report verification status
    const result = await pool.query(
      `UPDATE reports 
       SET is_verified = true, verified_by = $1, verified_at = NOW(), updated_at = NOW()
       WHERE id = $2 
       RETURNING id, is_verified, verified_at`,
      [req.user.id, reportId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Report verified successfully',
      data: {
        reportId: reportId,
        is_verified: true,
        verified_at: result.rows[0].verified_at,
        verified_by: req.user.email
      }
    });
    
  } catch (error) {
    console.error('Verify report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while verifying report',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
};

/**
 * Bulk delete multiple reports (admin only)
 */
const bulkDeleteReports = async (req, res) => {
  try {
    const { reportIds } = req.body;
    
    // Validate input
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'reportIds must be a non-empty array'
      });
    }
    
    // Validate all IDs are numbers
    const validIds = reportIds.filter(id => Number.isInteger(id) && id > 0);
    if (validIds.length !== reportIds.length) {
      return res.status(400).json({
        success: false,
        message: 'All report IDs must be positive integers'
      });
    }
    
    // Import deletion service
    const DeletionService = require('../services/deletionService');
    
    // Perform bulk deletion
    const result = await DeletionService.bulkDeleteReports(validIds, req.user.id);
    
    res.json({
      success: true,
      message: `Bulk deletion completed. ${result.summary.successful} successful, ${result.summary.failed} failed.`,
      data: {
        summary: result.summary,
        successful: result.successful,
        failed: result.failed,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user.email
      }
    });
    
  } catch (error) {
    console.error('Bulk delete reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk deletion',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
};

module.exports = {
  getAllReports,
  createReport,
  getUserReports,
  getReportById,
  verifyReport,
  deleteReport,
  bulkDeleteReports
};

