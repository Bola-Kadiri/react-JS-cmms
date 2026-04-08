// src/hooks/dashboard/useDashboardQueries.ts
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/services/dashboardApi';
import { DashboardData } from '@/types/dashboard';

// Key factory for consistent query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  details: () => [...dashboardKeys.all, 'detail'] as const,
  detail: (code: string) => [...dashboardKeys.details(), code] as const,
};

// Default/placeholder dashboard data
const defaultDashboardData: DashboardData = {
  workspace_title: "Dashboard",
  user_info: {
    name: "User",
    role: "Loading..."
  },
  navigation_tabs: ["WORK REQUEST", "WORK ORDER", "WORK COMPLETION", "INVOICES", "PAYMENTS REQUISITION"],
  summary_cards: {
    work_request: [],
    work_order: []
  },
  chart_data: {
    labels: [],
    datasets: []
  },
  status_categories: {
    work_request: [],
    work_order: [],
    work_completion_certificate: [],
    payment_invoice: [],
    payment_requisition: []
  }
};

// Hook for fetching dashboard data
export const useDashboardQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: fetchDashboardData,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: defaultDashboardData, // Provide fallback data
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};