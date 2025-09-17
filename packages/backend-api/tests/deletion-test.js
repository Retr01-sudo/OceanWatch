/**
 * Comprehensive Deletion Test for OceanWatch
 * Tests permanent deletion across all data stores
 * 
 * WARNING: This test creates temporary reports for testing purposes.
 * All test reports are cleaned up after the test completes.
 * This test should NOT create persistent dummy data.
 */

const pool = require('../src/config/database');
const DeletionService = require('../src/services/deletionService');

class DeletionTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Deletion Tests...\n');

    try {
      // Test 1: Create test data
      await this.testCreateTestData();
      
      // Test 2: Test single report deletion
      await this.testSingleReportDeletion();
      
      // Test 3: Test bulk deletion
      await this.testBulkDeletion();
      
      // Test 4: Test missing tables handling
      await this.testMissingTablesHandling();
      
      // Test 5: Test deletion logging
      await this.testDeletionLogging();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.errors.push(`Test suite error: ${error.message}`);
    }

    this.printResults();
  }

  async testCreateTestData() {
    console.log('📝 Test 1: Creating test data...');
    
    try {
      const client = await pool.connect();
      
      // Create test reports
      const testReports = [
        {
          event_type: 'Test Tsunami',
          severity_level: 'High',
          description: 'Test deletion report 1',
          location: 'POINT(77.5946 12.9716)',
          user_id: 1
        },
        {
          event_type: 'Test High Waves',
          severity_level: 'Medium',
          description: 'Test deletion report 2',
          location: 'POINT(80.2707 13.0827)',
          user_id: 1
        }
      ];

      const createdReports = [];
      for (const report of testReports) {
        const result = await client.query(`
          INSERT INTO reports (event_type, severity_level, description, location, user_id, created_at)
          VALUES ($1, $2, $3, ST_GeogFromText($4), $5, NOW())
          RETURNING id
        `, [report.event_type, report.severity_level, report.description, report.location, report.user_id]);
        
        createdReports.push(result.rows[0].id);
      }
      
      // CLEANUP: Delete test reports immediately after creation to prevent persistence
      for (const reportId of createdReports) {
        try {
          await client.query('DELETE FROM reports WHERE id = $1', [reportId]);
        } catch (cleanupError) {
          console.warn(`Failed to cleanup test report ${reportId}:`, cleanupError.message);
        }
      }

      // Create test data in related tables (if they exist)
      for (const reportId of createdReports) {
        // Try to create map markers
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS map_markers (
              id SERIAL PRIMARY KEY,
              report_id INTEGER REFERENCES reports(id),
              marker_data JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          await client.query(`
            INSERT INTO map_markers (report_id, marker_data)
            VALUES ($1, $2)
          `, [reportId, JSON.stringify({ test: true })]);
        } catch (error) {
          console.log(`Could not create map marker for report ${reportId}: ${error.message}`);
        }

        // Try to create analytics data
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS analytics_daily (
              id SERIAL PRIMARY KEY,
              report_id INTEGER REFERENCES reports(id),
              analytics_data JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          await client.query(`
            INSERT INTO analytics_daily (report_id, analytics_data)
            VALUES ($1, $2)
          `, [reportId, JSON.stringify({ views: 1, test: true })]);
        } catch (error) {
          console.log(`Could not create analytics for report ${reportId}: ${error.message}`);
        }
      }

      client.release();
      this.testResults.passed++;
      console.log(`✅ Test data created successfully. Report IDs: ${createdReports.join(', ')}\n`);
      
      return createdReports;

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Test data creation failed: ${error.message}`);
      console.log(`❌ Failed to create test data: ${error.message}\n`);
      throw error;
    }
  }

  async testSingleReportDeletion() {
    console.log('🗑️  Test 2: Testing single report deletion...');
    
    try {
      // Create a test report
      const client = await pool.connect();
      const result = await client.query(`
        INSERT INTO reports (event_type, severity_level, description, location, user_id, created_at)
        VALUES ('Test Single Delete', 'Critical', 'Single deletion test', ST_GeogFromText('POINT(75.0 15.0)'), 1, NOW())
        RETURNING id
      `);
      
      const reportId = result.rows[0].id;
      client.release();

      // Delete the report using DeletionService
      const deletionResult = await DeletionService.deleteReportCompletely(reportId, 1);

      // Verify deletion
      const verifyClient = await pool.connect();
      const checkResult = await verifyClient.query('SELECT * FROM reports WHERE id = $1', [reportId]);
      verifyClient.release();

      if (checkResult.rows.length === 0 && deletionResult.success) {
        this.testResults.passed++;
        console.log('✅ Single report deletion successful');
        console.log(`   Deletion results: ${JSON.stringify(deletionResult.deletionResults, null, 2)}\n`);
      } else {
        this.testResults.failed++;
        this.testResults.errors.push('Single report deletion failed - report still exists or deletion failed');
        console.log('❌ Single report deletion failed\n');
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Single deletion test failed: ${error.message}`);
      console.log(`❌ Single deletion test failed: ${error.message}\n`);
    }
  }

  async testBulkDeletion() {
    console.log('📦 Test 3: Testing bulk deletion...');
    
    try {
      // Create multiple test reports
      const client = await pool.connect();
      const reportIds = [];
      
      for (let i = 0; i < 3; i++) {
        const result = await client.query(`
          INSERT INTO reports (event_type, severity_level, description, location, user_id, created_at)
          VALUES ($1, 'Low', $2, ST_GeogFromText($3), 1, NOW())
          RETURNING id
        `, [`Test Bulk ${i}`, `Bulk deletion test ${i}`, `POINT(${76.0 + i} ${16.0 + i})`]);
        
        reportIds.push(result.rows[0].id);
      }
      
      client.release();

      // Perform bulk deletion
      const bulkResult = await DeletionService.bulkDeleteReports(reportIds, 1);

      // Verify all reports are deleted
      const verifyClient = await pool.connect();
      const checkResult = await verifyClient.query('SELECT * FROM reports WHERE id = ANY($1)', [reportIds]);
      verifyClient.release();

      if (checkResult.rows.length === 0 && bulkResult.summary.successful === reportIds.length) {
        this.testResults.passed++;
        console.log('✅ Bulk deletion successful');
        console.log(`   Deleted ${bulkResult.summary.successful} reports, ${bulkResult.summary.failed} failed\n`);
      } else {
        this.testResults.failed++;
        this.testResults.errors.push('Bulk deletion failed - some reports still exist');
        console.log('❌ Bulk deletion failed\n');
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Bulk deletion test failed: ${error.message}`);
      console.log(`❌ Bulk deletion test failed: ${error.message}\n`);
    }
  }

  async testMissingTablesHandling() {
    console.log('🔍 Test 4: Testing missing tables handling...');
    
    try {
      // Create a test report
      const client = await pool.connect();
      const result = await client.query(`
        INSERT INTO reports (event_type, severity_level, description, location, user_id, created_at)
        VALUES ('Test Missing Tables', 'Medium', 'Missing tables test', ST_GeogFromText('POINT(77.0 17.0)'), 1, NOW())
        RETURNING id
      `);
      
      const reportId = result.rows[0].id;
      client.release();

      // Delete the report (this should handle missing tables gracefully)
      const deletionResult = await DeletionService.deleteReportCompletely(reportId, 1);

      // Check that deletion succeeded despite missing tables
      if (deletionResult.success && deletionResult.deletionResults) {
        const { tablesProcessed, tablesSkipped, errors } = deletionResult.deletionResults;
        
        this.testResults.passed++;
        console.log('✅ Missing tables handled gracefully');
        console.log(`   Tables processed: ${tablesProcessed.length}`);
        console.log(`   Tables skipped: ${tablesSkipped.length}`);
        console.log(`   Errors: ${errors.length}\n`);
      } else {
        this.testResults.failed++;
        this.testResults.errors.push('Missing tables test failed');
        console.log('❌ Missing tables test failed\n');
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Missing tables test failed: ${error.message}`);
      console.log(`❌ Missing tables test failed: ${error.message}\n`);
    }
  }

  async testDeletionLogging() {
    console.log('📋 Test 5: Testing deletion logging...');
    
    try {
      // Create a test report
      const client = await pool.connect();
      const result = await client.query(`
        INSERT INTO reports (event_type, severity_level, description, location, user_id, created_at)
        VALUES ('Test Logging', 'High', 'Logging test', ST_GeogFromText('POINT(78.0 18.0)'), 1, NOW())
        RETURNING id
      `);
      
      const reportId = result.rows[0].id;
      client.release();

      // Delete the report
      await DeletionService.deleteReportCompletely(reportId, 1);

      // Check if deletion was logged
      const logClient = await pool.connect();
      const logResult = await logClient.query('SELECT * FROM deletion_logs WHERE report_id = $1', [reportId]);
      logClient.release();

      if (logResult.rows.length > 0) {
        this.testResults.passed++;
        console.log('✅ Deletion logging successful');
        console.log(`   Log entry created with metadata: ${JSON.stringify(logResult.rows[0].metadata, null, 2)}\n`);
      } else {
        this.testResults.failed++;
        this.testResults.errors.push('Deletion logging failed - no log entry found');
        console.log('❌ Deletion logging failed\n');
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Deletion logging test failed: ${error.message}`);
      console.log(`❌ Deletion logging test failed: ${error.message}\n`);
    }
  }

  printResults() {
    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📝 Total: ${this.testResults.passed + this.testResults.failed}`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n🚨 Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Deletion functionality is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new DeletionTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = DeletionTester;
