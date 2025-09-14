import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Report } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  Filter,
  Calendar,
  MapPin,
  Activity,
  Shield,
  Waves,
  Droplets,
  Wind
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { reports, loading } = useReports();
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedEventType, setSelectedEventType] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);


  // Calculate comprehensive analytics data
  const getAnalyticsData = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);
    
    // Filter reports by date range
    const filteredReports = reports.filter(report => 
      new Date(report.created_at) >= daysAgo
    );

    // Filter by event type if selected
    const finalReports = selectedEventType === 'all' 
      ? filteredReports 
      : filteredReports.filter(report => report.event_type === selectedEventType);

    const totalReports = finalReports.length;
    const verifiedReports = finalReports.filter(r => r.user_role === 'official').length;
    const pendingReports = totalReports - verifiedReports;
    
    // Event type breakdown
    const eventTypes = finalReports.reduce((acc, report) => {
      acc[report.event_type] = (acc[report.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Severity breakdown
    const severityBreakdown = finalReports.reduce((acc, report) => {
      const severity = report.severity_level || 'Medium';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Reports by day (last 30 days)
    const reportsByDay = Array.from({ length: parseInt(dateRange) }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = finalReports.filter(r => r.created_at.startsWith(dateStr)).length;
      return {
        date: dateStr,
        reports: count,
        verified: finalReports.filter(r => 
          r.created_at.startsWith(dateStr) && r.user_role === 'official'
        ).length
      };
    }).reverse();

    // Reports by hour (24-hour distribution)
    const reportsByHour = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      const count = finalReports.filter(r => {
        const reportHour = new Date(r.created_at).getHours().toString().padStart(2, '0');
        return reportHour === hour;
      }).length;
      return { hour: `${hour}:00`, count };
    });

    // Top locations
    const locationCounts = finalReports
      .filter(report => report.location && report.location.latitude && report.location.longitude)
      .reduce((acc, report) => {
        const location = `${report.location.latitude.toFixed(2)}, ${report.location.longitude.toFixed(2)}`;
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Response time analysis (for verified reports)
    const verifiedReportsWithTime = finalReports
      .filter(r => r.user_role === 'official')
      .map(report => {
        const created = new Date(report.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return { ...report, responseTime: hoursDiff };
      });

    const avgResponseTime = verifiedReportsWithTime.length > 0
      ? verifiedReportsWithTime.reduce((sum, r) => sum + r.responseTime, 0) / verifiedReportsWithTime.length
      : 0;

    return {
      totalReports,
      verifiedReports,
      pendingReports,
      eventTypes,
      severityBreakdown,
      reportsByDay,
      reportsByHour,
      topLocations,
      avgResponseTime,
      verificationRate: totalReports > 0 ? (verifiedReports / totalReports) * 100 : 0
    };
  };

  const analytics = getAnalyticsData();

  // Chart colors
  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
  
  const eventTypeColors = {
    'High Waves': '#EF4444',
    'Coastal Flooding': '#F59E0B',
    'Unusual Tide': '#10B981',
    'Storm Surge': '#8B5CF6',
    'Coastal Current': '#06B6D4',
    'Other': '#6B7280'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout activeTab="analytics">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive analysis of ocean hazard reports and trends</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Event Type:</label>
            <select 
              value={selectedEventType} 
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              <option value="High Waves">High Waves</option>
              <option value="Coastal Flooding">Coastal Flooding</option>
              <option value="Unusual Tide">Unusual Tide</option>
              <option value="Storm Surge">Storm Surge</option>
              <option value="Coastal Current">Coastal Current</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalReports}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% from last period</span>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Reports</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.verifiedReports}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{analytics.verificationRate.toFixed(1)}% verified</span>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.pendingReports}</p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-yellow-600">Awaiting verification</span>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.avgResponseTime.toFixed(1)}h</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-2.5h from last period</span>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Reports Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.reportsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              />
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="verified" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analytics.eventTypes).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(analytics.eventTypes).map(([name], index) => (
                  <Cell key={`cell-${index}`} fill={eventTypeColors[name as keyof typeof eventTypeColors] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hourly Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.reportsByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(analytics.severityBreakdown).map(([severity, count]) => ({ severity, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Locations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Report Locations</h3>
        <div className="space-y-4">
          {analytics.topLocations.map((location, index) => (
            <div key={location.location} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location #{index + 1}</p>
                  <p className="text-sm text-gray-500">{location.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{location.count} reports</p>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(location.count / analytics.topLocations[0].count) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {reports.slice(0, 5).map((report) => (
            <div key={report.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                report.user_role === 'official' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{report.event_type}</p>
                <p className="text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {report.user_role === 'official' ? 'Verified' : 'Pending'}
                </p>
                <p className="text-xs text-gray-500">{report.user_email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;