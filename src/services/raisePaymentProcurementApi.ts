// src/services/raisePaymentProcurementApi.ts
// Raise Payment bills of ₦100,000 or more when Procurement & Store say the bill needs no PO:
// they price it as quote lines instead, and the lines' total must match the bill amount.
import { api } from './apiClient';
import { Workorder } from '@/types/workorder';

export interface RaisePaymentQuoteLine {
  description: string;
  quantity: string;
  amount: string;
}

export const procurementSubmitWithoutPo = async (
  slug: string,
  input: { lines: RaisePaymentQuoteLine[]; client_price: string; quotation_reference?: string; override_reason?: string },
): Promise<Workorder> => {
  const form = new FormData();
  form.append('no_po_needed', 'true');
  form.append('lines', JSON.stringify(input.lines));
  form.append('client_price', input.client_price);
  form.append('quotation_reference', input.quotation_reference ?? '');
  if (input.override_reason) form.append('override_reason', input.override_reason);
  const response = await api.post(`/work/api/work-orders/${slug}/procurement-submit/`, form);
  return response.data;
};

// The Super Admin acting for someone else sends `override_reason`, which goes in the bill's history.
// Without it these behave exactly like procurementSubmitWorkorder / raisePaymentResubmitWorkorder.

export const procurementSubmitWithPo = async (
  slug: string,
  input: {
    po_number: string; po_document: File | null; quotation_amount: string; client_price: string;
    quotation_reference?: string; override_reason?: string;
  },
): Promise<Workorder> => {
  const form = new FormData();
  form.append('po_number', input.po_number);
  if (input.po_document) form.append('po_document', input.po_document);
  form.append('quotation_amount', input.quotation_amount);
  form.append('client_price', input.client_price);
  form.append('quotation_reference', input.quotation_reference ?? '');
  if (input.override_reason) form.append('override_reason', input.override_reason);
  const response = await api.post(`/work/api/work-orders/${slug}/procurement-submit/`, form);
  return response.data;
};

export const raisePaymentResubmit = async (slug: string, override_reason?: string): Promise<Workorder> => {
  const response = await api.post(`/work/api/work-orders/${slug}/raise-payment-resubmit/`,
    override_reason ? { override_reason } : undefined);
  return response.data;
};
