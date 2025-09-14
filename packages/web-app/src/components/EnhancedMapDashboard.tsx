import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Report } from '@/types';
import { reportsAPI } from '@/utils/api';

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});

const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});

const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

// Remove clustering for now to fix the dependency issue
// const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), {
//   ssr: false,
// });

export interface FilterSettings {
  eventTypes: string[];
  dateRange: string;
  severity: string;
  showVerified: boolean;
}

interface EnhancedMapDashboardProps {
  onReportClick?: (report: Report) => void;
  height?: string;
  filterSettings?: FilterSettings;
  onFilterChange?: (filterType: string, value: any) => void;
  isFilterVisible?: boolean;
  onToggleFilter?: () => void;
  verifiedReports?: Report[];
  allReports?: Report[];
}

const EnhancedMapDashboard: React.FC<EnhancedMapDashboardProps> = ({ 
  onReportClick, 
  height = '500px',
  filterSettings,
  onFilterChange,
  isFilterVisible,
  onToggleFilter,
  verifiedReports = [],
  allReports = []
}) => {
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Indian coastline center coordinates
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 6;

  const eventTypes = ['High Waves', 'Coastal Flooding', 'Unusual Tide', 'Other'];


  useEffect(() => {
    applyFilters();
  }, [allReports, filterSettings]);

  const applyFilters = () => {
    let filtered = [...allReports];

    // Only apply filters if filterSettings is defined
    if (filterSettings) {
      // Filter by event types
      if (filterSettings.eventTypes && filterSettings.eventTypes.length > 0) {
        filtered = filtered.filter(report => 
          filterSettings.eventTypes.includes(report.event_type)
        );
      }

      // Filter by date range
      if (filterSettings.dateRange && filterSettings.dateRange !== 'all') {
        const now = new Date();
        const daysAgo = parseInt(filterSettings.dateRange);
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(report => 
          new Date(report.created_at) >= cutoffDate
        );
      }

      // Filter by severity
      if (filterSettings.severity && filterSettings.severity !== 'all') {
        filtered = filtered.filter(report => {
          const isHighSeverity = report.event_type === 'High Waves' || report.event_type === 'Coastal Flooding';
          return filterSettings.severity === 'high' ? isHighSeverity : !isHighSeverity;
        });
      }
    }

    setFilteredReports(filtered);
  };

  const getMarkerColor = (eventType: string): string => {
    switch (eventType) {
      case 'High Waves':
        return '#ef4444';
      case 'Coastal Flooding':
        return '#dc2626';
      case 'Unusual Tide':
        return '#f59e0b';
      case 'Other':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  // Create custom markers with proper colors
  const createCustomMarker = (eventType: string) => {
    if (typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    const color = getMarkerColor(eventType);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map and reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Filter Toggle Button - Only show if filter functionality is available */}
      {onToggleFilter && (
        <button
          onClick={onToggleFilter}
          className="absolute top-4 left-4 z-[1001] bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center space-x-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium">Filters</span>
        </button>
      )}

      {/* Map Filters Panel - Only show if filter functionality is available */}
      {isFilterVisible && onToggleFilter && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs mt-12">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Map Filters</h4>
            <button
              onClick={onToggleFilter}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Verified Reports Filter */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterSettings?.showVerified || false}
                onChange={(e) => onFilterChange && onFilterChange('showVerified', e.target.checked)}
                className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
              />
              <span className="ml-2 text-sm text-gray-700">Verified Reports</span>
            </label>
          </div>
          
          {/* Event Type Filters */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Types</label>
            <div className="space-y-2">
              {eventTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterSettings?.eventTypes?.includes(type) || false}
                    onChange={(e) => {
                      if (filterSettings && onFilterChange) {
                        const newTypes = e.target.checked
                          ? [...(filterSettings.eventTypes || []), type]
                          : (filterSettings.eventTypes || []).filter(t => t !== type);
                        onFilterChange('eventTypes', newTypes);
                      }
                    }}
                    className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filterSettings?.dateRange || 'all'}
              onChange={(e) => onFilterChange && onFilterChange('dateRange', e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm focus:ring-ocean-500 focus:border-ocean-500"
            >
              <option value="all">All Time</option>
              <option value="1">Last 24 Hours</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={filterSettings?.severity || 'all'}
              onChange={(e) => onFilterChange && onFilterChange('severity', e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm focus:ring-ocean-500 focus:border-ocean-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="low">Low/Medium Severity</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredReports.length} of {allReports.length} reports
          </div>
        </div>
      )}

      {/* Map Container */}
      <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {filteredReports
            .filter(report => report.location && report.location.latitude && report.location.longitude)
            .map((report) => (
            <Marker
              key={report.id}
              position={[report.location.latitude, report.location.longitude]}
              icon={createCustomMarker(report.event_type)}
              eventHandlers={{
                click: () => {
                  if (onReportClick) {
                    onReportClick(report);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getMarkerColor(report.event_type) }}
                    ></div>
                    <h3 className="font-semibold text-gray-900">{report.event_type}</h3>
                  </div>
                  
                  {report.description && (
                    <p className="text-gray-700 text-sm mb-2">{report.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Reported by: {report.user_email}</p>
                    <p>Date: {formatDate(report.created_at)}</p>
                    {report.image_url && (
                      <img
                        src={`http://localhost:3001${report.image_url}`}
                        alt="Report image"
                        className="w-full h-20 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Verified Reports Markers */}
          {verifiedReports
            .filter(report => report.location && report.location.latitude && report.location.longitude)
            .map((report) => (
            <Marker
              key={`verified-${report.id}`}
              position={[report.location.latitude, report.location.longitude]}
              icon={createCustomMarker(report.event_type)}
              eventHandlers={{
                click: () => {
                  if (onReportClick) {
                    onReportClick(report);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getMarkerColor(report.event_type) }}
                    ></div>
                    <h3 className="font-semibold text-gray-900">{report.event_type}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                  
                  {report.description && (
                    <p className="text-gray-700 text-sm mb-2">{report.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Reported by: {report.user_email}</p>
                    <p>Date: {formatDate(report.created_at)}</p>
                    <p>Status: Verified</p>
                    {report.image_url && (
                      <img
                        src={`http://localhost:3001${report.image_url}`}
                        alt="Report image"
                        className="w-full h-20 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>High Waves</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-700"></div>
            <span>Coastal Flooding</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Unusual Tide</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Other</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMapDashboard;
