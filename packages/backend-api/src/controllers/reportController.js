const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const path = require('path');

/**
 * Get all reports
 */
const getAllReports = async (req, res) => {
  try {
    const { bounds } = req.query;
    
    let reports;
    if (bounds) {
      // Parse bounds parameter (minLat,minLng,maxLat,maxLng)
      const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(Number);
      reports = await Report.findByBounds(minLat, minLng, maxLat, maxLng);
    } else {
      reports = await Report.findAll();
    }

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
      message: 'Internal server error while fetching reports'
    });
  }
};

/**
 * Create a new report
 */
const createReport = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      event_type, 
      severity_level = 'Medium',
      report_language = 'English',
      brief_title,
      description, 
      latitude, 
      longitude,
      phone_number,
      address
    } = req.body;
    
    // Get image URL if file was uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create the report
    const report = await Report.create({
      userId: req.user.id,
      eventType: event_type,
      severityLevel: severity_level,
      reportLanguage: report_language,
      briefTitle: brief_title,
      description: description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl: imageUrl,
      phoneNumber: phone_number,
      address: address
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report: {
          id: report.id,
          event_type: report.event_type,
          description: report.description,
          image_url: report.image_url,
          created_at: report.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating report'
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
 * Delete a report
 */
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Report.deleteById(id, req.user.id, req.user.role);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting report'
    });
  }
};

module.exports = {
  getAllReports,
  createReport,
  getUserReports,
  getReportById,
  deleteReport
};

