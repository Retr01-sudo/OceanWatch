const Report = require('../models/Report');

class ReportService {
  /**
   * Create a new report with validation and error handling
   */
  static async createReport(reportData, userId) {
    try {
      // Validate required fields
      if (!reportData.event_type) {
        throw new Error('Event type is required');
      }
      
      if (!reportData.location) {
        throw new Error('Location is required');
      }
      
      // Prepare report data with defaults
      const reportToCreate = {
        userId,
        eventType: reportData.event_type,
        severityLevel: reportData.severity_level || 'Medium',
        reportLanguage: reportData.report_language || 'English',
        briefTitle: reportData.brief_title || '',
        description: reportData.description || '',
        location: reportData.location, // Use PostGIS location format
        imageUrl: reportData.image_url || null,
        videoUrl: reportData.video_url || null,
        phoneNumber: reportData.phone_number || null,
        address: reportData.address || null
      };
      
      return await Report.create(reportToCreate);
    } catch (error) {
      console.error('ReportService.createReport error:', error);
      throw error;
    }
  }
  
  /**
   * Get all reports with optional filtering
   */
  static async getAllReports(filters = {}) {
    try {
      return await Report.findAllWithFilters(filters);
    } catch (error) {
      console.error('ReportService.getAllReports error:', error);
      throw error;
    }
  }
  
  /**
   * Get reports by user ID
   */
  static async getUserReports(userId) {
    try {
      return await Report.findByUserId(userId);
    } catch (error) {
      console.error('ReportService.getUserReports error:', error);
      throw error;
    }
  }
  
  /**
   * Get report by ID
   */
  static async getReportById(reportId) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }
      return report;
    } catch (error) {
      console.error('ReportService.getReportById error:', error);
      throw error;
    }
  }
  
  /**
   * Delete report by ID
   */
  static async deleteReport(reportId, userId, userRole) {
    try {
      const deleted = await Report.deleteById(reportId, userId, userRole);
      if (!deleted) {
        throw new Error('Report not found or you do not have permission to delete it');
      }
      return true;
    } catch (error) {
      console.error('ReportService.deleteReport error:', error);
      throw error;
    }
  }
}

module.exports = ReportService;
