import React from 'react';
import { Report } from '@/types';

interface ActivityFeedProps {
  reports: Report[];
  onReportClick?: (report: Report) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ reports, onReportClick }) => {
  const getSeverityColor = (eventType: string) => {
    switch (eventType) {
      case 'High Waves':
      case 'Coastal Flooding':
        return 'text-red-600 bg-red-100';
      case 'Unusual Tide':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getSeverityText = (eventType: string) => {
    switch (eventType) {
      case 'High Waves':
      case 'Coastal Flooding':
        return 'High Severity';
      case 'Unusual Tide':
        return 'Medium Severity';
      default:
        return 'Low Severity';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const reportDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const recentReports = reports
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onReportClick?.(report)}
            >
              <div className="flex-shrink-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  report.event_type === 'High Waves' || report.event_type === 'Coastal Flooding' 
                    ? 'bg-red-500' 
                    : report.event_type === 'Unusual Tide' 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {report.description || report.event_type}
                  </p>
                  {report.user_role === 'official' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">{report.event_type}</span>
                  <span className="text-gray-300">•</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.event_type)}`}>
                    {getSeverityText(report.event_type)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(report.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;


