// src/features/work/invoiceitems/components/Stage4Panel.tsx
// Stage 4 of the five-stage flow on the invoice page: the contractor (or AP for them) fills
// in the invoice, AP Officers run the three-way check, the Head of Finance & Treasury approves.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, CheckCircle2, Clock, Loader2, Send, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { InvoiceFlow, fetchInvoiceFlow, saveInvoiceDetails, takeInvoiceAction } from '@/services/invoiceFlowApi';

type DialogAction = 'review' | 'return' | 'approve';

const DIALOGS: Record<DialogAction, { title: string; description: string; confirm: string; ok: boolean; box: string }> = {
  review: {
    title: 'Approve — Three-Way Audit', description: 'Work Order, WCC and invoice match.', confirm: 'Confirm check', ok: true,
    box: 'The Head of Finance & Treasury will be asked to approve the invoice.',
  },
  return: {
    title: 'Return the invoice', description: 'Describe exactly what does not match.', confirm: 'Return invoice', ok: false,
    box: 'It goes back to be corrected and resubmitted. This is not final.',
  },
  approve: {
    title: 'Approve invoice', description: 'Accept this invoice for payment.', confirm: 'Confirm approval', ok: true,
    box: 'AP will raise the payment voucher. The contractor sees “Approved · payment being prepared”.',
  },
};

const TIMING = {
  on_time: { label: 'On time', className: 'bg-green-100 text-green-800 border-green-200' },
  reminder: { label: 'Due soon', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-100 text-red-800 border-red-200' },
};

const naira = (value?: string | null) => (value == null ? '—' : `₦${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const VAT_RATE = 0.075;

interface Props { id: number }

const Stage4Panel = ({ id }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: flow, isLoading } = useQuery({ queryKey: ['invoice-flow', id], queryFn: () => fetchInvoiceFlow(id) });
  const canEdit = !!flow?.my_actions.includes('edit');

  const [form, setForm] = useState({ vendor_invoice_number: '', invoice_date: '', amount: '', vat_charged: false });
  const [files, setFiles] = useState<File[]>([]);
  useEffect(() => {
    if (!flow || !canEdit) return;
    setForm({
      vendor_invoice_number: flow.details.vendor_invoice_number, invoice_date: flow.details.invoice_date ?? '',
      amount: Number(flow.details.amount) ? flow.details.amount : '', vat_charged: flow.details.vat_charged,
    });
    setFiles([]);
  }, [flow, canEdit]);

  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [text, setText] = useState('');
  const [fieldError, setFieldError] = useState('');

  const refresh = (updated: InvoiceFlow) => {
    queryClient.setQueryData(['invoice-flow', id], updated);
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['invoiceitems'] });
  };
  const onError = (error: any) => {
    const message = error?.response?.data?.error || 'Could not complete the action. Please try again.';
    setFieldError(message);
    toast.error(message);
  };

  const save = useMutation({
    mutationFn: () => saveInvoiceDetails(id, { ...form, files }),
    onSuccess: (updated) => { refresh(updated); toast.success('Invoice saved'); },
    onError,
  });
  const act = useMutation({
    mutationFn: ({ action, data }: { action: 'submit' | DialogAction; data?: Record<string, unknown> }) => takeInvoiceAction(id, action, data),
    onSuccess: (updated) => { refresh(updated); toast.success('Done'); setDialog(null); },
    onError,
  });

  if (isLoading || !flow) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>;
  }

  const open = (action: DialogAction) => { setDialog(action); setText(''); setFieldError(''); };
  const submitDialog = () => {
    if (!dialog) return;
    if (!text.trim()) { setFieldError(dialog === 'return' ? 'A reason is required.' : 'Type your full name to sign.'); return; }
    act.mutate({ action: dialog, data: dialog === 'return' ? { reason: text } : { signature: text } });
  };

  const status = flow.status;
  const approved = status === 'Approved';
  const order = flow.chain.map((c) => c.step);
  const currentIndex = approved ? order.length : order.indexOf(flow.waiting_on ?? order[0]);
  const lastReason = [...flow.history].reverse().find((h) => h.action === 'sent_back')?.reason;
  const woAmount = Number(flow.work_order?.amount ?? 0);
  const draftAmount = Number(form.amount) || 0;
  const draftVat = form.vat_charged ? Math.round(draftAmount * VAT_RATE * 100) / 100 : 0;

  return (
    <div className="space-y-6">
      {/* Actions for this person */}
      {flow.my_actions.some((a) => a !== 'edit') && (
        <div className="bg-white border-2 border-green-600 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-green-800">This invoice is waiting for you.</p>
          <div className="flex flex-wrap gap-2">
            {flow.my_actions.includes('submit') && (
              <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={act.isPending || flow.problems.length > 0}
                      title={flow.problems.join(' ') || undefined} onClick={() => act.mutate({ action: 'submit' })}>
                {act.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit invoice
              </Button>
            )}
            {flow.my_actions.includes('return') && (
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => open('return')}>
                Return invoice
              </Button>
            )}
            {flow.my_actions.includes('review') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={flow.match.some((m) => !m.ok)}
                      title={flow.match.some((m) => !m.ok) ? 'Every check must pass. Return it instead.' : undefined}
                      onClick={() => open('review')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Checked — send to Head of Finance
              </Button>
            )}
            {flow.my_actions.includes('approve') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('approve')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve invoice
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Banners */}
      {status === 'Returned' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Returned for correction</p>
          {lastReason && <p className="mt-1">Reason: {lastReason}</p>}
        </div>
      )}
      {approved && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm text-green-900">
          {flow.payment?.status === 'Paid' ? (
            <p className="font-semibold flex items-center gap-2 flex-wrap">
              <CheckCircle2 className="h-4 w-4" /> Paid{flow.payment.paid_at && ` · ${when(flow.payment.paid_at)}`}
              <button type="button" className="text-green-700 underline font-normal" onClick={() => navigate(`/dashboard/payments/${flow.payment!.voucher_id}`)}>
                View remittance advice
              </button>
            </p>
          ) : (
            <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Invoice approved — payment being prepared</p>
          )}
        </div>
      )}
      {flow.entered_for_vendor && (
        <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          Entered by an AP Officer for {flow.vendor?.name ?? 'the vendor'}, who has no login. Another AP Officer checks it.
        </p>
      )}
      <p className="text-sm text-gray-600">
        For Work Order{' '}
        {flow.work_order && (
          <button type="button" className="text-green-700 underline" onClick={() => navigate(`/dashboard/work/orders/view/${flow.work_order!.slug}`)}>
            {flow.work_order.number}
          </button>
        )}
        {flow.completion && <> · certificate{' '}
          <button type="button" className="text-green-700 underline" onClick={() => navigate(`/dashboard/work/work-order-completions/${flow.completion!.id}`)}>
            WCC-{flow.completion.number}
          </button></>}
        {flow.vendor && ` · ${flow.vendor.name}`}
      </p>

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
            const done = index < currentIndex;
            const current = !approved && index === currentIndex;
            return (
              <div key={`${entry.step}-${index}`} className={`p-3 rounded-lg border ${current ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xs text-gray-500 font-medium">Step {index + 1} · {entry.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                  {entry.kind === 'team'
                    ? <><Users className="h-4 w-4 text-green-700" /> {entry.label} ({entry.people})</>
                    : entry.person ?? <span className="text-red-600">Not set</span>}
                </p>
                <p className="text-xs mt-1">
                  {done ? <span className="text-green-700">Done</span>
                    : current ? <span className="text-blue-700 font-medium">Waiting</span>
                    : <span className="text-gray-400">Next</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice */}
      <div className="rounded-lg border-2 border-green-600 bg-white shadow-sm overflow-hidden">
        <div className="p-5 bg-green-50 border-b border-green-100 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-green-800">Invoice</h2>
          {flow.work_order?.amount && <span className="text-sm text-green-900">Work Order amount <strong>{naira(flow.work_order.amount)}</strong></span>}
        </div>
        <div className="p-5">
          {canEdit ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your invoice number<span className="text-red-500 ml-1">*</span></label>
                  <Input value={form.vendor_invoice_number} onChange={(e) => setForm({ ...form, vendor_invoice_number: e.target.value })} placeholder="e.g. INV-CA-0912" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Invoice date<span className="text-red-500 ml-1">*</span></label>
                  <Input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Amount (₦)<span className="text-red-500 ml-1">*</span></label>
                  <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                         className={draftAmount > woAmount ? 'border-red-500' : ''} />
                  <p className={`text-xs ${draftAmount > woAmount ? 'text-red-600' : 'text-gray-500'}`}>
                    Cannot be more than the Work Order amount of {naira(flow.work_order?.amount)}.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">VAT (optional)</label>
                  <label className="flex items-center gap-2 h-10 text-sm">
                    <Checkbox checked={form.vat_charged} onCheckedChange={(v) => setForm({ ...form, vat_charged: !!v })} />
                    Charge VAT at 7.5%{form.vat_charged ? ` · ${naira(String(draftVat))}` : ''}
                  </label>
                  <p className="text-xs text-gray-500">Tick only if your company is VAT-registered.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Invoice PDF<span className="text-red-500 ml-1">*</span></label>
                <Input type="file" accept=".pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                {flow.files.length > 0 && <p className="text-xs text-gray-600">Attached: {flow.files.map((f) => f.name).join(', ')}</p>}
              </div>
              {flow.vendor && (
                <p className="text-sm text-gray-700">Pay into: {flow.vendor.bank ?? '—'} ****{flow.vendor.account_last4} · {flow.vendor.name} (from the vendor record)</p>
              )}
              <p className="text-sm text-gray-800">Total <strong>{naira(String(draftAmount + draftVat))}</strong></p>
              {flow.problems.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-medium">Before submitting:</p>
                  <ul className="list-disc pl-6">{flow.problems.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              )}
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={save.isPending} onClick={() => save.mutate()}>
                  {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save invoice
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4 text-sm">
              <div><p className="text-xs text-gray-500">Vendor invoice no.</p><p className="font-medium">{flow.details.vendor_invoice_number || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Invoice date</p><p className="font-medium">{flow.details.invoice_date ?? '—'}</p></div>
              <div><p className="text-xs text-gray-500">Amount</p><p className="font-medium">{naira(flow.details.amount)}</p></div>
              <div><p className="text-xs text-gray-500">VAT</p><p className="font-medium">{flow.details.vat_charged ? naira(flow.details.vat) : 'Not charged'}</p></div>
              <div><p className="text-xs text-gray-500">Total</p><p className="font-semibold">{naira(flow.details.total)}</p></div>
              <div className="md:col-span-3"><p className="text-xs text-gray-500">Invoice file</p>
                <p>{flow.files.length ? flow.files.map((f) => f.url
                  ? <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="text-green-700 underline mr-2">{f.name}</a>
                  : <span key={f.id} className="mr-2">{f.name}</span>) : '—'}</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Three-way match (internal) */}
      {flow.match.length > 0 && (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <div className="p-5 bg-green-50 border-b border-green-100"><h2 className="text-lg font-semibold text-green-800">Invoice checks</h2></div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Check</TableHead><TableHead>Expected</TableHead><TableHead>On invoice</TableHead><TableHead>Result</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {flow.match.map((row) => (
                  <TableRow key={row.check}>
                    <TableCell>{row.check}</TableCell><TableCell>{row.expected}</TableCell><TableCell>{row.actual}</TableCell>
                    <TableCell>{row.ok ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

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
              <DialogDescription>{DIALOGS[dialog].description} ({flow.number})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className={`text-sm rounded-lg p-4 border ${DIALOGS[dialog].ok ? 'text-gray-700 bg-green-50 border-green-200' : 'text-amber-900 bg-amber-50 border-amber-200'}`}>
                {DIALOGS[dialog].box}
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {dialog === 'return' ? 'Discrepancy / reason' : 'Digital signature (type your full name)'}<span className="text-red-500 ml-1">*</span>
                </label>
                {dialog === 'return'
                  ? <Textarea value={text} onChange={(e) => { setText(e.target.value); setFieldError(''); }}
                              placeholder="Describe exactly what doesn't match…" className={`min-h-[100px] ${fieldError ? 'border-red-500' : ''}`} />
                  : <Input value={text} onChange={(e) => { setText(e.target.value); setFieldError(''); }} className={fieldError ? 'border-red-500' : ''} />}
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

export default Stage4Panel;
