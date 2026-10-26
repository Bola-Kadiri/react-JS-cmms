// src/services/paymentFlowApi.ts
// Five-stage flow, Stage 5 (Payment): vouchers, Internal Control check, approval, pay and confirm, WHT rates.
import { api } from './apiClient';
import { FlowTiming, HistoryEntry } from './workRequestFlowApi';

const VOUCHER_API_BASE = '/work/api/payment-vouchers';
const WHT_API_BASE = '/work/api/wht-rates';

export type VoucherAction = 'edit' | 'submit' | 'review' | 'return' | 'approve' | 'pay' | 'payment_failed' | 'attach_receipt';
export type VoucherStatus = 'Draft' | 'Awaiting Review' | 'Returned' | 'Awaiting Approval' | 'Approved' | 'Payment Failed' | 'Paid';

export interface TrailStamp { by: string; at: string; on_behalf_of: string | null }

export interface Remittance {
  voucher_number: string;
  paid_at: string | null;
  payment_date: string | null;
  bank_reference: string;
  bank: string;
  account_last4: string;
  invoice: string;
  amount: string;
  vat: string;
  wht_percent: string;
  wht_amount: string;
  net_amount: string;
}

export interface VoucherFlow {
  id: number;
  number: string;
  status: VoucherStatus;
  status_label: string;
  waiting_on: 'ap_officer' | 'reviewer' | 'head_of_finance' | null;
  chain: { step: 'ap_officer' | 'reviewer' | 'head_of_finance'; label: string; kind: 'team' | 'named'; person?: string | null; people?: number }[];
  vendor: { id: number; name: string; bank: string; account_last4: string; has_bank_details: boolean };
  invoice: { id: number; number: string; vendor_invoice_number: string };
  work_order: { slug: string; number: string; description: string; client_price: string | null };
  facility: string | null;
  amounts: { amount: string; vat: string; wht_rate: number | null; wht_label: string | null; wht_percent: string; wht_amount: string; net_amount: string };
  payment_method: '' | 'bank_transfer' | 'cheque';
  payment: { payment_date: string | null; bank_reference: string; paid_at: string | null; paid_by: string | null; failure_reason: string | null };
  files: { id: number; url: string | null; name: string }[];
  trail: { stage: string; document: string; raised: TrailStamp | null; reviewed: TrailStamp | null; approved: TrailStamp | null; ok: boolean }[];
  checks: { check: string; ok: boolean }[];
  problems: string[];
  remittance: Remittance | null;
  history: HistoryEntry[];
  timing: FlowTiming | null;
  my_actions: VoucherAction[];
}

/** What a contractor gets: only the remittance advice once paid. */
export interface VendorVoucherView { number: string; status: VoucherStatus; remittance: Remittance | null }

export interface VoucherRow {
  id: number;
  number: string;
  status: VoucherStatus;
  status_label: string;
  vendor: string;
  bank: string;
  account_last4: string;
  invoice: string;
  description: string;
  facility: string | null;
  net_amount: string;
  failure_reason: string | null;
  approved_at: string | null;
  paid_at: string | null;
  my_actions?: VoucherAction[];
  receipts?: number;
}

export interface InvoiceToPay {
  invoice_id: number;
  invoice_number: string;
  vendor_invoice_number: string;
  vendor: string | null;
  facility: string | null;
  description: string;
  total: string;
  approved_at: string;
}

export interface WhtRate { id: number; name: string; rate: string; is_active: boolean; label: string }

export const fetchVouchers = async (): Promise<VoucherRow[]> => (await api.get(`${VOUCHER_API_BASE}/`)).data;

export const fetchInvoicesToPay = async (): Promise<InvoiceToPay[]> => (await api.get(`${VOUCHER_API_BASE}/to-raise/`)).data;

export const startVoucher = async (invoiceId: number): Promise<VoucherFlow> =>
  (await api.post(`${VOUCHER_API_BASE}/flow-start/`, { invoice: invoiceId })).data;

export const fetchVoucher = async (id: number | string): Promise<VoucherFlow | VendorVoucherView> =>
  (await api.get(`${VOUCHER_API_BASE}/${id}/`)).data;

export const saveVoucherDetails = async (
  id: number | string, input: { wht_rate?: number | null; payment_method?: string },
): Promise<VoucherFlow> => (await api.post(`${VOUCHER_API_BASE}/${id}/flow-details/`, input)).data;

const ACTION_PATHS = {
  submit: 'flow-submit',
  review: 'flow-review',
  return: 'flow-return',
  approve: 'flow-approve',
  payment_failed: 'payment-failed',
} as const;

export const takeVoucherAction = async (
  id: number | string, action: keyof typeof ACTION_PATHS, data: Record<string, unknown> = {},
): Promise<VoucherFlow> => (await api.post(`${VOUCHER_API_BASE}/${id}/${ACTION_PATHS[action]}/`, data)).data;

export const fetchVouchersToPay = async (): Promise<VoucherRow[]> => (await api.get(`${VOUCHER_API_BASE}/to-pay/`)).data;

export const attachReceipt = async (voucherIds: number[], files: File[]): Promise<void> => {
  const form = new FormData();
  voucherIds.forEach((id) => form.append('vouchers', String(id)));
  files.forEach((file) => form.append('file', file));
  await api.post(`${VOUCHER_API_BASE}/attach-receipt/`, form);
};

export const confirmPaid = async (
  voucherIds: number[], paymentDate: string, bankReference: string,
): Promise<{ message: string; paid: string[] }> =>
  (await api.post(`${VOUCHER_API_BASE}/confirm-paid/`, {
    vouchers: voucherIds, payment_date: paymentDate, bank_reference: bankReference,
  })).data;

export const fetchWhtRates = async (all = false): Promise<WhtRate[]> =>
  (await api.get(`${WHT_API_BASE}/`, { params: all ? { all: 1 } : {} })).data;

export const createWhtRate = async (input: { name: string; rate: string }): Promise<WhtRate> =>
  (await api.post(`${WHT_API_BASE}/`, input)).data;

export const updateWhtRate = async (id: number, input: Partial<{ name: string; rate: string; is_active: boolean }>): Promise<WhtRate> =>
  (await api.patch(`${WHT_API_BASE}/${id}/`, input)).data;
