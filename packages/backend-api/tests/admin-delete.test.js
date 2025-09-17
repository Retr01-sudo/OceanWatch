const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/database');

describe('Admin Delete Functionality', () => {
  let adminToken;
  let citizenToken;
  let testReportId;

  beforeAll(async () => {
    // Setup test data
    // Login as admin (official role)
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@oceanwatch.com',
        password: 'admin123'
      });
    
    adminToken = adminLogin.body.data.token;

    // Login as citizen
    const citizenLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'citizen@oceanwatch.com', 
        password: 'citizen123'
      });
    
    citizenToken = citizenLogin.body.data.token;

    // Create a test report
    const reportResponse = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        event_type: 'Test Event',
        severity_level: 'Medium',
        description: 'Test report for deletion',
        latitude: 19.0760,
        longitude: 72.8777
      });
    
    testReportId = reportResponse.body.data.report.id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.end();
  });

  describe('DELETE /api/reports/:id', () => {
    test('should allow admin to delete any report', async () => {
      const response = await request(app)
        .delete(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    test('should deny citizen access to delete endpoint', async () => {
      // Create another test report
      const reportResponse = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          event_type: 'Another Test Event',
          severity_level: 'Low',
          description: 'Another test report',
          latitude: 19.0760,
          longitude: 72.8777
        });

      const newReportId = reportResponse.body.data.report.id;

      const deleteResponse = await request(app)
        .delete(`/api/reports/${newReportId}`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(deleteResponse.status).toBe(403);
      expect(deleteResponse.body.success).toBe(false);
      expect(deleteResponse.body.message).toBe('Official access required');
    });

    test('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .delete('/api/reports/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/reports/1');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/reports/bulk-delete', () => {
    let bulkTestReportIds = [];

    beforeEach(async () => {
      // Create multiple test reports for bulk deletion
      for (let i = 0; i < 3; i++) {
        const reportResponse = await request(app)
          .post('/api/reports')
          .set('Authorization', `Bearer ${citizenToken}`)
          .send({
            event_type: `Bulk Test Event ${i}`,
            severity_level: 'Medium',
            description: `Bulk test report ${i}`,
            latitude: 19.0760 + (i * 0.001),
            longitude: 72.8777 + (i * 0.001)
          });
        
        bulkTestReportIds.push(reportResponse.body.data.report.id);
      }
    });

    afterEach(() => {
      bulkTestReportIds = [];
    });

    test('should allow admin to bulk delete reports', async () => {
      const response = await request(app)
        .post('/api/reports/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reportIds: bulkTestReportIds
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.successful).toBe(3);
      expect(response.body.data.summary.failed).toBe(0);
    });

    test('should deny citizen access to bulk delete', async () => {
      const response = await request(app)
        .post('/api/reports/bulk-delete')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          reportIds: bulkTestReportIds
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Official access required');
    });

    test('should validate reportIds parameter', async () => {
      const response = await request(app)
        .post('/api/reports/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reportIds: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non-empty array');
    });

    test('should validate reportIds are integers', async () => {
      const response = await request(app)
        .post('/api/reports/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reportIds: ['invalid', 'ids']
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integers');
    });
  });

  describe('Cascading Deletion', () => {
    test('should delete all related data when report is deleted', async () => {
      // Create a test report with related data
      const reportResponse = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          event_type: 'Cascade Test Event',
          severity_level: 'High',
          description: 'Test cascading deletion',
          latitude: 19.0760,
          longitude: 72.8777
        });

      const reportId = reportResponse.body.data.report.id;

      // Delete the report
      await request(app)
        .delete(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Verify report is deleted
      const reportCheck = await pool.query('SELECT * FROM reports WHERE id = $1', [reportId]);
      expect(reportCheck.rows.length).toBe(0);

      // Verify deletion is logged
      const deletionLog = await pool.query('SELECT * FROM deletion_logs WHERE report_id = $1', [reportId]);
      expect(deletionLog.rows.length).toBe(1);
      expect(deletionLog.rows[0].report_data).toBeDefined();
    });
  });
});
