import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Report } from '@/types';
import { reportsAPI } from '@/utils/api';

interface ReportsContextType {
  reports: Report[];
  loading: boolean;
  error: string | null;
  refreshReports: () => Promise<void>;
  addReport: (report: Report) => void;
  updateReport: (reportId: number, updates: Partial<Report>) => void;
  deleteReport: (reportId: number) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

interface ReportsProviderProps {
  children: ReactNode;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports from API
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

  // Refresh reports (public method)
  const refreshReports = async () => {
    await fetchReports();
  };

  // Add a new report to the state
  const addReport = (report: Report) => {
    setReports(prevReports => [report, ...prevReports]);
  };

  // Update an existing report
  const updateReport = (reportId: number, updates: Partial<Report>) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId ? { ...report, ...updates } : report
      )
    );
  };

  // Delete a report
  const deleteReport = (reportId: number) => {
    setReports(prevReports =>
      prevReports.filter(report => report.id !== reportId)
    );
  };

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, []);

  const value: ReportsContextType = {
    reports,
    loading,
    error,
    refreshReports,
    addReport,
    updateReport,
    deleteReport,
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
