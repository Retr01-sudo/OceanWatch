import React, { useState, useEffect } from 'react';
import { Report } from '@/types';
import Icon from '@/components/icons/Icon';
import { DEFAULT_FILTER_STATE, SEVERITY_LEVELS, TIME_RANGE_OPTIONS, STATUS_OPTIONS, hasActiveFilters as checkActiveFilters } from '@/constants/filters';

export interface FilterOptions {
  severity: string[];
  timeRange: 'hour' | 'day' | 'week' | 'custom' | null;
  customFrom?: string;
  customTo?: string;
  status: 'all' | 'verified' | 'unverified';
  eventTypes: string[];
}

interface MapFilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onFiltersChange: (filters: FilterOptions) => void;
  reports: Report[];
  className?: string;
}

const MapFilterPanel: React.FC<MapFilterPanelProps> = ({
  isOpen,
  onToggle,
  onFiltersChange,
  reports,
  className = ''
}) => {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER_STATE);

  // Get unique event types from reports
  const availableEventTypes = React.useMemo(() => {
    const types = new Set(reports.map(r => r.event_type));
    return Array.from(types).sort();
  }, [reports]);

  // Use centralized constants
  const severityLevels = SEVERITY_LEVELS;
  const timeRangeOptions = TIME_RANGE_OPTIONS;
  const statusOptions = STATUS_OPTIONS;

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Handle severity toggle
  const toggleSeverity = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    handleFilterChange({ severity: newSeverity });
  };

  // Handle event type toggle
  const toggleEventType = (eventType: string) => {
    const newEventTypes = filters.eventTypes.includes(eventType)
      ? filters.eventTypes.filter(t => t !== eventType)
      : [...filters.eventTypes, eventType];
    handleFilterChange({ eventTypes: newEventTypes });
  };

  // Clear all filters and reset to defaults
  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
    onFiltersChange(DEFAULT_FILTER_STATE);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Use centralized filter checking
  const hasActiveFilters = checkActiveFilters(filters);
  const isDefaultState = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTER_STATE);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`
          fixed top-20 right-4 z-[70] bg-white rounded-lg shadow-lg border border-gray-200 
          p-3 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2 sm:top-20 md:top-20 lg:top-24 ${className}
        `}
        aria-label="Toggle map filters"
        aria-expanded={isOpen}
        aria-controls="filter-panel"
      >
        <div className="flex items-center space-x-2">
          <Icon name="filter" size={20} className="text-gray-600" aria-label="Filter" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
          <Icon 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={16} 
            className="text-gray-400 transition-transform duration-200" 
            aria-label={isOpen ? "Collapse" : "Expand"}
          />
        </div>
      </button>

      {/* Filter Panel */}
      <div 
        id="filter-panel"
        role="dialog"
        aria-labelledby="filter-panel-title"
        aria-modal="false"
        className={`
          fixed top-32 right-4 z-[60] bg-white rounded-lg shadow-xl border border-gray-200 
          w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-10rem)] overflow-y-auto transition-all duration-300 ease-in-out
          sm:w-80 sm:max-w-none sm:top-32 md:top-32 lg:top-36
          ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}
        `}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onToggle();
          }
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 id="filter-panel-title" className="text-lg font-semibold text-gray-900">Map Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Reset filters to default state"
            >
              Reset to Default
            </button>
          </div>

          {/* Severity Filter */}
          <fieldset className="mb-6">
            <legend className="text-sm font-medium text-gray-700 mb-3">Severity Level</legend>
            <div className="space-y-2" role="group" aria-labelledby="severity-group">
              {severityLevels.map((severity) => (
                <label key={severity} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.severity.includes(severity)}
                    onChange={() => toggleSeverity(severity)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        toggleSeverity(severity);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    aria-describedby={`severity-${severity.toLowerCase()}-desc`}
                  />
                  <span 
                    id={`severity-${severity.toLowerCase()}-desc`}
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium border
                      ${getSeverityColor(severity)}
                    `}
                  >
                    {severity}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Time Range Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Time Range</h4>
            <div className="space-y-2">
              {timeRangeOptions.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="timeRange"
                    value={option.value}
                    checked={filters.timeRange === option.value}
                    onChange={(e) => handleFilterChange({ 
                      timeRange: e.target.value as FilterOptions['timeRange']
                    })}
                    className="text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
              
              {/* Custom Date Range */}
              {filters.timeRange === 'custom' && (
                <div className="ml-6 mt-3 space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="datetime-local"
                      value={filters.customFrom || ''}
                      onChange={(e) => handleFilterChange({ customFrom: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="datetime-local"
                      value={filters.customTo || ''}
                      onChange={(e) => handleFilterChange({ customTo: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Verification Status</h4>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={filters.status === option.value}
                    onChange={(e) => handleFilterChange({ 
                      status: e.target.value as FilterOptions['status']
                    })}
                    className="text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Event Type Filter */}
          {availableEventTypes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Event Types</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableEventTypes.map((eventType) => (
                  <label key={eventType} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.eventTypes.includes(eventType)}
                      onChange={() => toggleEventType(eventType)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700">{eventType}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-1">
                {filters.severity.map(s => (
                  <span key={s} className={`px-2 py-1 rounded text-xs ${getSeverityColor(s)}`}>
                    {s}
                  </span>
                ))}
                {filters.timeRange && (
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 border border-blue-300">
                    {timeRangeOptions.find(t => t.value === filters.timeRange)?.label}
                  </span>
                )}
                {filters.status !== DEFAULT_FILTER_STATE.status && (
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 border border-purple-300">
                    {statusOptions.find(opt => opt.value === filters.status)?.label || filters.status}
                  </span>
                )}
                {filters.eventTypes.map(t => (
                  <span key={t} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 border border-gray-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[50] bg-black bg-opacity-10"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default MapFilterPanel;
