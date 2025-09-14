import React, { useState } from 'react';
import { Report } from '@/types';
import { useNotifications } from '@/contexts/NotificationContext';

interface AdminPanelProps {
  reports: Report[];
  onReportUpdate?: (reportId: number, updates: Partial<Report>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ reports, onReportUpdate }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { addNotification } = useNotifications();

  const handleVerifyReport = async (reportId: number) => {
    setIsVerifying(true);
    try {
      // Here you would make an API call to update the report status
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Report Verified',
        message: 'The report has been successfully verified and marked as official.',
      });

      // Update the report in the parent component
      if (onReportUpdate) {
        onReportUpdate(reportId, { user_role: 'official' });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: 'Failed to verify the report. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      // Here you would make an API call to delete the report
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Report Deleted',
        message: 'The report has been successfully deleted.',
      });

      // Remove the report from the list
      if (onReportUpdate) {
        onReportUpdate(reportId, { id: -1 }); // Mark for removal
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete the report. Please try again.',
      });
    }
  };

  const getSeverityBadge = (eventType: string) => {
    const isHighSeverity = eventType === 'High Waves' || eventType === 'Coastal Flooding';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isHighSeverity 
          ? 'bg-red-100 text-red-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isHighSeverity ? 'High Severity' : 'Medium Severity'}
      </span>
    );
  };

  const getStatusBadge = (userRole: string) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        userRole === 'official' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {userRole === 'official' ? 'Verified' : 'Pending'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
        <p className="text-sm text-gray-600 mt-1">Manage and verify hazard reports</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{report.event_type}</h4>
                    {getSeverityBadge(report.event_type)}
                    {getStatusBadge(report.user_role)}
                  </div>
                  
                  {report.description && (
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Reported by:</strong> {report.user_email}</p>
                    <p><strong>Date:</strong> {formatDate(report.created_at)}</p>
                    <p><strong>Location:</strong> {report.location ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}` : 'Location not available'}</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {report.user_role !== 'official' && (
                    <button
                      onClick={() => handleVerifyReport(report.id)}
                      disabled={isVerifying}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded transition-colors"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    Delete
                  </button>
                  
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedReport(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Report Details</h3>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.event_type}</p>
                  </div>
                  
                  {selectedReport.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.description}</p>
                    </div>
                  )}
                  
                  {selectedReport.image_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Image</label>
                      <img
                        src={`http://localhost:3001${selectedReport.image_url}`}
                        alt="Report image"
                        className="mt-1 w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.location ? `${selectedReport.location.latitude.toFixed(6)}, ${selectedReport.location.longitude.toFixed(6)}` : 'Location not available'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reporter</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.user_email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;


