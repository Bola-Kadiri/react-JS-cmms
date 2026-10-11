// src/pages/reports/ReportsDashboardPage.tsx
import { useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ClipboardList,
  ClipboardCheck,
  FileCheck2,
  Receipt,
  Wallet,
  Wrench,
  ShoppingCart,
  Boxes,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useDashboardAnalyticsQuery } from '@/hooks/report/useReportQueries';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Insight, StatusBreakdown } from '@/types/reportAnalytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_COLORS = [
  'rgba(59,130,246,0.7)', 'rgba(16,185,129,0.7)', 'rgba(234,179,8,0.7)',
  'rgba(239,68,68,0.7)', 'rgba(168,85,247,0.7)', 'rgba(20,184,166,0.7)',
];

const currency = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value || 0);

function breakdownChart(title: string, breakdown: StatusBreakdown) {
  const labels = Object.keys(breakdown);
  return {
    data: {
      labels,
      datasets: [{
        label: title,
        data: labels.map((l) => breakdown[l]),
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderRadius: 4,
      }],
    },
  };
}

const barOptions = (title: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: title, font: { size: 14, weight: 'bold' as const } },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f0f0f0' } },
  },
});

const INSIGHT_STYLES: Record<Insight['level'], { icon: JSX.Element; classes: string }> = {
  critical: { icon: <AlertCircle className="h-4 w-4" />, classes: 'bg-red-50 text-red-800 border-red-200' },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, classes: 'bg-amber-50 text-amber-800 border-amber-200' },
  info: { icon: <Info className="h-4 w-4" />, classes: 'bg-blue-50 text-blue-800 border-blue-200' },
};

const ReportsDashboardPage = () => {
  const { hasNoAccess } = useFeatureAccess('report');
  const { data, isLoading, isFetching, isError, refetch } = useDashboardAnalyticsQuery();

  const wrStatusChart = useMemo(
    () => (data ? breakdownChart('Work Requests', data.work_requests.by_status) : null),
    [data]
  );
  const woStatusChart = useMemo(
    () => (data ? breakdownChart('Work Orders', data.work_orders.by_status) : null),
    [data]
  );

  if (hasNoAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner text="Loading analytics..." size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          Failed to load the analytics dashboard. Please try again.
          <div className="mt-4">
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { work_requests: wr, work_orders: wo, completions, invoices: inv,
    payment_requisitions: pr, ppm, procurement: proc, assets } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted-foreground">
            A live, system-wide view of maintenance activity — not just record counts, but
            what needs attention right now.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Updated {new Date(data.generated_at).toLocaleTimeString()}
          </span>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Insights — the part that "speaks" rather than just tabulating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.insights.map((insight, i) => {
            const style = INSIGHT_STYLES[insight.level];
            return (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${style.classes}`}
              >
                {style.icon}
                <span>{insight.message}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Work Requests"
          subtitle={`${wr.backlog} in backlog`}
          value={String(wr.total)}
          icon={<ClipboardList className="h-6 w-6 text-blue-600" />}
        />
        <DashboardCard
          title="Work Orders"
          subtitle={`${wo.overdue} overdue`}
          value={String(wo.total)}
          icon={<Wrench className="h-6 w-6 text-teal-600" />}
        />
        <DashboardCard
          title="Completion Rate"
          subtitle={`${completions.total} certificates`}
          value={completions.completion_rate_pct !== null ? `${completions.completion_rate_pct}%` : 'N/A'}
          icon={<FileCheck2 className="h-6 w-6 text-emerald-600" />}
        />
        <DashboardCard
          title="Invoices Outstanding"
          subtitle={`${inv.overdue_count} overdue`}
          value={currency(inv.overdue_amount)}
          icon={<Receipt className="h-6 w-6 text-red-600" />}
        />
        <DashboardCard
          title="Payments Pending"
          subtitle={`${pr.pending_count} requisition(s)`}
          value={currency(pr.pending_amount)}
          icon={<Wallet className="h-6 w-6 text-amber-600" />}
        />
        <DashboardCard
          title="PPM Schedules"
          subtitle={`${ppm.assets_covered} assets covered`}
          value={String(ppm.total)}
          icon={<ClipboardCheck className="h-6 w-6 text-indigo-600" />}
        />
        <DashboardCard
          title="Vendor Contracts"
          subtitle={`${proc.vendor_contracts.expiring_within_30_days} expiring in 30 days`}
          value={String(proc.vendor_contracts.active)}
          icon={<ShoppingCart className="h-6 w-6 text-purple-600" />}
        />
        <DashboardCard
          title="Low Stock Items"
          subtitle={`of ${assets.inventory.total} inventory items`}
          value={String(assets.inventory.low_stock_count)}
          icon={<Boxes className="h-6 w-6 text-orange-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="h-64">
              {wrStatusChart && Object.keys(wr.by_status).length > 0 ? (
                <Bar data={wrStatusChart.data} options={barOptions('Work Requests by Status')} />
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="h-64">
              {woStatusChart && Object.keys(wo.by_status).length > 0 ? (
                <Bar data={woStatusChart.data} options={barOptions('Work Orders by Status')} />
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Busiest Facilities (Work Requests)</CardTitle>
          </CardHeader>
          <CardContent>
            {wr.top_facilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {wr.top_facilities.map((f) => (
                  <li key={f.facility__name} className="flex items-center justify-between text-sm">
                    <span>{f.facility__name}</span>
                    <span className="font-medium">{f.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {assets.inventory.low_stock_items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing at or below reorder level.</p>
            ) : (
              <ul className="space-y-2">
                {assets.inventory.low_stock_items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span>{item.tag || item.part_no || 'Unlabeled item'}</span>
                    <span className="font-medium text-orange-700">
                      {item.quantity} / {item.reorder_level} reorder level
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Looking for individual staff activity instead of system-wide trends?{' '}
        <Link to="/dashboard/reports/user-facility" className="underline">
          Open the User Facility Report
        </Link>
        .
      </p>
    </div>
  );
};

export default ReportsDashboardPage;
