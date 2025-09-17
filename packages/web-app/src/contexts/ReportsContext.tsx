import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Report } from '@/types';
import { reportsAPI } from '@/utils/api';
import { FilterOptions } from '@/components/MapFilterPanel';
import { DEFAULT_FILTER_STATE } from '@/constants/filters';

interface ReportsContextType {
  reports: Report[];
  filteredReports: Report[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  refreshReports: (filters?: FilterOptions) => Promise<void>;
  addReport: (report: Report) => void;
  updateReport: (reportId: number, updates: Partial<Report>) => void;
  deleteReport: (reportId: number) => void;
  deleteReportFromServer: (reportId: number) => Promise<void>;
  bulkDeleteReports: (reportIds: number[]) => Promise<void>;
  setFilters: (filters: FilterOptions) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

interface ReportsProviderProps {
  children: ReactNode;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FilterOptions>(DEFAULT_FILTER_STATE);

  // Apply filters to reports array (client-side filtering for real-time updates)
  const applyFiltersToReports = (reportsArray: Report[], filterOptions: FilterOptions) => {
    let filtered = [...reportsArray];
    
    // Apply severity filter
    if (filterOptions.severity.length > 0) {
      filtered = filtered.filter(report => 
        report.severity_level && filterOptions.severity.includes(report.severity_level)
      );
    }
    
    // Apply event type filter
    if (filterOptions.eventTypes.length > 0) {
      filtered = filtered.filter(report => 
        filterOptions.eventTypes.includes(report.event_type)
      );
    }
    
    // Apply status filter
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(report => {
        if (filterOptions.status === 'verified') {
          return report.is_verified === true;
        } else if (filterOptions.status === 'unverified') {
          return report.is_verified === false;
        }
        return true;
      });
    }
    
    // Apply time range filter
    if (filterOptions.timeRange) {
      const now = new Date();
      let cutoffTime: Date;
      
      switch (filterOptions.timeRange) {
        case 'hour':
          cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (filterOptions.customFrom) {
            const fromTime = new Date(filterOptions.customFrom);
            filtered = filtered.filter(report => new Date(report.created_at) >= fromTime);
          }
          if (filterOptions.customTo) {
            const toTime = new Date(filterOptions.customTo);
            filtered = filtered.filter(report => new Date(report.created_at) <= toTime);
          }
          setFilteredReports(filtered);
          return;
        default:
          setFilteredReports(filtered);
          return;
      }
      
      if (cutoffTime) {
        filtered = filtered.filter(report => new Date(report.created_at) >= cutoffTime);
      }
    }
    
    setFilteredReports(filtered);
  };
  
  // Convert filters to API format
  const convertFiltersToAPI = (filterOptions: FilterOptions) => {
    const apiFilters: any = {};
    
    if (filterOptions.severity.length > 0) {
      apiFilters.severity = filterOptions.severity;
    }
    
    if (filterOptions.eventTypes.length > 0) {
      apiFilters.eventType = filterOptions.eventTypes;
    }
    
    if (filterOptions.status !== 'all') {
      apiFilters.status = filterOptions.status;
    }
    
    if (filterOptions.timeRange) {
      const now = new Date();
      switch (filterOptions.timeRange) {
        case 'hour':
          apiFilters.from = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
          break;
        case 'day':
          apiFilters.from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'week':
          apiFilters.from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'custom':
          if (filterOptions.customFrom) apiFilters.from = filterOptions.customFrom;
          if (filterOptions.customTo) apiFilters.to = filterOptions.customTo;
          break;
      }
    }
    
    return apiFilters;
  };

  // Fetch reports from API with filters
  const fetchReports = async (filterOptions?: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);
      const currentFilters = filterOptions || filters;
      const apiFilters = convertFiltersToAPI(currentFilters);
      const reportsData = await reportsAPI.getAllReports(apiFilters);
      setReports(reportsData);
      // Apply client-side filters for consistency
      applyFiltersToReports(reportsData, currentFilters);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Refresh reports (public method)
  const refreshReports = async (filterOptions?: FilterOptions) => {
    await fetchReports(filterOptions || filters);
  };

  // Set filters and apply them immediately to current data
  const setFilters = (newFilters: FilterOptions) => {
    setFiltersState(newFilters);
    // Apply filters immediately to current reports for instant feedback
    applyFiltersToReports(reports, newFilters);
    // Also fetch from server to ensure data consistency
    fetchReports(newFilters);
  };

  // Add a new report to the state and re-apply current filters
  const addReport = (report: Report) => {
    setReports(prevReports => {
      const newReports = [report, ...prevReports];
      // Re-apply current filters to include the new report if it matches
      applyFiltersToReports(newReports, filters);
      return newReports;
    });
  };

  // Update an existing report and re-apply filters
  const updateReport = (reportId: number, updates: Partial<Report>) => {
    setReports(prevReports => {
      const updatedReports = prevReports.map(report =>
        report.id === reportId ? { ...report, ...updates } : report
      );
      // Re-apply current filters after update
      applyFiltersToReports(updatedReports, filters);
      return updatedReports;
    });
  };

  // Delete a report from local state only and re-apply filters
  const deleteReport = (reportId: number) => {
    setReports(prevReports => {
      const filteredReports = prevReports.filter(report => report.id !== reportId);
      // Re-apply current filters after deletion
      applyFiltersToReports(filteredReports, filters);
      return filteredReports;
    });
  };

  // Delete a report from server and update local state
  const deleteReportFromServer = async (reportId: number) => {
    try {
      await reportsAPI.deleteReport(reportId);
      // Refresh reports from server to ensure permanent deletion
      await refreshReports(filters);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  };

  // Bulk delete reports from server and update local state
  const bulkDeleteReports = async (reportIds: number[]) => {
    try {
      await reportsAPI.bulkDeleteReports(reportIds);
      // Refresh reports from server to ensure permanent deletion
      await refreshReports(filters);
    } catch (error) {
      console.error('Error bulk deleting reports:', error);
      throw error;
    }
  };

  // Initial fetch with default filters
  useEffect(() => {
    fetchReports(DEFAULT_FILTER_STATE);
  }, []);

  const value: ReportsContextType = {
    reports,
    filteredReports,
    loading,
    error,
    filters,
    refreshReports,
    addReport,
    updateReport,
    deleteReport,
    deleteReportFromServer,
    bulkDeleteReports,
    setFilters
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};

// Custom hook to use the reports context
export const useReports = (): ReportsContextType => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
