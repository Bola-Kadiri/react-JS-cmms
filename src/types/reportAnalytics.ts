// src/types/reportAnalytics.ts
// Mirrors report.analytics.get_dashboard_analytics() on the backend.

export interface StatusBreakdown {
  [status: string]: number;
}

export interface TrendPoint {
  week: string;
  count: number;
}

export interface WorkRequestAnalytics {
  total: number;
  by_status: StatusBreakdown;
  by_priority: StatusBreakdown;
  backlog: number;
  avg_backlog_age_days: number | null;
  stale_backlog_count: number;
  avg_approval_cycle_days: number | null;
  rejected: number;
  top_facilities: { facility__name: string; count: number }[];
  trend: TrendPoint[];
}

export interface WorkOrderAnalytics {
  total: number;
  by_status: StatusBreakdown;
  by_priority: StatusBreakdown;
  backlog: number;
  avg_backlog_age_days: number | null;
  stale_backlog_count: number;
  rejected: number;
  overdue: number;
  trend: TrendPoint[];
}

export interface CompletionAnalytics {
  total: number;
  by_status: StatusBreakdown;
  rejected: number;
  completion_rate_pct: number | null;
}

export interface InvoiceAnalytics {
  total: number;
  by_status: StatusBreakdown;
  by_approval_status: StatusBreakdown;
  rejected: number;
  total_amount: number;
  overdue_count: number;
  overdue_amount: number;
  trend: TrendPoint[];
}

export interface PaymentRequisitionAnalytics {
  total: number;
  by_status: StatusBreakdown;
  total_amount: number;
  pending_count: number;
  pending_amount: number;
}

export interface PpmAnalytics {
  total: number;
  by_status: StatusBreakdown;
  by_frequency_unit: StatusBreakdown;
  assets_covered: number;
  facilities_covered: number;
}

export interface ProcurementAnalytics {
  rfq: { total: number; by_type: StatusBreakdown };
  purchase_orders: { total: number; by_status: StatusBreakdown; fulfillment_rate_pct: number | null };
  goods_received_notes: { total: number };
  vendor_contracts: {
    total: number;
    active: number;
    expired: number;
    expiring_within_30_days: number;
    total_contract_value: number;
  };
}

export interface LowStockItem {
  tag: string | null;
  part_no: string | null;
  quantity: number;
  reorder_level: number;
}

export interface AssetAnalytics {
  assets: { total: number; by_condition: StatusBreakdown };
  inventory: { total: number; by_status: StatusBreakdown; low_stock_count: number; low_stock_items: LowStockItem[] };
  item_requests: { total: number; by_status: StatusBreakdown };
}

export type InsightLevel = 'critical' | 'warning' | 'info';

export interface Insight {
  level: InsightLevel;
  message: string;
}

export interface DashboardAnalytics {
  generated_at: string;
  work_requests: WorkRequestAnalytics;
  work_orders: WorkOrderAnalytics;
  completions: CompletionAnalytics;
  invoices: InvoiceAnalytics;
  payment_requisitions: PaymentRequisitionAnalytics;
  ppm: PpmAnalytics;
  procurement: ProcurementAnalytics;
  assets: AssetAnalytics;
  insights: Insight[];
}
