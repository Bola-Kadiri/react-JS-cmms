// src/services/dashboardApi.ts
import { api } from './apiClient';
import { DashboardData } from '@/types/dashboard';

const DASHBOARD_API_BASE = '/dashboard/api/dashboard';

// Fetch dashboard data
export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.get(`${DASHBOARD_API_BASE}/`);
    
    // Validate response data structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid dashboard data structure received');
    }
    
    return response.data as DashboardData;
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error; // Re-throw to let the hook handle it properly
  }
};