/**
 * MapView Component - Clean, rebuilt map component for OceanWatch
 * Features severity-based marker colors and real-time updates
 */

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Report } from '@/types';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface MapViewProps {
  reports: Report[];
  onReportClick?: (report: Report) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
}

// Severity-based marker colors as requested
const SEVERITY_COLORS = {
  'Low': '#22c55e',      // Green
  'Medium': '#eab308',   // Yellow  
  'High': '#f97316',     // Orange
  'Critical': '#ef4444'  // Red
} as const;

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // Indian coastline
const DEFAULT_ZOOM = 6;

const MapView: React.FC<MapViewProps> = ({
  reports,
  onReportClick,
  height = '500px',
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  showLegend = true
}) => {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [customIcons, setCustomIcons] = useState<{ [key: string]: any }>({});
  const mapRef = useRef<any>(null);

  // Create custom markers based on severity level
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        const icons: { [key: string]: any } = {};
        
        Object.entries(SEVERITY_COLORS).forEach(([severity, color]) => {
          icons[severity] = L.divIcon({
            className: 'custom-severity-marker',
            html: `
              <div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 10px;
                color: white;
              ">
                ${severity.charAt(0)}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
          });
        });
        
        setCustomIcons(icons);
        setLeafletLoaded(true);
      });
    }
  }, []);

  // Filter reports that have valid coordinates
  const validReports = reports.filter(report => 
    report.location?.latitude && 
    report.location?.longitude &&
    !isNaN(report.location.latitude) &&
    !isNaN(report.location.longitude)
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityIcon = (severityLevel?: string) => {
    const severity = severityLevel || 'Medium';
    return customIcons[severity] || customIcons['Medium'];
  };

  if (!leafletLoaded) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-[10]">
      {/* Map Container */}
      <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-gray-200 z-[10]">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Render markers for each valid report */}
          {validReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.location!.latitude, report.location!.longitude]}
              icon={getSeverityIcon(report.severity_level)}
              eventHandlers={{
                click: () => {
                  if (onReportClick) {
                    onReportClick(report);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-3 min-w-[250px] max-w-[300px]">
                  {/* Header with severity and verification status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: SEVERITY_COLORS[report.severity_level as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.Medium }}
                      />
                      <span className="font-semibold text-gray-900">{report.event_type}</span>
                    </div>
                    {report.is_verified && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Severity Level */}
                  {report.severity_level && (
                    <div className="mb-2">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: SEVERITY_COLORS[report.severity_level as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.Medium }}
                      >
                        {report.severity_level} Severity
                      </span>
                    </div>
                  )}

                  {/* Brief Title */}
                  {report.brief_title && (
                    <h4 className="font-medium text-gray-900 mb-2">{report.brief_title}</h4>
                  )}
                  
                  {/* Description */}
                  {report.description && (
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{report.description}</p>
                  )}

                  {/* Image */}
                  {report.image_url && (
                    <img
                      src={`http://localhost:3001${report.image_url}`}
                      alt="Report image"
                      className="w-full h-24 object-cover rounded mb-3"
                    />
                  )}
                  
                  {/* Footer Info */}
                  <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
                    <p><strong>Reported by:</strong> {report.user_email}</p>
                    <p><strong>Date:</strong> {formatDate(report.created_at)}</p>
                    {report.address && <p><strong>Location:</strong> {report.address}</p>}
                    <p><strong>Coordinates:</strong> {report.location!.latitude.toFixed(4)}, {report.location!.longitude.toFixed(4)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Severity Legend */}
      {showLegend && (
        <div className="absolute bottom-4 right-4 z-[35] bg-white rounded-lg shadow-lg p-3 border border-gray-200 w-48 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-6 lg:right-6 xl:w-52">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Severity Levels</h4>
          <div className="space-y-2">
            {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
              <div key={severity} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 truncate">{severity}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Showing {validReports.length} of {reports.length} reports
            </p>
          </div>
        </div>
      )}

      {/* Reports Count Badge */}
      <div className="absolute top-4 left-4 z-[30] bg-white rounded-lg shadow-lg px-3 py-2 border border-gray-200 sm:top-6 sm:left-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-900">
            {validReports.length} Active Reports
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
