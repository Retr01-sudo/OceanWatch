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
  getAllReports: async (bounds?: string): Promise<Report[]> => {
    const params = bounds ? { bounds } : {};
    const response: AxiosResponse<ApiResponse<ReportsResponse>> = await api.get('/reports', { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch reports');
    }
    
    return response.data.data!.reports;
  },

  createReport: async (reportData: {
    event_type: string;
    description?: string;
    latitude: number;
    longitude: number;
    image?: File;
  }): Promise<Report> => {
    const formData = new FormData();
    formData.append('event_type', reportData.event_type);
    formData.append('description', reportData.description || '');
    formData.append('latitude', reportData.latitude.toString());
    formData.append('longitude', reportData.longitude.toString());
    
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
    
    return response.data.data!.report;
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
};

export default api;

