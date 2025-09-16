import axios, { AxiosResponse } from 'axios';
import { ApiResponse, LoginResponse, RegisterResponse, ReportsResponse, Report } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post('/auth/login', {
      email,
      password,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }
    
    return response.data.data!;
  },

  register: async (email: string, password: string, role: string = 'citizen'): Promise<RegisterResponse> => {
    const response: AxiosResponse<ApiResponse<RegisterResponse>> = await api.post('/auth/register', {
      email,
      password,
      role,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }
    
    return response.data.data!;
  },

  getProfile: async () => {
    const response: AxiosResponse<ApiResponse<{ user: any }>> = await api.get('/auth/profile');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get profile');
    }
    
    return response.data.data!.user;
  },
};

// Reports API functions
export const reportsAPI = {
  getAllReports: async (filters?: {
    bounds?: string;
    severity?: string[];
    from?: string;
    to?: string;
    status?: string;
    eventType?: string[];
  }): Promise<Report[]> => {
    const params: any = {};
    
    if (filters?.bounds) params.bounds = filters.bounds;
    if (filters?.severity?.length) params.severity = filters.severity.join(',');
    if (filters?.from) params.from = filters.from;
    if (filters?.to) params.to = filters.to;
    if (filters?.status) params.status = filters.status;
    if (filters?.eventType?.length) params.eventType = filters.eventType.join(',');
    
    const response: AxiosResponse<ApiResponse<ReportsResponse>> = await api.get('/reports', { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch reports');
    }
    
    return response.data.data!.reports;
  },

  createReport: async (reportData: {
    event_type: string;
    severity_level?: string;
    report_language?: string;
    brief_title?: string;
    description?: string;
    latitude: number;
    longitude: number;
    phone_number?: string;
    address?: string;
    image?: File;
  }): Promise<Report> => {
    const formData = new FormData();
    formData.append('event_type', reportData.event_type);
    formData.append('severity_level', reportData.severity_level || 'Medium');
    formData.append('report_language', reportData.report_language || 'English');
    formData.append('brief_title', reportData.brief_title || '');
    formData.append('description', reportData.description || '');
    formData.append('latitude', reportData.latitude.toString());
    formData.append('longitude', reportData.longitude.toString());
    formData.append('phone_number', reportData.phone_number || '');
    formData.append('address', reportData.address || '');
    
    if (reportData.image) {
      formData.append('image', reportData.image);
    }

    const response: AxiosResponse<ApiResponse<{ report: Report }>> = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create report');
    }
    
    return response.data.data;
  },

  getUserReports: async (): Promise<Report[]> => {
    const response: AxiosResponse<ApiResponse<ReportsResponse>> = await api.get('/reports/my');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user reports');
    }
    
    return response.data.data!.reports;
  },

  deleteReport: async (id: number): Promise<void> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/reports/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete report');
    }
  },

  bulkDeleteReports: async (reportIds: number[]): Promise<{ summary: any; successful: any[]; failed: any[] }> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/reports/bulk-delete', {
      reportIds
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to bulk delete reports');
    }
    
    return response.data.data!;
  },
};

export default api;

