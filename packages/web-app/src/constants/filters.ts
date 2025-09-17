/**
 * Centralized filter constants and default states
 * This ensures consistency across all components using filters
 */

import { FilterOptions } from '@/components/MapFilterPanel';

// Default filter state: show verified reports by default
export const DEFAULT_FILTER_STATE: FilterOptions = {
  severity: [],
  timeRange: null,
  status: 'verified', // Default to verified reports only for security
  eventTypes: []
};

// Available severity levels in order of priority
export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;

// Available time range options
export const TIME_RANGE_OPTIONS = [
  { value: 'hour', label: 'Past Hour' },
  { value: 'day', label: 'Past Day' },
  { value: 'week', label: 'Past Week' },
  { value: 'custom', label: 'Custom Range' }
] as const;

// Status filter options
export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Reports' },
  { value: 'verified', label: 'Verified Only' },
  { value: 'unverified', label: 'Unverified Only' }
] as const;

// Check if filters match default state
export const isDefaultFilterState = (filters: FilterOptions): boolean => {
  return JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTER_STATE);
};

// Check if any filters are active (different from defaults)
export const hasActiveFilters = (filters: FilterOptions): boolean => {
  return filters.severity.length > 0 || 
         filters.timeRange !== null || 
         filters.status !== DEFAULT_FILTER_STATE.status || 
         filters.eventTypes.length > 0;
};
