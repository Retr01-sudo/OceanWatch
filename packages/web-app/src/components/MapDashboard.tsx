import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Report } from '@/types';
import { reportsAPI } from '@/utils/api';

// Dynamically import MapContainer to avoid SSR issues
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

interface MapDashboardProps {
  onReportClick?: (report: Report) => void;
}

const MapDashboard: React.FC<MapDashboardProps> = ({ onReportClick }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Indian coastline center coordinates
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 6;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportsData = await reportsAPI.getAllReports();
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (eventType: string): string => {
    switch (eventType) {
      case 'High Waves':
        return '#ef4444'; // red
      case 'Coastal Flooding':
        return '#dc2626'; // dark red
      case 'Unusual Tide':
        return '#f59e0b'; // amber
      case 'Other':
        return '#6b7280'; // gray
      default:
        return '#3b82f6'; // blue
    }
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
    <div className="h-full w-full relative">
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
        
        {reports
          .filter(report => report.location && report.location.latitude && report.location.longitude)
          .map((report) => (
          <Marker
            key={report.id}
            position={[report.location.latitude, report.location.longitude]}
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
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
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
      
      {/* Reports Count */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{reports.length}</span> reports
        </p>
      </div>
    </div>
  );
};

export default MapDashboard;

