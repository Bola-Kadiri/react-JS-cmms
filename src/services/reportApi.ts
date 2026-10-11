// src/services/reportApi.ts
import { api } from './apiClient';
import { UserFacilityReportRow } from '@/types/report';
import { DashboardAnalytics } from '@/types/reportAnalytics';

const USER_FACILITY_REPORT_API = '/report/api/user-facility';
const DASHBOARD_ANALYTICS_API = '/report/api/dashboard';

export interface UserFacilityReportResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserFacilityReportRow[];
}

export interface UserFacilityReportParams {
  page?: number;
  page_size?: number;
  search?: string;
  facility?: number | string;
}

// Fetch a page of the User Facility Report.
//
// The backend (report/api/views.py) always wraps responses as
// { success, message, data }, and for a list endpoint `data` is the
// DRF-paginated object itself: { count, next, previous, results }.
export const fetchUserFacilityReport = async (
  params: UserFacilityReportParams = {}
): Promise<UserFacilityReportResponse> => {
  try {
    const response = await api.get(`${USER_FACILITY_REPORT_API}/`, { params });

    if (response.data?.success && response.data.data) {
      const { count, next, previous, results } = response.data.data;
      return {
        count: count ?? 0,
        next: next ?? null,
        previous: previous ?? null,
        results: Array.isArray(results) ? results : [],
      };
    }

    return { count: 0, next: null, previous: null, results: [] };
  } catch (error) {
    console.error('Error fetching user facility report:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

// Fetch the org-wide CMMS analytics dashboard (status breakdowns, backlog
// aging, cycle times, financial totals, trends, and generated insights).
export const fetchDashboardAnalytics = async (): Promise<DashboardAnalytics | null> => {
  try {
    const response = await api.get(`${DASHBOARD_ANALYTICS_API}/`);

    if (response.data?.success && response.data.data) {
      return response.data.data as DashboardAnalytics;
    }

    return null;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return null;
  }
};
