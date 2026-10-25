// src/services/invoiceFlowApi.ts
// Five-stage flow, Stage 4 (Vendor Invoice): jobs to invoice, invoice details, three-way check, approval.
import { api } from './apiClient';
import { ChainEntry, FlowTiming, HistoryEntry } from './workRequestFlowApi';

const INVOICE_API_BASE = '/work/api/invoices';

export type InvoiceAction = 'edit' | 'submit' | 'review' | 'return' | 'approve';

export interface InvoiceFlow {
  flow: 'legacy' | 'five_stage';
  status: string;
  number: string;
  waiting_on: 'contractor' | 'ap_officer' | 'head_of_finance' | null;
  entered_for_vendor: boolean;
  chain: (Omit<ChainEntry, 'step'> & { step: 'contractor' | 'ap_officer' | 'head_of_finance' })[];
  vendor: { id: number; name: string; has_bank_details: boolean; bank: string | null; account_last4: string } | null;
  work_order: { slug: string; number: string; amount: string | null; description: string } | null;
  completion: { id: number; number: string; status: string } | null;
  details: { vendor_invoice_number: string; invoice_date: string | null; amount: string; vat_charged: boolean; vat: string; total: string };
  files: { id: number; url: string | null; name: string }[];
  match: { check: string; expected: string; actual: string; ok: boolean }[];
  problems: string[];
  history: HistoryEntry[];
  timing: FlowTiming | null;
  my_actions: InvoiceAction[];
  /** Once approved: how the payment is going. */
  payment: { status: 'Being prepared' | 'Paid'; voucher_id: number | null; paid_at: string | null } | null;
}

export interface JobToInvoice {
  completion_id: number;
  wcc_number: string;
  work_order: string;
  work_order_slug: string;
  description: string;
  facility: string | null;
  vendor: string | null;
  amount: string | null;
  approved_at: string;
}

export interface InvoiceDetailsInput {
  vendor_invoice_number: string;
  invoice_date: string;
  amount: string;
  vat_charged: boolean;
  files: File[];
}

export const fetchJobsToInvoice = async (): Promise<JobToInvoice[]> =>
  (await api.get(`${INVOICE_API_BASE}/to-invoice/`)).data;

export const startInvoice = async (completionId: number): Promise<InvoiceFlow & { id: number }> =>
  (await api.post(`${INVOICE_API_BASE}/flow-start/`, { completion: completionId })).data;

export const fetchInvoiceFlow = async (id: number | string): Promise<InvoiceFlow> =>
  (await api.get(`${INVOICE_API_BASE}/${id}/flow/`)).data;

export const saveInvoiceDetails = async (id: number | string, input: InvoiceDetailsInput): Promise<InvoiceFlow> => {
  const form = new FormData();
  form.append('vendor_invoice_number', input.vendor_invoice_number);
  form.append('invoice_date', input.invoice_date);
  form.append('amount', input.amount);
  form.append('vat_charged', String(input.vat_charged));
  input.files.forEach((file) => form.append('files', file));
  return (await api.post(`${INVOICE_API_BASE}/${id}/flow-details/`, form)).data;
};

const ACTION_PATHS: Record<Exclude<InvoiceAction, 'edit'>, string> = {
  submit: 'flow-submit',
  review: 'flow-review',
  return: 'flow-return',
  approve: 'flow-approve',
};

export const takeInvoiceAction = async (
  id: number | string, action: Exclude<InvoiceAction, 'edit'>, data: Record<string, unknown> = {},
): Promise<InvoiceFlow> => (await api.post(`${INVOICE_API_BASE}/${id}/${ACTION_PATHS[action]}/`, data)).data;
