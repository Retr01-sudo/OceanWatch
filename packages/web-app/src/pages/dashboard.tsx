import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useReports } from '@/contexts/ReportsContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardStats from '@/components/DashboardStats';
import ActivityFeed from '@/components/ActivityFeed';
import FilteredMapView from '@/components/FilteredMapView';
import ReportDetailModal from '@/components/ReportDetailModal';
import AdminPanel from '@/components/AdminPanel';
import ReportSubmissionForm from '@/components/ReportSubmissionForm';
import Icon from '@/components/icons/Icon';
import { Report } from '@/types';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();
  const { reports, loading, updateReport } = useReports();
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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
            <FilteredMapView
              height="480px"
              showLegend={true}
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
            <Icon name="alert-triangle" size={20} className="mr-2 text-red-600" aria-label="Emergency alert" />
            Emergency Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="font-medium text-red-900">Coast Guard</p>
              <p className="text-red-700 flex items-center justify-center">
                <Icon name="phone" size={16} className="mr-1" aria-label="Phone" />
                1554
              </p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-900">NDRF</p>
              <p className="text-red-700 flex items-center justify-center">
                <Icon name="phone" size={16} className="mr-1" aria-label="Phone" />
                011-26701700
              </p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-900">Emergency</p>
              <p className="text-red-700 flex items-center justify-center">
                <Icon name="phone" size={16} className="mr-1" aria-label="Phone" />
                112
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />

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

