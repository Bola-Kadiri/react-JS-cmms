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
  input: { lines: RaisePaymentQuoteLine[]; client_price: string; quotation_reference?: string },
): Promise<Workorder> => {
  const form = new FormData();
  form.append('no_po_needed', 'true');
  form.append('lines', JSON.stringify(input.lines));
  form.append('client_price', input.client_price);
  form.append('quotation_reference', input.quotation_reference ?? '');
  const response = await api.post(`/work/api/work-orders/${slug}/procurement-submit/`, form);
  return response.data;
};
