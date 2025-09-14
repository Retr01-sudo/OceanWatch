import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedMapDashboard, { FilterSettings } from '@/components/EnhancedMapDashboard';
import { Report } from '@/types';

const MapPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { reports, loading } = useReports();
  
  // Filter state management - same as dashboard
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    eventTypes: [],
    dateRange: 'all',
    severity: 'all',
    showVerified: true, // New filter for verified reports
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);


  const handleReportClick = (report: Report) => {
    // You can implement a modal or sidebar for report details here
    console.log('Report clicked:', report);
  };

  // Filter management functions - same as dashboard
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
    return null;
  }

  return (
    <DashboardLayout activeTab="map">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live Map</h1>
        <p className="text-gray-600 mt-2">Interactive map showing all ocean hazard reports</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <EnhancedMapDashboard 
          onReportClick={handleReportClick}
          height="70vh"
          filterSettings={filterSettings}
          onFilterChange={handleFilterChange}
          isFilterVisible={isFilterVisible}
          onToggleFilter={handleToggleFilter}
          verifiedReports={getVerifiedReports()}
          allReports={reports}
        />
      </div>
    </DashboardLayout>
  );
};

export default MapPage;

