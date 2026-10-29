// src/features/payments/VoucherDetailPage.tsx
// Stage 5 of the five-stage flow on one voucher: AP prepares it, REVIEWER (Internal Control) checks the
// full trail, the Head of Finance & Treasury approves. A contractor only ever sees the remittance advice.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle, ArrowLeft, Banknote, CheckCircle, CheckCircle2, Clock, Loader2, Lock, Send, Users, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Remittance, TrailStamp, VendorVoucherView, VoucherFlow, fetchVoucher, fetchWhtRates, saveVoucherDetails, takeVoucherAction,
} from '@/services/paymentFlowApi';
import { STATUS_STYLE, errorMessage, naira, when } from './format';

type DialogAction = 'review' | 'return' | 'approve' | 'payment_failed';

const DIALOGS: Record<DialogAction, { title: string; description: string; confirm: string; ok: boolean; box: string; reason: boolean }> = {
  review: {
    title: 'Review and send on', description: 'The trail is complete and every check passes.', confirm: 'Confirm review', ok: true,
    box: 'The Head of Finance & Treasury will be asked to approve the payment.', reason: false,
  },
  return: {
    title: 'Return to AP Officer', description: 'Say exactly what needs fixing.', confirm: 'Return voucher', ok: false,
    box: 'It goes back to AP to be corrected and resubmitted. This is not final.', reason: true,
  },
  approve: {
    title: 'Approve payment', description: 'Release this payment.', confirm: 'Confirm approval', ok: true,
    box: 'You then pay it in the bank portal and confirm Paid on the Pay and confirm screen.', reason: false,
  },
  payment_failed: {
    title: 'Payment failed', description: 'The bank did not complete this payment.', confirm: 'Mark as failed', ok: false,
    box: 'AP Officers are told so they can check the vendor’s details. It can be paid again afterwards.', reason: true,
  },
};

const TIMING = {
  on_time: { label: 'On time', className: 'bg-green-100 text-green-800 border-green-200' },
  reminder: { label: 'Due soon', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-100 text-red-800 border-red-200' },
};

const METHODS = [{ value: 'bank_transfer', label: 'Bank transfer' }, { value: 'cheque', label: 'Cheque' }];

const stamp = (s: TrailStamp | null) =>
  (s ? <><span className="font-medium">{s.by}</span>{s.on_behalf_of && <span className="text-gray-500"> for {s.on_behalf_of}</span>}
    <div className="text-xs text-gray-500">{when(s.at)}</div></> : <span className="text-gray-400">—</span>);

const isFullView = (data: VoucherFlow | VendorVoucherView): data is VoucherFlow => 'chain' in data;

const RemittanceAdvice = ({ r }: { r: Remittance }) => (
  <div className="rounded-lg border-2 border-green-600 bg-white shadow-sm overflow-hidden">
    <div className="p-5 bg-green-50 border-b border-green-100 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-semibold text-green-800">Remittance advice</h2>
      <Badge variant="outline" className={STATUS_STYLE.Paid}>Paid</Badge>
    </div>
    <div className="p-5 space-y-4">
      <div className="grid gap-4 md:grid-cols-3 text-sm">
        <div><p className="text-xs text-gray-500">Amount received</p><p className="text-xl font-semibold">{naira(r.net_amount)}</p></div>
        <div><p className="text-xs text-gray-500">Into</p><p className="font-medium">{r.bank} ****{r.account_last4}</p></div>
        <div><p className="text-xs text-gray-500">Bank reference</p><p className="font-medium">{r.bank_reference}</p></div>
        <div><p className="text-xs text-gray-500">Paid</p><p className="font-medium">{r.payment_date ?? when(r.paid_at)}</p></div>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableBody>
            <TableRow><TableCell>Invoice {r.invoice}</TableCell><TableCell className="text-right">{naira(r.amount)}</TableCell></TableRow>
            {Number(r.vat) > 0 && <TableRow><TableCell>VAT 7.5%</TableCell><TableCell className="text-right">{naira(r.vat)}</TableCell></TableRow>}
            {Number(r.wht_amount) > 0 && (
              <TableRow><TableCell>Withholding tax {Number(r.wht_percent)}% (deducted)</TableCell><TableCell className="text-right">− {naira(r.wht_amount)}</TableCell></TableRow>
            )}
            <TableRow><TableCell className="font-semibold">Paid to you</TableCell><TableCell className="text-right font-semibold">{naira(r.net_amount)}</TableCell></TableRow>
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">This advice was also emailed to you.</p>
    </div>
  </div>
);

const VoucherDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['payment-voucher', id], queryFn: () => fetchVoucher(id), enabled: !!id });
  const flow = data && isFullView(data) ? data : null;
  const canEdit = !!flow?.my_actions.includes('edit');
  const { data: rates = [] } = useQuery({ queryKey: ['wht-rates'], queryFn: () => fetchWhtRates(), enabled: canEdit });

  const [form, setForm] = useState({ wht_rate: '', payment_method: '' });
  useEffect(() => {
    if (flow && canEdit) setForm({ wht_rate: flow.amounts.wht_rate ? String(flow.amounts.wht_rate) : '', payment_method: flow.payment_method });
  }, [flow, canEdit]);

  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [text, setText] = useState('');
  const [fieldError, setFieldError] = useState('');

  const refresh = (updated: VoucherFlow) => {
    queryClient.setQueryData(['payment-voucher', id], updated);
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] });
    queryClient.invalidateQueries({ queryKey: ['vouchers-to-pay'] });
  };
  const onError = (error: any) => {
    const message = errorMessage(error);
    setFieldError(message);
    toast.error(message);
  };

  const save = useMutation({
    mutationFn: (next: typeof form) => saveVoucherDetails(id, {
      wht_rate: next.wht_rate ? Number(next.wht_rate) : undefined, payment_method: next.payment_method || undefined,
    }),
    onSuccess: (updated) => refresh(updated),
    onError,
  });
  const act = useMutation({
    mutationFn: ({ action, body }: { action: 'submit' | DialogAction; body?: Record<string, unknown> }) => takeVoucherAction(id, action, body),
    onSuccess: (updated) => { refresh(updated); toast.success('Done'); setDialog(null); },
    onError,
  });

  if (isLoading || !data) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>;
  }

  const header = (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant="outline" size="icon" aria-label="Go back" onClick={() => navigate(-1)} className="border-green-200 text-green-700">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex-1 min-w-[240px]">
        <h1 className="text-3xl font-bold text-gray-900">{data.number}</h1>
        {flow && <p className="text-sm text-gray-500 mt-1">{flow.vendor.name} · net {naira(flow.amounts.net_amount)} · {flow.facility ?? '—'}</p>}
      </div>
      <Badge variant="outline" className={STATUS_STYLE[data.status]}>{flow?.status_label ?? data.status}</Badge>
    </div>
  );

  // The contractor's view: the remittance advice, nothing internal.
  if (!flow) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-4xl">
        {header}
        {data.remittance ? <RemittanceAdvice r={data.remittance} /> : <p className="text-gray-600">Payment is being prepared.</p>}
      </div>
    );
  }

  const open = (action: DialogAction) => { setDialog(action); setText(''); setFieldError(''); };
  const submitDialog = () => {
    if (!dialog) return;
    const needsReason = DIALOGS[dialog].reason;
    if (!text.trim()) { setFieldError(needsReason ? 'A reason is required.' : 'Type your full name to sign.'); return; }
    act.mutate({ action: dialog, body: needsReason ? { reason: text } : { signature: text } });
  };
  const change = (key: keyof typeof form, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    save.mutate(next);
  };

  const status = flow.status;
  const done = ['Approved', 'Payment Failed', 'Paid'].includes(status);
  const order = flow.chain.map((c) => c.step);
  const currentIndex = done ? order.length : order.indexOf(flow.waiting_on ?? order[0]);
  const lastReturn = [...flow.history].reverse().find((h) => h.action === 'sent_back')?.reason;
  const checksFail = flow.checks.some((c) => !c.ok);
  const actions = flow.my_actions;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      {header}

      {/* Actions for this person */}
      {actions.some((a) => a !== 'edit') && (
        <div className="bg-white border-2 border-green-600 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-green-800">
            {actions.includes('pay') ? 'This payment is approved and waiting to be paid.'
              : actions.includes('attach_receipt') ? 'Waiting for the Head of Finance & Treasury to pay. You can attach the bank receipt.'
              : 'This voucher is waiting for you.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {actions.includes('submit') && (
              <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={act.isPending || save.isPending || flow.problems.length > 0}
                      title={flow.problems.join(' ') || undefined} onClick={() => act.mutate({ action: 'submit' })}>
                {act.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Submit voucher
              </Button>
            )}
            {actions.includes('return') && (
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => open('return')}>
                Return to AP Officer
              </Button>
            )}
            {actions.includes('review') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={checksFail}
                      title={checksFail ? 'Every check must pass. Return it instead.' : undefined} onClick={() => open('review')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Review and send to Head of Finance &amp; Treasury
              </Button>
            )}
            {actions.includes('approve') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('approve')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve payment
              </Button>
            )}
            {actions.includes('payment_failed') && (
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => open('payment_failed')}>
                Payment failed
              </Button>
            )}
            {(actions.includes('pay') || actions.includes('attach_receipt')) && (
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/dashboard/payments/pay')}>
                <Banknote className="mr-2 h-4 w-4" /> Go to Pay and confirm
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Banners */}
      {status === 'Returned' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Returned for correction</p>
          {lastReturn && <p className="mt-1">Reason: {lastReturn}</p>}
        </div>
      )}
      {status === 'Payment Failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
          <p className="font-semibold flex items-center gap-2"><XCircle className="h-4 w-4" /> Payment failed</p>
          {flow.payment.failure_reason && <p className="mt-1">Reason: {flow.payment.failure_reason}</p>}
        </div>
      )}
      {status === 'Paid' && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm text-green-900">
          <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Paid · job closed</p>
          <p className="mt-1">Confirmed by {flow.payment.paid_by} on {when(flow.payment.paid_at)} · paid {flow.payment.payment_date} · bank reference {flow.payment.bank_reference}</p>
        </div>
      )}

      {/* Voucher */}
      <div className={`rounded-lg bg-white shadow-sm overflow-hidden ${canEdit ? 'border-2 border-green-600' : 'border'}`}>
        <div className="p-5 bg-green-50 border-b border-green-100 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-green-800">Voucher</h2>
          {save.isPending && <span className="text-xs text-gray-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>}
        </div>
        <div className="p-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            {[
              ['Voucher number', flow.number],
              ['Payee', flow.vendor.name],
              ['Bank', flow.vendor.bank || '—'],
              ['Account name', flow.vendor.account_name || '—'],
              ['Account number', flow.vendor.account_number || '—'],
              ['Invoice', flow.invoice.vendor_invoice_number || flow.invoice.number],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Lock className="h-3 w-3" /> {label}</p>
                <p className="font-medium mt-1">{value}</p>
              </div>
            ))}
          </div>

          {canEdit && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="wht" className={`text-sm font-medium ${form.wht_rate ? 'text-gray-700' : 'text-red-600'}`}>
                  Withholding tax rate<span className="text-red-500 ml-1">*</span>
                </label>
                <select id="wht" value={form.wht_rate} onChange={(e) => change('wht_rate', e.target.value)}
                        className={`w-full h-10 rounded-md border bg-white px-3 text-sm ${form.wht_rate ? 'border-input' : 'border-red-500'}`}>
                  <option value="">Select rate</option>
                  {rates.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <p className="text-xs text-gray-500">Per Finance policy, or None. Taken on the amount before VAT.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="method" className={`text-sm font-medium ${form.payment_method ? 'text-gray-700' : 'text-red-600'}`}>
                  Payment method<span className="text-red-500 ml-1">*</span>
                </label>
                <select id="method" value={form.payment_method} onChange={(e) => change('payment_method', e.target.value)}
                        className={`w-full h-10 rounded-md border bg-white px-3 text-sm ${form.payment_method ? 'border-input' : 'border-red-500'}`}>
                  <option value="">Select method</option>
                  {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader><TableRow><TableHead /><TableHead className="text-right">Amount (₦)</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>Invoice amount</TableCell><TableCell className="text-right">{naira(flow.amounts.amount)}</TableCell></TableRow>
                <TableRow><TableCell>VAT 7.5% (only if the vendor charged it)</TableCell><TableCell className="text-right">{naira(flow.amounts.vat)}</TableCell></TableRow>
                <TableRow>
                  <TableCell>Withholding tax {flow.amounts.wht_label ? `(${flow.amounts.wht_label})` : ''}</TableCell>
                  <TableCell className="text-right">− {naira(flow.amounts.wht_amount)}</TableCell>
                </TableRow>
                <TableRow><TableCell className="font-semibold">Net to pay</TableCell><TableCell className="text-right font-semibold">{naira(flow.amounts.net_amount)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
          {!canEdit && flow.payment_method && (
            <p className="text-sm text-gray-700">Payment method: {METHODS.find((m) => m.value === flow.payment_method)?.label}</p>
          )}
          {flow.work_order.client_price && (
            <p className="text-sm text-gray-600">Client billed {naira(flow.work_order.client_price)} (Work Order client price)</p>
          )}
          {flow.problems.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">{flow.problems.length} {flow.problems.length === 1 ? 'thing needs' : 'things need'} attention:</p>
              <ul className="list-disc pl-6">{flow.problems.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          )}
        </div>
      </div>

      {/* Control checks */}
      {status !== 'Draft' && (
        <div className={`rounded-lg bg-white shadow-sm overflow-hidden ${actions.includes('review') ? 'border-2 border-green-600' : 'border'}`}>
          <div className="p-5 bg-green-50 border-b border-green-100"><h2 className="text-lg font-semibold text-green-800">Control checks</h2></div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Check</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
              <TableBody>
                {flow.checks.map((c) => (
                  <TableRow key={c.check}>
                    <TableCell>{c.check}</TableCell>
                    <TableCell>{c.ok ? <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Passed" /> : <XCircle className="h-4 w-4 text-red-600" aria-label="Failed" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Full trail */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="p-5 bg-green-50 border-b border-green-100"><h2 className="text-lg font-semibold text-green-800">Full audit trail</h2></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Stage</TableHead><TableHead>Raised</TableHead><TableHead>Reviewed</TableHead><TableHead>Approved</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>
              {flow.trail.map((row) => (
                <TableRow key={row.stage}>
                  <TableCell><div className="font-medium">{row.stage}</div><div className="text-xs text-gray-500">{row.document}</div></TableCell>
                  <TableCell>{stamp(row.raised)}</TableCell>
                  <TableCell>{stamp(row.reviewed)}</TableCell>
                  <TableCell>{stamp(row.approved)}</TableCell>
                  <TableCell>{row.ok ? <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Complete" /> : <XCircle className="h-4 w-4 text-red-600" aria-label="Incomplete" />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-gray-600 bg-blue-50 border-t border-blue-200 p-3">
          The voucher can only be raised when all four earlier stages are approved.
        </p>
      </div>

      {/* Chain */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Approval Chain · filled in automatically
          </p>
          {flow.timing && (
            <Badge variant="outline" className={TIMING[flow.timing.state].className}>
              <Clock className="mr-1 h-3 w-3" /> {TIMING[flow.timing.state].label} · due {when(flow.timing.due_at)}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {flow.chain.map((entry, index) => {
            const isDone = index < currentIndex;
            const current = !done && index === currentIndex;
            return (
              <div key={entry.step} className={`p-3 rounded-lg border ${current ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xs text-gray-500 font-medium">Step {index + 1} · {entry.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                  {entry.kind === 'team'
                    ? <><Users className="h-4 w-4 text-green-700" /> {entry.label} ({entry.people})</>
                    : entry.person ?? <span className="text-red-600">Not set</span>}
                </p>
                <p className="text-xs mt-1">
                  {isDone ? <span className="text-green-700">Done</span>
                    : current ? <span className="text-blue-700 font-medium">Waiting</span>
                    : <span className="text-gray-400">Next</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receipts */}
      {flow.files.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bank receipts</p>
          {flow.files.map((f) => f.url
            ? <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="text-green-700 underline mr-3">{f.name}</a>
            : <span key={f.id} className="mr-3">{f.name}</span>)}
        </div>
      )}

      {flow.remittance && <RemittanceAdvice r={flow.remittance} />}

      {/* History */}
      {flow.history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Every step, time stamped</p>
          <ol className="space-y-3">
            {flow.history.map((entry, index) => (
              <li key={index} className="flex flex-wrap justify-between gap-2 text-sm border-b border-gray-100 pb-2 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{entry.label} · {entry.actor}
                    {entry.on_behalf_of && <span className="text-gray-500 font-normal"> on behalf of {entry.on_behalf_of}</span>}
                  </p>
                  <p className="text-xs text-gray-500">{entry.role}</p>
                  {entry.reason && <p className="text-xs text-gray-700 mt-1">“{entry.reason}”</p>}
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">{when(entry.at)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={!!dialog} onOpenChange={(isOpen) => !isOpen && setDialog(null)}>
        {dialog && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 ${DIALOGS[dialog].ok ? 'text-green-700' : 'text-red-700'}`}>
                {DIALOGS[dialog].ok ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {DIALOGS[dialog].title}
              </DialogTitle>
              <DialogDescription>{DIALOGS[dialog].description} ({flow.number} · net {naira(flow.amounts.net_amount)})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className={`text-sm rounded-lg p-4 border ${DIALOGS[dialog].ok ? 'text-gray-700 bg-green-50 border-green-200' : 'text-amber-900 bg-amber-50 border-amber-200'}`}>
                {DIALOGS[dialog].box}
              </p>
              <div className="space-y-2">
                <label htmlFor="dialog-text" className="text-sm font-medium text-gray-700">
                  {DIALOGS[dialog].reason ? 'Reason' : 'Digital signature (type your full name)'}<span className="text-red-500 ml-1">*</span>
                </label>
                {DIALOGS[dialog].reason
                  ? <Textarea id="dialog-text" value={text} onChange={(e) => { setText(e.target.value); setFieldError(''); }}
                              className={`min-h-[100px] ${fieldError ? 'border-red-500' : ''}`} />
                  : <Input id="dialog-text" value={text} onChange={(e) => { setText(e.target.value); setFieldError(''); }} className={fieldError ? 'border-red-500' : ''} />}
              </div>
              {fieldError && <p className="text-sm text-red-600">{fieldError}</p>}
            </div>
            <DialogFooter className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialog(null)} disabled={act.isPending}>Cancel</Button>
              <Button onClick={submitDialog} disabled={act.isPending}
                      className={DIALOGS[dialog].ok ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                      variant={DIALOGS[dialog].ok ? 'default' : 'destructive'}>
                {act.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {DIALOGS[dialog].confirm}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default VoucherDetailPage;
