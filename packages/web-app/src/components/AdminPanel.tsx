import React, { useState } from 'react';
import { Report } from '@/types';
import { useNotifications } from '@/contexts/NotificationContext';
import { useReports } from '@/contexts/ReportsContext';
import AdminDeleteModal from './AdminDeleteModal';

/**
 * IMPORTANT: Report Verification Logic
 * 
 * This component has been fixed to use the actual database `is_verified` field
 * instead of making assumptions based on user roles.
 * 
 * KEY CHANGES:
 * 1. getStatusBadge() now checks `report.is_verified` instead of `user_role === 'official'`
 * 2. Verify button shows for `!report.is_verified` instead of `user_role !== 'official'`
 * 3. handleVerifyReport() calls the new PATCH /api/reports/:id/verify endpoint
 * 4. Verification updates the actual `is_verified` field in the database
 * 
 * This ensures:
 * - Admin reports are NOT automatically shown as verified
 * - Only explicitly verified reports show the "Verified" badge
 * - Filtering works correctly based on actual database state
 * - No UI-side assumptions about verification status
 */

interface AdminPanelProps {
  reports: Report[];
  onReportUpdate?: (reportId: number, updates: Partial<Report>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ reports, onReportUpdate }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const { addNotification } = useNotifications();
  const { deleteReportFromServer, bulkDeleteReports } = useReports();

  const handleVerifyReport = async (reportId: number) => {
    setIsVerifying(true);
    try {
      // Make API call to verify the report (update is_verified field)
      const response = await fetch(`http://localhost:3001/api/reports/${reportId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify report');
      }
      
      addNotification({
        type: 'success',
        title: 'Report Verified',
        message: 'The report has been successfully verified in the database.',
      });

      // Update the report in the parent component with actual verification status
      if (onReportUpdate) {
        onReportUpdate(reportId, { is_verified: true });
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

  const handleDeleteReport = (report: Report) => {
    setReportToDelete(report);
    setDeleteModalOpen(true);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;

    try {
      await deleteReportFromServer(reportToDelete.id);
      addNotification({
        type: 'success',
        title: 'Report Deleted',
        message: 'The report has been successfully deleted.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete the report. Please try again.',
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedReports.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Reports Selected',
        message: 'Please select reports to delete.',
      });
      return;
    }
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteReports(selectedReports);
      addNotification({
        type: 'success',
        title: 'Reports Deleted',
        message: `Successfully deleted ${selectedReports.length} reports.`,
      });
      setSelectedReports([]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Bulk Deletion Failed',
        message: 'Failed to delete some reports. Please try again.',
      });
    }
  };

  const toggleReportSelection = (reportId: number) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectAllReports = () => {
    setSelectedReports(reports.map(r => r.id));
  };

  const clearSelection = () => {
    setSelectedReports([]);
  };

  const getSeverityBadge = (severity: string) => {
    const severityColors = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800', 
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        severityColors[severity as keyof typeof severityColors] || 'bg-gray-100 text-gray-800'
      }`}>
        {severity || 'Medium'}
      </span>
    );
  };

  // Display verification status based on actual database is_verified field
  const getStatusBadge = (report: Report) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        report.is_verified === true
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {report.is_verified === true ? 'Verified' : 'Unverified'}
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
            <p className="text-sm text-gray-600 mt-1">Manage and verify hazard reports</p>
          </div>
          
          {/* Bulk Actions */}
          <div className="flex items-center space-x-3">
            {selectedReports.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedReports.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAllReports}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                Select All
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Checkbox for bulk selection */}
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => toggleReportSelection(report.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{report.event_type}</h4>
                      {getSeverityBadge(report.severity_level || 'Medium')}
                      {getStatusBadge(report)}
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
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {!report.is_verified && (
                    <button
                      onClick={() => handleVerifyReport(report.id)}
                      disabled={isVerifying}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded transition-colors"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteReport(report)}
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

      {/* Admin Delete Modals */}
      <AdminDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReportToDelete(null);
        }}
        onConfirm={confirmDeleteReport}
        report={reportToDelete || undefined}
        type="single"
      />

      <AdminDeleteModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        reports={reports.filter(r => selectedReports.includes(r.id))}
        type="bulk"
      />

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
                    <p className="mt-1 text-sm text-gray-900">{selectedReport?.event_type}</p>
                  </div>
                  
                  {selectedReport?.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.description}</p>
                    </div>
                  )}
                  
                  {selectedReport?.image_url && (
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
                      {selectedReport?.location ? `${selectedReport.location.latitude.toFixed(6)}, ${selectedReport.location.longitude.toFixed(6)}` : 'Location not available'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reporter</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport?.user_email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReport?.created_at || '')}</p>
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


