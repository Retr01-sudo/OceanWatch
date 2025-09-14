const pool = require('../config/database');

class Report {
  /**
   * Create a new report
   */
  static async create(reportData) {
    try {
      const {
        userId,
        eventType,
        severityLevel = 'Medium',
        reportLanguage = 'English',
        briefTitle,
        description,
        latitude,
        longitude,
        imageUrl = null,
        videoUrl = null,
        phoneNumber = null,
        address = null
      } = reportData;

      const result = await pool.query(
        `INSERT INTO reports (
          user_id, event_type, severity_level, report_language, brief_title, 
          description, location, image_url, video_url, phone_number, address
        ) 
         VALUES ($1, $2, $3, $4, $5, $6, ST_GeogFromText($7), $8, $9, $10, $11) 
         RETURNING id, user_id, event_type, severity_level, report_language, 
                   brief_title, description, image_url, video_url, phone_number, 
                   address, created_at`,
        [
          userId,
          eventType,
          severityLevel,
          reportLanguage,
          briefTitle,
          description,
          `POINT(${longitude} ${latitude})`,
          imageUrl,
          videoUrl,
          phoneNumber,
          address
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all reports with user information
   */
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT 
          r.id,
          r.event_type,
          r.severity_level,
          r.report_language,
          r.brief_title,
          r.description,
          r.image_url,
          r.video_url,
          r.phone_number,
          r.address,
          r.is_verified,
          r.created_at,
          u.email as user_email,
          u.role as user_role,
          ST_X(r.location::geometry) as longitude,
          ST_Y(r.location::geometry) as latitude
        FROM reports r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get reports by user ID
   */
  static async findByUserId(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          r.id,
          r.event_type,
          r.description,
          r.image_url,
          r.created_at,
          ST_X(r.location::geometry) as longitude,
          ST_Y(r.location::geometry) as latitude
        FROM reports r
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT 
          r.id,
          r.user_id,
          r.event_type,
          r.description,
          r.image_url,
          r.created_at,
          u.email as user_email,
          u.role as user_role,
          ST_X(r.location::geometry) as longitude,
          ST_Y(r.location::geometry) as latitude
        FROM reports r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get reports within a bounding box (for map queries)
   */
  static async findByBounds(minLat, minLng, maxLat, maxLng) {
    try {
      const result = await pool.query(`
        SELECT 
          r.id,
          r.event_type,
          r.description,
          r.image_url,
          r.created_at,
          u.email as user_email,
          u.role as user_role,
          ST_X(r.location::geometry) as longitude,
          ST_Y(r.location::geometry) as latitude
        FROM reports r
        JOIN users u ON r.user_id = u.id
        WHERE r.location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ORDER BY r.created_at DESC
      `, [minLng, minLat, maxLng, maxLat]);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete report by ID (only by owner or official)
   */
  static async deleteById(id, userId, userRole) {
    try {
      let query = 'DELETE FROM reports WHERE id = $1';
      let params = [id];

      // If user is not an official, they can only delete their own reports
      if (userRole !== 'official') {
        query += ' AND user_id = $2';
        params.push(userId);
      }

      const result = await pool.query(query, params);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Report;

