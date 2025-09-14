import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useReports } from '@/contexts/ReportsContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardStats from '@/components/DashboardStats';
import ActivityFeed from '@/components/ActivityFeed';
import EnhancedMapDashboard, { FilterSettings } from '@/components/EnhancedMapDashboard';
import AdminPanel from '@/components/AdminPanel';
import ReportSubmissionForm from '@/components/ReportSubmissionForm';
import { Report } from '@/types';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();
  const { reports, loading, updateReport } = useReports();
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Filter state management - lifted up from EnhancedMapDashboard
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    eventTypes: [],
    dateRange: 'all',
    severity: 'all',
    showVerified: true, // New filter for verified reports
  });

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Get user's current location for the report form
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Could not get location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    }
  }, []);



  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseReportDetails = () => {
    setSelectedReport(null);
  };

  const handleReportUpdate = (reportId: number, updates: Partial<Report>) => {
    updateReport(reportId, updates);
    addNotification({
      type: 'success',
      title: 'Report Updated',
      message: 'The report has been successfully updated.',
    });
  };

  // Filter management functions
  const handleFilterChange = (filterType: string, value: any) => {
    setFilterSettings(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleToggleFilter = () => {
    setIsFilterVisible(prev => !prev);
  };

  // Filter verified reports for map display
  const getVerifiedReports = () => {
    return reports.filter(report => {
      // Check if report is verified (user_role === 'official')
      const isVerified = report.user_role === 'official';
      
      // Check if showVerified filter is enabled
      const showVerified = filterSettings.showVerified;
      
      // Return true only if report is verified AND showVerified is true
      return isVerified && showVerified;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout activeTab="dashboard">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ocean Hazard Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time monitoring and reporting of coastal hazards</p>
      </div>

      {/* Statistics Cards */}
      <DashboardStats reports={reports} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Map Section - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hazard Hotspots Overview</h2>
            <EnhancedMapDashboard 
              onReportClick={handleReportClick}
              height="500px"
              filterSettings={filterSettings}
              onFilterChange={handleFilterChange}
              isFilterVisible={isFilterVisible}
              onToggleFilter={handleToggleFilter}
              verifiedReports={getVerifiedReports()}
              allReports={reports}
            />
          </div>
        </div>

        {/* Activity Feed - Takes up 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed 
            reports={reports}
            onReportClick={handleReportClick}
          />
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.slice(0, 2).map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{report.event_type}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.user_role === 'official' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {report.user_role === 'official' ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {report.description && (
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                )}
                <div className="text-xs text-gray-500">
                  <p>Location: {report.location ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}` : 'Location not available'}</p>
                  <p>Date: {new Date(report.created_at).toLocaleDateString('en-IN')}</p>
                  <p>Reporter: {report.user_email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Panel - Only show for officials */}
      {user.role === 'official' && (
        <div className="mt-8">
          <AdminPanel 
            reports={reports}
            onReportUpdate={handleReportUpdate}
          />
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Emergency Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="font-medium text-red-900">Coast Guard</p>
              <p className="text-red-700">Call 1554</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-900">NDRF</p>
              <p className="text-red-700">Call 011-26701700</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-900">Emergency</p>
              <p className="text-red-700">Call 112</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Submission Form Modal */}
      <ReportSubmissionForm
        isOpen={isReportFormOpen}
        onClose={() => setIsReportFormOpen(false)}
        userLocation={userLocation}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;

