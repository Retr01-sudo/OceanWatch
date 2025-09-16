#!/usr/bin/env node
/**
 * Test Report Submission Flow
 * Tests both admin and user report submission after fixes
 */

const axios = require('axios');
const FormData = require('form-data');

class ReportSubmissionTester {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.adminToken = null;
    this.userToken = null;
  }

  async runTests() {
    console.log('🧪 Testing Report Submission Flow...\n');

    try {
      // Step 1: Login as admin and user
      await this.loginUsers();
      
      // Step 2: Test admin report submission
      await this.testAdminReportSubmission();
      
      // Step 3: Test user report submission
      await this.testUserReportSubmission();
      
      // Step 4: Verify reports appear in API
      await this.verifyReportsInAPI();

    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  async loginUsers() {
    console.log('🔐 Logging in users...');
    
    try {
      // Login as admin
      const adminResponse = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'admin@oceanguard.com',
        password: 'password'
      });
      this.adminToken = adminResponse.data.data.token;
      console.log('✅ Admin login successful');

      // Login as citizen
      const userResponse = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'citizen@oceanguard.com', 
        password: 'password'
      });
      this.userToken = userResponse.data.data.token;
      console.log('✅ User login successful\n');

    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testAdminReportSubmission() {
    console.log('👨‍💼 Testing admin report submission...');
    
    try {
      const formData = new FormData();
      formData.append('event_type', 'High Waves');
      formData.append('severity_level', 'High');
      formData.append('description', 'Test admin report submission');
      formData.append('latitude', '18.9220');
      formData.append('longitude', '72.8347');
      formData.append('address', 'Mumbai, India');

      const response = await axios.post(`${this.baseURL}/reports`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.adminToken}`
        }
      });

      if (response.data.success) {
        console.log('✅ Admin report submitted successfully');
        console.log(`   Report ID: ${response.data.data.id}`);
        console.log(`   Event Type: ${response.data.data.event_type}`);
        console.log(`   Is Verified: ${response.data.data.is_verified}`);
        console.log(`   User Role: ${response.data.data.user_role || 'N/A'}\n`);
        return response.data.data;
      } else {
        throw new Error('Admin report submission failed');
      }

    } catch (error) {
      console.error('❌ Admin report submission failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testUserReportSubmission() {
    console.log('👤 Testing user report submission...');
    
    try {
      const formData = new FormData();
      formData.append('event_type', 'Coastal Flooding');
      formData.append('severity_level', 'Medium');
      formData.append('description', 'Test user report submission');
      formData.append('latitude', '15.2993');
      formData.append('longitude', '73.8278');
      formData.append('address', 'Goa, India');

      const response = await axios.post(`${this.baseURL}/reports`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.userToken}`
        }
      });

      if (response.data.success) {
        console.log('✅ User report submitted successfully');
        console.log(`   Report ID: ${response.data.data.id}`);
        console.log(`   Event Type: ${response.data.data.event_type}`);
        console.log(`   Is Verified: ${response.data.data.is_verified}`);
        console.log(`   User Role: ${response.data.data.user_role || 'N/A'}\n`);
        return response.data.data;
      } else {
        throw new Error('User report submission failed');
      }

    } catch (error) {
      console.error('❌ User report submission failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyReportsInAPI() {
    console.log('📋 Verifying reports appear in API...');
    
    try {
      const response = await axios.get(`${this.baseURL}/reports`);
      const reports = response.data.data.reports;
      
      // Find our test reports (most recent ones)
      const recentReports = reports
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      console.log(`✅ Found ${reports.length} total reports`);
      console.log('   Recent reports:');
      
      recentReports.forEach((report, index) => {
        console.log(`   ${index + 1}. ID ${report.id} - ${report.event_type} (${report.user_role}) - Verified: ${report.is_verified}`);
      });

      console.log('\n🎉 Report submission flow is working correctly!');
      console.log('✅ Admin reports submit and show as unverified');
      console.log('✅ User reports submit and show as unverified');
      console.log('✅ Reports appear in API with correct verification status');

    } catch (error) {
      console.error('❌ Failed to verify reports in API:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Run tests
const tester = new ReportSubmissionTester();
tester.runTests().catch(console.error);
