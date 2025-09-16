/**
 * Deletion Service for OceanWatch
 * Handles comprehensive deletion of reports and all related data
 */

const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class DeletionService {
  /**
   * Completely delete a report and all associated data
   * This includes:
   * - The report record itself
   * - Associated files (images, videos)
   * - Analytics data
   * - Activity logs
   * - Cache entries
   */
  static async deleteReportCompletely(reportId, adminUserId) {
    const client = await pool.connect();
    
    try {
      // Start transaction for atomic deletion
      await client.query('BEGIN');
      
      // 1. Get report details before deletion (for file cleanup)
      const reportResult = await client.query(
        'SELECT id, image_url, video_url, user_id, event_type, created_at FROM reports WHERE id = $1',
        [reportId]
      );
      
      if (reportResult.rows.length === 0) {
        throw new Error('Report not found');
      }
      
      const report = reportResult.rows[0];
      
      // 2. Delete associated files from filesystem
      await this.deleteAssociatedFiles(report);
      
      // 3. Delete from all related tables with proper error handling
      const deletionResults = await this.deleteFromAllRelatedTables(client, reportId);
      
      // 5. Delete the main report record
      const deleteResult = await client.query(
        'DELETE FROM reports WHERE id = $1 RETURNING *',
        [reportId]
      );
      
      if (deleteResult.rows.length === 0) {
        throw new Error('Failed to delete report');
      }
      
      // 6. Log the deletion action
      await this.logDeletionAction(client, reportId, report, adminUserId, deletionResults);
      
      // Commit transaction
      await client.query('COMMIT');
      
      return {
        success: true,
        deletedReport: deleteResult.rows[0],
        deletionResults: deletionResults,
        message: 'Report and all associated data deleted successfully'
      };
      
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Delete from all related tables with comprehensive error handling and logging
   */
  static async deleteFromAllRelatedTables(client, reportId) {
    const deletionResults = {
      tablesProcessed: [],
      tablesSkipped: [],
      errors: [],
      totalDeleted: 0
    };

    // Define all possible related tables and their deletion queries
    const relatedTables = [
      {
        name: 'map_markers',
        query: 'DELETE FROM map_markers WHERE report_id = $1',
        description: 'Map marker positions'
      },
      {
        name: 'analytics_daily',
        query: 'DELETE FROM analytics_daily WHERE report_id = $1',
        description: 'Daily analytics data'
      },
      {
        name: 'analytics',
        query: 'DELETE FROM analytics WHERE report_id = $1',
        description: 'Analytics data'
      },
      {
        name: 'metrics_cache',
        query: 'DELETE FROM metrics_cache WHERE report_id = $1',
        description: 'Cached metrics'
      },
      {
        name: 'activity_logs',
        query: 'DELETE FROM activity_logs WHERE report_id = $1',
        description: 'Activity log entries'
      },
      {
        name: 'report_analytics',
        query: 'DELETE FROM report_analytics WHERE report_id = $1',
        description: 'Report-specific analytics'
      },
      {
        name: 'report_metrics',
        query: 'DELETE FROM report_metrics WHERE report_id = $1',
        description: 'Report metrics data'
      }
    ];

    // Process each table
    for (const table of relatedTables) {
      try {
        // First check if table exists
        const tableExistsResult = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table.name]);

        if (!tableExistsResult.rows[0].exists) {
          deletionResults.tablesSkipped.push({
            table: table.name,
            reason: 'Table does not exist',
            description: table.description
          });
          console.log(`Table ${table.name} does not exist, skipping deletion`);
          continue;
        }

        // Execute deletion query
        const deleteResult = await client.query(table.query, [reportId]);
        const deletedCount = deleteResult.rowCount || 0;
        
        deletionResults.tablesProcessed.push({
          table: table.name,
          deletedRows: deletedCount,
          description: table.description,
          success: true
        });
        
        deletionResults.totalDeleted += deletedCount;
        
        console.log(`Successfully deleted ${deletedCount} rows from ${table.name} for report ${reportId}`);

      } catch (error) {
        const errorInfo = {
          table: table.name,
          error: error.message,
          code: error.code,
          description: table.description
        };
        
        deletionResults.errors.push(errorInfo);
        
        console.error(`Error deleting from ${table.name} for report ${reportId}:`, error.message);
        
        // Continue with other tables even if one fails
        // Don't throw error to allow other deletions to proceed
      }
    }

    // Log summary
    console.log(`Deletion summary for report ${reportId}:`, {
      tablesProcessed: deletionResults.tablesProcessed.length,
      tablesSkipped: deletionResults.tablesSkipped.length,
      errors: deletionResults.errors.length,
      totalRowsDeleted: deletionResults.totalDeleted
    });

    return deletionResults;
  }

  /**
   * Delete associated files from filesystem
   */
  static async deleteAssociatedFiles(report) {
    const filesToDelete = [];
    
    // Add image file if exists
    if (report.image_url) {
      const imagePath = path.join(__dirname, '../../uploads', path.basename(report.image_url));
      filesToDelete.push(imagePath);
    }
    
    // Add video file if exists
    if (report.video_url) {
      const videoPath = path.join(__dirname, '../../uploads', path.basename(report.video_url));
      filesToDelete.push(videoPath);
    }
    
    // Delete files
    for (const filePath of filesToDelete) {
      try {
        await fs.access(filePath); // Check if file exists
        await fs.unlink(filePath); // Delete file
        console.log(`Deleted file: ${filePath}`);
      } catch (error) {
        // File might not exist or already deleted, log but don't fail
        console.log(`Could not delete file ${filePath}:`, error.message);
      }
    }
  }
  
  /**
   * Log the deletion action for audit purposes
   */
  static async logDeletionAction(client, reportId, report, adminUserId, deletionResults = null) {
    try {
      // Create deletion_logs table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS deletion_logs (
          id SERIAL PRIMARY KEY,
          report_id INTEGER NOT NULL,
          original_user_id INTEGER,
          deleted_by_admin_id INTEGER NOT NULL,
          event_type VARCHAR(100),
          deletion_reason TEXT,
          original_created_at TIMESTAMP WITH TIME ZONE,
          deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB
        )
      `);
      
      // Log the deletion
      await client.query(`
        INSERT INTO deletion_logs 
        (report_id, original_user_id, deleted_by_admin_id, event_type, original_created_at, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        reportId,
        report.user_id,
        adminUserId,
        report.event_type,
        report.created_at,
        JSON.stringify({
          had_image: !!report.image_url,
          had_video: !!report.video_url,
          deletion_timestamp: new Date().toISOString(),
          deletion_results: deletionResults || {}
        })
      ]);
      
    } catch (error) {
      console.error('Failed to log deletion action:', error);
      // Don't fail the deletion if logging fails
    }
  }
  
  /**
   * Validate that a report exists and get its basic info
   */
  static async validateReportExists(reportId) {
    try {
      const result = await pool.query(
        'SELECT id, event_type, user_id, created_at FROM reports WHERE id = $1',
        [reportId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get deletion statistics for admin dashboard
   */
  static async getDeletionStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_deletions,
          COUNT(DISTINCT deleted_by_admin_id) as admin_count,
          DATE_TRUNC('day', deleted_at) as deletion_date,
          COUNT(*) as daily_count
        FROM deletion_logs 
        WHERE deleted_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', deleted_at)
        ORDER BY deletion_date DESC
      `).catch(() => {
        // Table might not exist yet
        return { rows: [] };
      });
      
      return result.rows;
    } catch (error) {
      console.error('Failed to get deletion stats:', error);
      return [];
    }
  }
  
  /**
   * Bulk delete multiple reports (admin only)
   */
  static async bulkDeleteReports(reportIds, adminUserId) {
    const results = [];
    const errors = [];
    
    for (const reportId of reportIds) {
      try {
        const result = await this.deleteReportCompletely(reportId, adminUserId);
        results.push({ reportId, ...result });
      } catch (error) {
        errors.push({ reportId, error: error.message });
      }
    }
    
    return {
      successful: results,
      failed: errors,
      summary: {
        total: reportIds.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }

}

module.exports = DeletionService;
