// src/features/payments/format.ts
export const naira = (value?: string | null) =>
  (value == null ? '—' : `₦${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

export const when = (iso?: string | null) =>
  (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export const STATUS_STYLE: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-200',
  'Awaiting Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Returned: 'bg-amber-100 text-amber-800 border-amber-200',
  'Awaiting Approval': 'bg-blue-100 text-blue-800 border-blue-200',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Payment Failed': 'bg-red-100 text-red-800 border-red-200',
  Paid: 'bg-green-100 text-green-800 border-green-200',
};

export const errorMessage = (error: any, fallback = 'Could not complete the action. Please try again.') =>
  error?.response?.data?.error || fallback;
