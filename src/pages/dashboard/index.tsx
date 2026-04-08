import { useState } from 'react';
import { useDashboardQuery } from '@/hooks/dashboard/useDashboardQueries';
import SummaryCards from '@/components/dashboard/SummaryCards';
import NavigationTabs from '@/components/dashboard/NavigationTabs';
import DashboardChart from '@/components/dashboard/DashboardChart';
import StatusGrid from '@/components/dashboard/StatusGrid';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { data: dashboardData, isLoading, isError, error } = useDashboardQuery();
  const [activeTab, setActiveTab] = useState('WORK REQUEST');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading dashboard</div>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {dashboardData.workspace_title}
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {dashboardData.user_info.name}
            </p>
            <p className="text-sm text-gray-500">
              {dashboardData.user_info.role}
            </p>
          </div>
          {/* <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div> */}
          <div className="text-right">
            <p className="text-sm text-gray-500">{dashboardData.current_date}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <NavigationTabs
        // tabs={dashboardData.navigation_tabs}
        tabs={[
          "WORK REQUEST",
          "WORK ORDER",
          "WORK COMPLETION",
          "INVOICES",
          "PAYMENT REQUISITION"
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Summary Cards */}
      {/* <SummaryCards
        summaryCards={dashboardData.summary_cards}
        activeTab={activeTab}
      /> */}

      {/* Status Grid Section */}
      <StatusGrid
        // statusCategories={dashboardData.status_categories}
        summaryCards={dashboardData.summary_cards}
        activeTab={activeTab}
      />

      {/* Chart Section */}
      <DashboardChart chartData={dashboardData.chart_data} />
    </div>
  );
};

export default Dashboard;