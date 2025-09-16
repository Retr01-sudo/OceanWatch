/**
 * ReportDetailModal Component - Reusable modal for displaying report details
 * Ensures proper z-index layering above map and other UI elements
 */

import React from 'react';
import { Report } from '@/types';
import Icon from '@/components/icons/Icon';

interface ReportDetailModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose
}) => {
  if (!isOpen || !report) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[70] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Icon 
                name="alert-triangle" 
                size={24} 
                className="text-orange-600" 
                aria-label="Report" 
              />
              <h2 
                id="report-modal-title" 
                className="text-xl font-semibold text-gray-900"
              >
                {report.event_type}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close modal"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Status and Severity */}
            <div className="flex items-center space-x-3 mb-6">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(report.severity_level || 'Medium')}`}
              >
                {report.severity_level || 'Medium'} Severity
              </span>
              {report.is_verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  <Icon name="check-circle" size={16} className="mr-1" />
                  Verified
                </span>
              )}
            </div>

            {/* Brief Title */}
            {report.brief_title && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {report.brief_title}
                </h3>
              </div>
            )}

            {/* Description */}
            {report.description && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed">
                  {report.description}
                </p>
              </div>
            )}

            {/* Image */}
            {report.image_url && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Image</h4>
                <img
                  src={`http://localhost:3001${report.image_url}`}
                  alt="Report evidence"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reporter Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Reporter Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="user" size={16} className="text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{report.user_email}</span>
                  </div>
                  {report.phone_number && (
                    <div className="flex items-center space-x-2">
                      <Icon name="phone" size={16} className="text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-900">{report.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Icon name="calendar" size={16} className="text-gray-400" />
                    <span className="text-gray-600">Reported:</span>
                    <span className="text-gray-900">{formatDate(report.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Location Information
                </h4>
                <div className="space-y-2 text-sm">
                  {report.address && (
                    <div className="flex items-start space-x-2">
                      <Icon name="map-pin" size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="text-gray-900">{report.address}</p>
                      </div>
                    </div>
                  )}
                  {report.location && (
                    <div className="flex items-center space-x-2">
                      <Icon name="map-pin" size={16} className="text-gray-400" />
                      <span className="text-gray-600">Coordinates:</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {(report.report_language && report.report_language !== 'English') && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Icon name="info" size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Report submitted in: <strong>{report.report_language}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportDetailModal;
