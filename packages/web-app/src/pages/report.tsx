import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useReports } from '@/contexts/ReportsContext';
import DashboardLayout from '@/components/DashboardLayout';
import { reportsAPI } from '@/utils/api';

interface HazardType {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const ReportPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();
  const { addReport } = useReports();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    event_type: '',
    severity_level: 'Medium',
    report_language: 'English',
    brief_title: '',
    description: '',
    phone_number: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const hazardTypes: HazardType[] = [
    {
      id: 'tsunami',
      name: 'Tsunami',
      icon: '🌊',
      description: 'Large ocean waves caused by seismic activity',
      color: 'bg-red-500'
    },
    {
      id: 'storm-surge',
      name: 'Storm Surge',
      icon: '💨',
      description: 'Rise in sea level due to storm conditions',
      color: 'bg-orange-500'
    },
    {
      id: 'high-waves',
      name: 'High Waves',
      icon: '🌊',
      description: 'Unusually large waves affecting coastal areas',
      color: 'bg-yellow-500'
    },
    {
      id: 'swell-surge',
      name: 'Swell Surge',
      icon: '📈',
      description: 'Long-period waves causing coastal flooding',
      color: 'bg-blue-500'
    },
    {
      id: 'coastal-current',
      name: 'Coastal Current',
      icon: '⚡',
      description: 'Strong nearshore currents',
      color: 'bg-purple-500'
    },
    {
      id: 'coastal-flooding',
      name: 'Coastal Flooding',
      icon: '💧',
      description: 'Water overflowing onto normally dry coastal land',
      color: 'bg-cyan-500'
    },
    {
      id: 'coastal-damage',
      name: 'Coastal Damage',
      icon: '⚠️',
      description: 'Physical damage to coastal infrastructure',
      color: 'bg-red-600'
    },
    {
      id: 'unusual-tide',
      name: 'Unusual Tide',
      icon: '🌊',
      description: 'Abnormal tidal behavior or levels',
      color: 'bg-green-500'
    }
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.log('Could not get location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHazardTypeSelect = (hazardType: HazardType) => {
    setFormData(prev => ({
      ...prev,
      event_type: hazardType.name,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          addNotification({
            type: 'success',
            title: 'Location Updated',
            message: 'Your current location has been set.',
          });
        },
        (error) => {
          addNotification({
            type: 'error',
            title: 'Location Error',
            message: 'Could not get your current location.',
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.event_type) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a hazard type.',
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide location information.',
      });
      return;
    }

    // Validate that latitude and longitude are valid numbers
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide valid latitude and longitude coordinates.',
      });
      return;
    }

    if (lat < -90 || lat > 90) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Latitude must be between -90 and 90 degrees.',
      });
      return;
    }

    if (lng < -180 || lng > 180) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Longitude must be between -180 and 180 degrees.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newReport = await reportsAPI.createReport({
        event_type: formData.event_type,
        description: formData.description,
        latitude: lat,
        longitude: lng,
      });
      
      // Add the new report to the global state for real-time updates
      addReport(newReport);
      
      addNotification({
        type: 'success',
        title: 'Report Submitted',
        message: 'Your hazard report has been successfully submitted and is now visible on the map.',
      });
      router.push('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit your report. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout activeTab="report">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Report Ocean Hazard</h1>
          <p className="text-gray-600 mt-2">Help protect our coastal communities by reporting hazards</p>
        </div>

        {/* Emergency Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Emergency?</h3>
              <p className="text-red-700 text-sm">
                If this is a life-threatening situation, call emergency services (112) immediately before filing this report.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hazard Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hazard Information</h2>
            
            {/* Hazard Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Hazard Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hazardTypes.map((hazard) => (
                  <button
                    key={hazard.id}
                    type="button"
                    onClick={() => handleHazardTypeSelect(hazard)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.event_type === hazard.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{hazard.icon}</div>
                      <h3 className="font-medium text-gray-900 text-sm">{hazard.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{hazard.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
              <select
                name="severity_level"
                value={formData.severity_level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low - Minimal risk</option>
                <option value="Medium">Medium - Moderate risk</option>
                <option value="High">High - Significant risk</option>
                <option value="Critical">Critical - Life-threatening</option>
              </select>
            </div>

            {/* Report Language */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Language</label>
              <select
                name="report_language"
                value={formData.report_language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Punjabi">Punjabi</option>
              </select>
            </div>

            {/* Brief Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Brief Title</label>
              <input
                type="text"
                name="brief_title"
                value={formData.brief_title}
                onChange={handleInputChange}
                placeholder="e.g., High waves at Marina Beach"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Detailed Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe what you observed, when it started, current conditions, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </h2>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Use Current Location
              </button>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or enter address manually</label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address or landmark"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 12.9716"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 77.5946"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photos & Videos Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Photos & Videos (Optional)
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Choose Files
                </button>
                <button
                  type="button"
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photo
                </button>
              </div>
              <p className="text-sm text-gray-600">Upload relevant photos or videos. Maximum 10MB per file.</p>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information (Optional)</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="For follow-up questions (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ReportPage;
