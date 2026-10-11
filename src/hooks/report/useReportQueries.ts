// src/hooks/report/useReportQueries.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchDashboardAnalytics, fetchUserFacilityReport, UserFacilityReportParams } from '@/services/reportApi';

export const reportKeys = {
  all: ['reports'] as const,
  userFacility: (params: UserFacilityReportParams) =>
    [...reportKeys.all, 'user-facility', params] as const,
  dashboardAnalytics: () => [...reportKeys.all, 'dashboard-analytics'] as const,
};

// Server-side paginated/filtered — unlike most of this app's list hooks,
// this report can hold thousands of rows, so we deliberately don't fetch
// everything and slice client-side.
export const useUserFacilityReportQuery = (params: UserFacilityReportParams) => {
  return useQuery({
    queryKey: reportKeys.userFacility(params),
    queryFn: () => fetchUserFacilityReport(params),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });
};

// The org-wide analytics dashboard — aggregates only, safe to refresh
// periodically rather than on every keystroke.
export const useDashboardAnalyticsQuery = () => {
  return useQuery({
    queryKey: reportKeys.dashboardAnalytics(),
    queryFn: fetchDashboardAnalytics,
    staleTime: 60000,
    refetchInterval: 5 * 60 * 1000,
  });
};
