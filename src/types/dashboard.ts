// export interface DashboardData {
//   workspace_title: string;
//   user_info: UserInfo;
//   navigation_tabs: string[];
//   summary_cards: SummaryCards;
//   chart_data: ChartData;
//   status_categories: StatusCategories;
// }

// export interface UserInfo {
//   name: string;
//   role: string;
// }

// export interface SummaryCards {
//   work_request: SummaryCardItem[];
//   work_order: SummaryCardItem[];
// }

// export interface SummaryCardItem {
//   label: string;
//   count: number;
//   icon: string;
// }

// export interface ChartData {
//   labels: string[];
//   datasets: ChartDataset[];
// }

// export interface ChartDataset {
//   label: string;
//   data: number[];
//   backgroundColor: string;
// }

// export interface StatusCategories {
//   work_request: StatusItem[];
//   work_order: StatusItem[];
//   work_completion_certificate: StatusItem[];
//   payment_invoice: StatusItem[];
//   payment_requisition: StatusItem[];
// }

// export interface StatusItem {
//   label: string;
//   count: number;
// }


export interface DashboardData {
  workspace_title: string;
  user_info: UserInfo;
  navigation_tabs: string[];
  summary_cards: SummaryCards;
  chart_data: ChartData;
  current_date: string;
}

export interface UserInfo {
  name: string;
  role: string;
}

export interface SummaryCards {
  work_request: SummaryCardItem[];
  work_order: SummaryCardItem[];
  work_completion: SummaryCardItem[];
  invoices: SummaryCardItem[];
  payment_requisition: SummaryCardItem[];
}

export interface SummaryCardItem {
  label: string;
  count: number;
  amount: string;
  icon: string;
  color: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  current_year: number;
  available_years: number[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
}

// Legacy types for backward compatibility - can be removed later
export interface StatusCategories {
  work_request: StatusItem[];
  work_order: StatusItem[];
  work_completion_certificate: StatusItem[];
  payment_invoice: StatusItem[];
  payment_requisition: StatusItem[];
}

export interface StatusItem {
  label: string;
  count: number;
}