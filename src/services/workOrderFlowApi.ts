// src/services/workOrderFlowApi.ts
// Five-stage flow, Stage 2 (Work Order): procurement queue, pricing, review, client price approval, contractor acceptance.
import { api } from './apiClient';
import { ChainEntry, FlowTiming, HistoryEntry } from './workRequestFlowApi';

const WO_API_BASE = '/work/api/work-orders';

export type WorkOrderFlowAction = 'edit_pricing' | 'submit' | 'review' | 'send_back' | 'approve' | 'reject' | 'accept';

export interface QuoteLine {
  id?: number;
  description: string;
  quantity: string;
  unit_cost_vendor?: string;   // hidden from the client
  total_vendor?: string;
  unit_cost_client?: string;   // hidden from the contractor
  total_client?: string;
}

export interface WorkOrderFlow {
  flow: 'legacy' | 'five_stage';
  status: string;
  waiting_on: 'procurement' | 'approver' | 'client_rep' | null;
  chain: (Omit<ChainEntry, 'step'> & { step: 'procurement' | 'approver' | 'client_rep' })[];
  lines: QuoteLine[];
  pricing: { client_price?: string | null; vendor_cost?: string | null; margin?: string; margin_percent?: number | null };
  vendor: { id: number; name: string; has_bank_details: boolean } | null;
  quotation_reference: string;
  po_number: string;
  expected_start_date: string | null;
  files: { id: number; url: string | null; name: string }[];
  pricing_problems: string[];
  price_check: { number: string; facility: string | null; vendor: string | null; client_price: string | null; vendor_cost: string | null }[];
  accepted: { at: string; start_date: string; technician: string } | null;
  source_work_request: { slug: string; number: string } | null;
  history: HistoryEntry[];
  timing: FlowTiming | null;
  my_actions: WorkOrderFlowAction[];
}

export interface QueueRow {
  slug: string;
  number: string;
  description: string;
  facility: string | null;
  category: string | null;
  client_approved_at: string | null;
  timing: { state: FlowTiming['state']; due_at: string } | null;
}

export interface PricingInput {
  lines: { description: string; quantity: string; unit_cost_vendor: string; unit_cost_client: string }[];
  vendor: number | null;
  quotation_reference: string;
  po_number: string;
  expected_start_date: string;
  files: File[];
}

export const fetchProcurementQueue = async (): Promise<QueueRow[]> =>
  (await api.get(`${WO_API_BASE}/procurement-queue/`)).data;

export const startWorkOrder = async (workRequestSlug: string): Promise<WorkOrderFlow & { slug: string }> =>
  (await api.post(`${WO_API_BASE}/flow-start/`, { work_request: workRequestSlug })).data;

export const fetchWorkOrderFlow = async (slug: string): Promise<WorkOrderFlow> =>
  (await api.get(`${WO_API_BASE}/${slug}/flow/`)).data;

export const saveWorkOrderPricing = async (slug: string, input: PricingInput): Promise<WorkOrderFlow> => {
  const form = new FormData();
  form.append('lines', JSON.stringify(input.lines));
  if (input.vendor) form.append('vendor', String(input.vendor));
  form.append('quotation_reference', input.quotation_reference);
  form.append('po_number', input.po_number);
  form.append('expected_start_date', input.expected_start_date);
  input.files.forEach((file) => form.append('resources', file));
  return (await api.post(`${WO_API_BASE}/${slug}/flow-pricing/`, form)).data;
};

const ACTION_PATHS: Record<Exclude<WorkOrderFlowAction, 'edit_pricing'>, string> = {
  submit: 'flow-submit',
  review: 'flow-review',
  send_back: 'flow-send-back',
  approve: 'flow-approve',
  reject: 'flow-reject',
  accept: 'flow-accept',
};

export const takeWorkOrderAction = async (
  slug: string, action: Exclude<WorkOrderFlowAction, 'edit_pricing'>, data: Record<string, unknown> = {},
): Promise<WorkOrderFlow> => (await api.post(`${WO_API_BASE}/${slug}/${ACTION_PATHS[action]}/`, data)).data;
