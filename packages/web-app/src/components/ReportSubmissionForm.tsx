import React, { useState, useRef } from 'react';
import { EventType, Report } from '@/types';
import { reportsAPI } from '@/utils/api';
import { useReports } from '@/contexts/ReportsContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface ReportSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
}

const ReportSubmissionForm: React.FC<ReportSubmissionFormProps> = ({
  isOpen,
  onClose,
  userLocation,
}) => {
  const { addReport } = useReports();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    event_type: '' as EventType | '',
    description: '',
    latitude: userLocation?.latitude || 0,
    longitude: userLocation?.longitude || 0,
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eventTypes: EventType[] = ['High Waves', 'Coastal Flooding', 'Unusual Tide', 'Other'];

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Unable to retrieve your location. Please enter coordinates manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      setImage(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.event_type) {
      setError('Please select an event type');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Please provide location coordinates');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reportData = {
        event_type: formData.event_type,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        image: image || undefined,
      };

      const newReport = await reportsAPI.createReport(reportData);
      
      // Add the new report to the global state for real-time updates
      addReport(newReport);
      
      addNotification({
        type: 'success',
        title: 'Report Submitted',
        message: 'Your hazard report has been successfully submitted and is now visible on the map.',
      });
      
      // Reset form
      setFormData({
        event_type: '',
        description: '',
        latitude: userLocation?.latitude || 0,
        longitude: userLocation?.longitude || 0,
      });
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Report Ocean Hazard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Type */}
            <div>
              <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Describe the hazard you observed..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-secondary text-sm w-full"
                >
                  📍 Use Current Location
                </button>
                {locationError && (
                  <p className="text-red-500 text-xs">{locationError}</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="latitude" className="block text-xs text-gray-600 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      step="any"
                      className="input-field text-sm"
                      placeholder="e.g., 19.0760"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-xs text-gray-600 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      step="any"
                      className="input-field text-sm"
                      placeholder="e.g., 72.8777"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportSubmissionForm;

