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
  current_date: "",
  user_info: {
    name: "User",
    role: "Loading..."
  },
  navigation_tabs: ["WORK REQUEST", "WORK ORDER", "WORK COMPLETION", "INVOICES", "PAYMENT REQUISITION"],
  summary_cards: {
    work_request: [],
    work_order: [],
    work_completion: [],
    invoices: [],
    payment_requisition: [],
  },
  chart_data: {
    labels: [],
    datasets: [],
    current_year: new Date().getFullYear(),
    available_years: [new Date().getFullYear()],
  },
};

// Hook for fetching dashboard data
export const useDashboardQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: fetchDashboardData,
    staleTime: 0, // Always fetch fresh data so counts update immediately after any action
    placeholderData: defaultDashboardData, // Provide fallback data
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};