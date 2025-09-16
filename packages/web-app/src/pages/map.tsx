import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import DashboardLayout from '@/components/DashboardLayout';
import FilteredMapView from '@/components/FilteredMapView';
import ReportDetailModal from '@/components/ReportDetailModal';
import { Report } from '@/types';

const MapPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { reports, loading } = useReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);


  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    // You can implement a modal or sidebar for report details here
    console.log('Report clicked:', report);
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
        <FilteredMapView
          onReportClick={handleReportClick}
          height="calc(100vh - 120px)"
          showLegend={true}
        />
      </div>

      {/* Report Details Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </DashboardLayout>
  );
};

export default MapPage;

