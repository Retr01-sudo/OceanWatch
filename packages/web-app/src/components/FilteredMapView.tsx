/**
 * FilteredMapView Component - Map with integrated filter panel
 * Combines MapView with MapFilterPanel for a complete filtering experience
 */

import React, { useState, useEffect } from 'react';
import { useReports } from '@/contexts/ReportsContext';
import MapView from './MapView';
import MapFilterPanel, { FilterOptions } from './MapFilterPanel';
import { Report } from '@/types';

interface FilteredMapViewProps {
  height?: string;
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
  onReportClick?: (report: any) => void;
}

const FilteredMapView: React.FC<FilteredMapViewProps> = ({
  height = "400px",
  center = [20.5937, 78.9629], // Center of India
  zoom = 6,
  showLegend = true,
  onReportClick
}) => {
  const { filteredReports, setFilters, loading, error } = useReports();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">Error loading map data</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-[10]">
      {/* Map Container */}
      <div className="relative z-[10]">
        <MapView
          reports={filteredReports}
          onReportClick={onReportClick}
          height={height}
          center={center}
          zoom={zoom}
          showLegend={showLegend}
        />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[15]">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Updating map...</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <MapFilterPanel
        isOpen={isFilterPanelOpen}
        onToggle={toggleFilterPanel}
        onFiltersChange={handleFiltersChange}
        reports={filteredReports}
      />

      {/* Results Summary */}
      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm text-gray-600 z-[30] sm:bottom-6 sm:left-6">
          Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default FilteredMapView;
