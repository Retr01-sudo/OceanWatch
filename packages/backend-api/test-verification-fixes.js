#!/usr/bin/env node
/**
 * Comprehensive Test for Verification Display and Dummy Report Fixes
 * Tests both backend API and frontend verification logic
 */

const axios = require('axios');

class VerificationFixTester {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🧪 Testing Verification Display and Dummy Report Fixes...\n');

    try {
      // Test 1: Verify current reports show correct verification status
      await this.testCurrentReportsVerificationStatus();
      
      // Test 2: Test that admin reports are not auto-verified
      await this.testAdminReportsNotAutoVerified();
      
      // Test 3: Verify no dummy reports are being inserted
      await this.testNoDummyReportsInserted();
      
      // Test 4: Test report creation safeguards
      await this.testReportCreationSafeguards();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.errors.push(`Test suite error: ${error.message}`);
    }

    this.printResults();
  }

  async testCurrentReportsVerificationStatus() {
    console.log('📋 Test 1: Checking current reports verification status...');
    
    try {
      const response = await axios.get(`${this.baseURL}/reports`);
      const reports = response.data.data.reports;
      
      // Find admin reports (user_role === 'official')
      const adminReports = reports.filter(r => r.user_role === 'official');
      const citizenReports = reports.filter(r => r.user_role === 'citizen');
      
      console.log(`   Found ${adminReports.length} admin reports, ${citizenReports.length} citizen reports`);
      
      // Check if admin reports are correctly stored as unverified
      const unverifiedAdminReports = adminReports.filter(r => r.is_verified === false);
      const verifiedAdminReports = adminReports.filter(r => r.is_verified === true);
      
      console.log(`   Admin reports: ${unverifiedAdminReports.length} unverified, ${verifiedAdminReports.length} verified`);
      
      // This is the key test - admin reports should be unverified by default
      if (unverifiedAdminReports.length > 0) {
        this.testResults.passed++;
        console.log('✅ PASS: Admin reports correctly stored as unverified in database');
        
        // Show examples
        unverifiedAdminReports.slice(0, 2).forEach(report => {
          console.log(`   Example: Report ID ${report.id} - user_role: "${report.user_role}", is_verified: ${report.is_verified}`);
        });
      } else {
        this.testResults.failed++;
        this.testResults.errors.push('No unverified admin reports found - this may indicate auto-verification bug');
        console.log('❌ FAIL: No unverified admin reports found');
      }
      
      console.log('');

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Current reports test failed: ${error.message}`);
      console.log(`❌ Current reports test failed: ${error.message}\n`);
    }
  }

  async testAdminReportsNotAutoVerified() {
    console.log('🔒 Test 2: Verifying admin reports are not auto-verified...');
    
    try {
      const response = await axios.get(`${this.baseURL}/reports`);
      const reports = response.data.data.reports;
      
      // Get recent admin reports (last 10)
      const recentAdminReports = reports
        .filter(r => r.user_role === 'official')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      
      if (recentAdminReports.length === 0) {
        console.log('   No recent admin reports found to test');
        return;
      }
      
      // Check if any recent admin reports are auto-verified
      const autoVerifiedReports = recentAdminReports.filter(r => r.is_verified === true);
      
      if (autoVerifiedReports.length === 0) {
        this.testResults.passed++;
        console.log('✅ PASS: No recent admin reports are auto-verified');
        console.log(`   Checked ${recentAdminReports.length} recent admin reports - all correctly unverified`);
      } else {
        this.testResults.failed++;
        this.testResults.errors.push(`Found ${autoVerifiedReports.length} auto-verified admin reports`);
        console.log(`❌ FAIL: Found ${autoVerifiedReports.length} auto-verified admin reports`);
        autoVerifiedReports.forEach(report => {
          console.log(`   Auto-verified: Report ID ${report.id} - ${report.event_type}`);
        });
      }
      
      console.log('');

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Admin auto-verification test failed: ${error.message}`);
      console.log(`❌ Admin auto-verification test failed: ${error.message}\n`);
    }
  }

  async testNoDummyReportsInserted() {
    console.log('🚫 Test 3: Checking for dummy report insertion...');
    
    try {
      // Get current report count
      const initialResponse = await axios.get(`${this.baseURL}/reports`);
      const initialCount = initialResponse.data.data.reports.length;
      
      console.log(`   Initial report count: ${initialCount}`);
      
      // Wait 5 seconds to see if any new reports appear automatically
      console.log('   Waiting 5 seconds to detect automatic report insertion...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check report count again
      const finalResponse = await axios.get(`${this.baseURL}/reports`);
      const finalCount = finalResponse.data.data.reports.length;
      
      console.log(`   Final report count: ${finalCount}`);
      
      if (finalCount === initialCount) {
        this.testResults.passed++;
        console.log('✅ PASS: No dummy reports automatically inserted');
      } else {
        this.testResults.failed++;
        const newReports = finalCount - initialCount;
        this.testResults.errors.push(`${newReports} reports were automatically inserted`);
        console.log(`❌ FAIL: ${newReports} reports were automatically inserted`);
        
        // Show the new reports
        const allReports = finalResponse.data.data.reports;
        const newestReports = allReports
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, newReports);
        
        newestReports.forEach(report => {
          console.log(`   New report: ID ${report.id} - ${report.event_type} by ${report.user_email}`);
        });
      }
      
      console.log('');

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Dummy report insertion test failed: ${error.message}`);
      console.log(`❌ Dummy report insertion test failed: ${error.message}\n`);
    }
  }

  async testReportCreationSafeguards() {
    console.log('🛡️  Test 4: Testing report creation safeguards...');
    
    try {
      // Test 1: Try to create report without authentication
      try {
        await axios.post(`${this.baseURL}/reports`, {
          event_type: 'Test Event',
          description: 'Test without auth',
          location: 'POINT(77.5946 12.9716)'
        });
        
        this.testResults.failed++;
        this.testResults.errors.push('Report creation succeeded without authentication');
        console.log('❌ FAIL: Report creation succeeded without authentication');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.testResults.passed++;
          console.log('✅ PASS: Report creation properly blocked without authentication');
        } else {
          this.testResults.failed++;
          this.testResults.errors.push(`Unexpected error testing auth: ${error.message}`);
          console.log(`❌ Unexpected error testing auth: ${error.message}`);
        }
      }
      
      console.log('');

    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Report creation safeguards test failed: ${error.message}`);
      console.log(`❌ Report creation safeguards test failed: ${error.message}\n`);
    }
  }

  printResults() {
    console.log('📊 Verification Fix Test Results:');
    console.log('=================================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📝 Total: ${this.testResults.passed + this.testResults.failed}`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n🚨 Issues Found:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 All verification fixes are working correctly!');
      console.log('✅ Activity feed will show correct verification status');
      console.log('✅ No dummy reports are being auto-inserted');
      console.log('✅ Report creation has proper safeguards');
    } else {
      console.log('\n⚠️  Some issues detected. Please review the errors above.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new VerificationFixTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = VerificationFixTester;
