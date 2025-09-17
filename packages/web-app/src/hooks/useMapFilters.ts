import { useState, useEffect } from 'react';
import { FilterOptions } from '@/components/MapFilterPanel';
import { DEFAULT_FILTER_STATE, hasActiveFilters as checkActiveFilters } from '@/constants/filters';

const FILTER_STORAGE_KEY = 'oceanwatch_map_filters';

export const useMapFilters = () => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER_STATE);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }, []);

  // Save filters to localStorage when they change
  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(prev => !prev);
  };

  // Close filter panel
  const closeFilterPanel = () => {
    setIsFilterPanelOpen(false);
  };

  // Use centralized filter checking
  const hasActiveFilters = checkActiveFilters(filters);

  return {
    isFilterPanelOpen,
    filters,
    hasActiveFilters,
    toggleFilterPanel,
    closeFilterPanel,
    updateFilters
  };
};
