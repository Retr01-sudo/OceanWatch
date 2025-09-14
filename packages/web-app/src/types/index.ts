export interface User {
  id: number;
  email: string;
  role: 'citizen' | 'official';
  created_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Report {
  id: number;
  event_type: string;
  severity_level?: string;
  report_language?: string;
  brief_title?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  phone_number?: string;
  address?: string;
  is_verified?: boolean;
  created_at: string;
  user_email: string;
  user_role: string;
  location?: Location;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface ReportsResponse {
  reports: Report[];
}

export type EventType = 'Tsunami' | 'Storm Surge' | 'High Waves' | 'Swell Surge' | 'Coastal Current' | 'Coastal Flooding' | 'Coastal Damage' | 'Unusual Tide';

