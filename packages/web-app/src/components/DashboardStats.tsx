import React from 'react';
import { Report } from '@/types';
import Icon from '@/components/icons/Icon';

/**
 * IMPORTANT: Verification Status Logic
 * 
 * This component correctly uses the database `is_verified` field to count verified reports.
 * 
 * PREVIOUS ISSUE: Was incorrectly counting reports based on `user_role === 'official'`
 * CURRENT FIX: Now counts reports based on `is_verified === true`
 * 
 * This ensures that:
 * - Only reports explicitly verified in the database are counted as "verified"
 * - Admin-submitted reports are NOT automatically counted as verified
 * - The count matches the actual database state
 */

interface DashboardStatsProps {
  reports: Report[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ reports }) => {
  const totalReports = reports.length;
  const criticalAlerts = reports.filter(r => 
    r.event_type === 'High Waves' || r.event_type === 'Coastal Flooding'
  ).length;
  // Count reports that are actually verified in the database
  const verifiedReports = reports.filter(r => 
    r.is_verified === true
  ).length;
  const todayReports = reports.filter(r => {
    const today = new Date();
    const reportDate = new Date(r.created_at);
    return reportDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      name: 'Total Reports',
      value: totalReports,
      iconName: 'eye',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Critical Alerts',
      value: criticalAlerts,
      iconName: 'alert-triangle',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      name: 'Verified Reports',
      value: verifiedReports,
      iconName: 'check-circle',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: "Today's Reports",
      value: todayReports,
      iconName: 'calendar',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <Icon name={stat.iconName as any} size={24} className={stat.textColor} aria-label={stat.name} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
