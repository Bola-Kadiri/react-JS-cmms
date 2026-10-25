// src/features/work/workorders/components/Stage2Panel.tsx
// Stage 2 of the five-stage flow on the Work Order page: pricing (Procurement & Store),
// review (Category Manager), price approval (Client), acceptance (Contractor).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle, CheckCircle, CheckCircle2, Clock, Loader2, Plus, Send, Trash2, Users, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useAllRecords } from '@/hooks/crud/useAllRecords';
import { workorderKeys } from '@/hooks/workorder/useWorkorderQueries';
import {
  WorkOrderFlow, WorkOrderFlowAction, fetchWorkOrderFlow, saveWorkOrderPricing, takeWorkOrderAction,
} from '@/services/workOrderFlowApi';

type DialogAction = 'review' | 'send_back' | 'approve' | 'reject' | 'accept';

const DIALOGS: Record<DialogAction, { title: string; description: string; confirm: string; ok: boolean; box: string; final?: boolean }> = {
  review: {
    title: 'Review and send to client', description: 'Confirm scope and price are right.', confirm: 'Confirm review', ok: true,
    box: 'The client will be asked to approve the client price only. They will not see vendor cost or margin.',
  },
  send_back: {
    title: 'Send back to Procurement & Store', description: 'Explain what must change.', confirm: 'Send back', ok: false,
    box: 'Procurement & Store re-price it and resubmit. This is not final.',
  },
  approve: {
    title: 'Approve the price', description: 'This is the commitment point.', confirm: 'Confirm approval', ok: true,
    box: 'This commits the spend. The contractor will be asked to start.',
  },
  reject: {
    title: 'Reject the price', description: 'State the reason for rejection.', confirm: 'Reject and close', ok: false, final: true,
    box: 'This ends the job. The Work Order and its Work Request are kept read-only as Rejected and cannot be reopened.',
  },
  accept: {
    title: 'Accept the job', description: 'Confirm when you will start and who will do the work.', confirm: 'Accept job', ok: true,
    box: 'When the work is done, the Site Manager raises the completion certificate. You can invoice once it is approved.',
  },
};

const TIMING = {
  on_time: { label: 'On time', className: 'bg-green-100 text-green-800 border-green-200' },
  reminder: { label: 'Due soon', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-100 text-red-800 border-red-200' },
};
const STEP_ORDER = ['procurement', 'approver', 'client_rep'];

const naira = (value?: string | null) => (value == null ? '—' : `₦${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

type EditLine = { description: string; quantity: string; unit_cost_vendor: string; unit_cost_client: string };
const emptyLine: EditLine = { description: '', quantity: '1', unit_cost_vendor: '', unit_cost_client: '' };

interface Props { slug: string; number: string }

const Stage2Panel = ({ slug, number }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: flow, isLoading } = useQuery({ queryKey: ['workorder-flow', slug], queryFn: () => fetchWorkOrderFlow(slug) });
  const canEdit = !!flow?.my_actions.includes('edit_pricing');
  const { data: vendors = [] } = useAllRecords<any>('vendors', 'accounts/api/vendors/', canEdit);

  // Pricing draft (Procurement & Store only).
  const [lines, setLines] = useState<EditLine[]>([emptyLine]);
  const [vendor, setVendor] = useState<number | null>(null);
  const [quoteRef, setQuoteRef] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!flow || !canEdit) return;
    setLines(flow.lines.length ? flow.lines.map((l) => ({
      description: l.description, quantity: l.quantity, unit_cost_vendor: l.unit_cost_vendor ?? '', unit_cost_client: l.unit_cost_client ?? '',
    })) : [emptyLine]);
    setVendor(flow.vendor?.id ?? null);
    setQuoteRef(flow.quotation_reference);
    setPoNumber(flow.po_number);
    setStartDate(flow.expected_start_date ?? '');
    setFiles([]);
  }, [flow, canEdit]);

  // Dialog state.
  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [agree, setAgree] = useState(false);
  const [technician, setTechnician] = useState('');
  const [acceptDate, setAcceptDate] = useState('');
  const [fieldError, setFieldError] = useState('');

  const refresh = (updated: WorkOrderFlow) => {
    queryClient.setQueryData(['workorder-flow', slug], updated);
    queryClient.invalidateQueries({ queryKey: workorderKeys.all });
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
  };
  const onError = (error: any) => {
    const message = error?.response?.data?.error || 'Could not complete the action. Please try again.';
    setFieldError(message);
    toast.error(message);
  };

  const savePricing = useMutation({
    mutationFn: () => saveWorkOrderPricing(slug, {
      lines: lines.filter((l) => l.description.trim() || l.unit_cost_vendor || l.unit_cost_client),
      vendor, quotation_reference: quoteRef, po_number: poNumber, expected_start_date: startDate, files,
    }),
    onSuccess: (updated) => { refresh(updated); toast.success('Pricing saved'); },
    onError,
  });
  const act = useMutation({
    mutationFn: ({ action, data }: { action: Exclude<WorkOrderFlowAction, 'edit_pricing'>; data?: Record<string, unknown> }) =>
      takeWorkOrderAction(slug, action, data),
    onSuccess: (updated) => { refresh(updated); toast.success('Done'); setDialog(null); },
    onError,
  });

  if (isLoading || !flow) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>;
  }

  const open = (action: DialogAction) => {
    setDialog(action); setText(''); setNote(''); setAgree(false); setTechnician('');
    setAcceptDate(flow.expected_start_date ?? ''); setFieldError('');
  };
  const submitDialog = () => {
    if (!dialog) return;
    if (dialog === 'accept') {
      if (!acceptDate || !technician.trim()) { setFieldError('Confirm the start date and name the technician.'); return; }
      act.mutate({ action: 'accept', data: { start_date: acceptDate, technician } });
      return;
    }
    const needsReason = dialog === 'send_back' || dialog === 'reject';
    if (!text.trim()) { setFieldError(needsReason ? 'A reason is required.' : 'Type your full name to sign.'); return; }
    if (dialog === 'approve' && !agree) { setFieldError('Tick to confirm the client agrees to pay this price.'); return; }
    const data: Record<string, unknown> = needsReason ? { reason: text } : { signature: text };
    if (dialog === 'review' && note.trim()) data.note = note;
    if (dialog === 'approve') data.confirmed = true;
    act.mutate({ action: dialog, data });
  };

  const status = flow.status;
  const finished = status === 'Approved';
  const rejected = status === 'Client Rejected';
  const currentIndex = finished ? 3 : STEP_ORDER.indexOf(flow.waiting_on ?? 'procurement');
  const lastReason = [...flow.history].reverse().find((h) => h.reason)?.reason;
  const lineTotal = (l: EditLine, key: 'unit_cost_vendor' | 'unit_cost_client') => (Number(l.quantity) || 0) * (Number(l[key]) || 0);
  const draftVendor = lines.reduce((s, l) => s + lineTotal(l, 'unit_cost_vendor'), 0);
  const draftClient = lines.reduce((s, l) => s + lineTotal(l, 'unit_cost_client'), 0);
  const setLine = (index: number, key: keyof EditLine, value: string) =>
    setLines((all) => all.map((l, i) => (i === index ? { ...l, [key]: value } : l)));

  return (
    <div className="space-y-6 mb-6">
      {/* Actions for this person */}
      {flow.my_actions.some((a) => a !== 'edit_pricing') && (
        <div className="bg-white border-2 border-green-600 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-green-800">This Work Order is waiting for you.</p>
          <div className="flex flex-wrap gap-2">
            {flow.my_actions.includes('submit') && (
              <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={act.isPending || flow.pricing_problems.length > 0}
                      title={flow.pricing_problems.join(' ') || undefined} onClick={() => act.mutate({ action: 'submit' })}>
                {act.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit for review
              </Button>
            )}
            {flow.my_actions.includes('send_back') && (
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => open('send_back')}>
                Send back to Procurement
              </Button>
            )}
            {flow.my_actions.includes('review') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('review')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Review and send to client
              </Button>
            )}
            {flow.my_actions.includes('reject') && (
              <Button variant="destructive" onClick={() => open('reject')}><XCircle className="mr-2 h-4 w-4" /> Reject price</Button>
            )}
            {flow.my_actions.includes('approve') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('approve')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve price
              </Button>
            )}
            {flow.my_actions.includes('accept') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('accept')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Accept job
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Banners */}
      {status === 'Sent Back' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Sent back to Procurement &amp; Store</p>
          {lastReason && <p className="mt-1">Reason: {lastReason}</p>}
          <p className="mt-1">Anyone in Procurement &amp; Store can re-price it and resubmit. This is not final.</p>
        </div>
      )}
      {status === 'Awaiting Client' && flow.my_actions.includes('approve') && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <strong>This is the commitment point.</strong> Approving instructs the vendor and commits the spend. Rejecting ends the job.
        </div>
      )}
      {rejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
          <p className="font-semibold flex items-center gap-2"><XCircle className="h-4 w-4" /> Rejected by the client. This job has ended.</p>
          {lastReason && <p className="mt-1">Reason: {lastReason}</p>}
          <p className="mt-1">The Work Order and its Work Request are kept read-only for reference.</p>
        </div>
      )}
      {finished && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm text-green-900">
          <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Price approved by the client — spend committed</p>
          {flow.accepted
            ? <p className="mt-1">The contractor accepted the job: start {flow.accepted.start_date}, technician {flow.accepted.technician}.</p>
            : <p className="mt-1">Waiting for the contractor to accept the job.</p>}
        </div>
      )}
      {flow.source_work_request && (
        <p className="text-sm text-gray-600">
          From Work Request{' '}
          <button type="button" className="text-green-700 underline"
                  onClick={() => navigate(`/dashboard/work/requests/view/${flow.source_work_request!.slug}`)}>
            {flow.source_work_request.number}
          </button>
        </p>
      )}

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
            const done = !rejected && index < currentIndex;
            const current = !finished && !rejected && index === currentIndex;
            return (
              <div key={entry.step} className={`p-3 rounded-lg border ${current ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xs text-gray-500 font-medium">Step {index + 1} · {entry.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                  {entry.kind === 'team'
                    ? <><Users className="h-4 w-4 text-green-700" /> Procurement &amp; Store team ({entry.people})</>
                    : entry.person ?? <span className="text-red-600">Not set</span>}
                </p>
                <p className="text-xs mt-1">
                  {rejected && entry.step === 'client_rep' ? <span className="text-red-700">Rejected</span>
                    : done ? <span className="text-green-700">Done</span>
                    : current ? <span className="text-blue-700 font-medium">Waiting</span>
                    : <span className="text-gray-400">Next</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing: editable for Procurement & Store, read-only (role-masked) for everyone else */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="p-5 bg-green-50 border-b border-green-100 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-green-800">{canEdit ? 'Price this job' : 'Price'}</h2>
          {flow.pricing.client_price !== undefined && (
            <span className="text-sm text-green-900">Client price <strong>{naira(canEdit ? String(draftClient) : flow.pricing.client_price)}</strong></span>
          )}
        </div>
        <div className="p-5 space-y-5">
          {canEdit ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Vendor<span className="text-red-500 ml-1">*</span></label>
                  <Select value={vendor ? String(vendor) : undefined} onValueChange={(v) => setVendor(Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Select the vendor" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((v: any) => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.name}{v.has_bank_details === false ? ' (no bank details)' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Only vendors with bank details can be submitted.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quotation reference<span className="text-red-500 ml-1">*</span></label>
                  <Input value={quoteRef} onChange={(e) => setQuoteRef(e.target.value)} placeholder="e.g. CA-Q-2210" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">PO number<span className="text-red-500 ml-1">*</span></label>
                  <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="e.g. PO-2026-0341" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Expected start<span className="text-red-500 ml-1">*</span></label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow>
                      <TableHead className="text-green-800">Item</TableHead>
                      <TableHead className="text-green-800 w-24">Qty</TableHead>
                      <TableHead className="text-green-800 w-40">Vendor cost (₦)</TableHead>
                      <TableHead className="text-green-800 w-40">Client price (₦)</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell><Input value={line.description} onChange={(e) => setLine(index, 'description', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" min="0" value={line.quantity} onChange={(e) => setLine(index, 'quantity', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" min="0" step="0.01" value={line.unit_cost_vendor} onChange={(e) => setLine(index, 'unit_cost_vendor', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" min="0" step="0.01" value={line.unit_cost_client} onChange={(e) => setLine(index, 'unit_cost_client', e.target.value)} /></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" aria-label="Remove line" disabled={lines.length === 1}
                                  onClick={() => setLines((all) => all.filter((_, i) => i !== index))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setLines((all) => [...all, emptyLine])}><Plus className="mr-2 h-4 w-4" /> Add line</Button>
                <p className="text-sm text-gray-700">
                  Vendor cost <strong>{naira(String(draftVendor))}</strong> · Client price <strong>{naira(String(draftClient))}</strong> ·
                  Margin <strong className={draftClient < draftVendor ? 'text-red-600' : ''}>{naira(String(draftClient - draftVendor))}</strong>
                  {draftClient > 0 && ` (${(((draftClient - draftVendor) / draftClient) * 100).toFixed(1)}%)`}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Vendor's quotation<span className="text-red-500 ml-1">*</span></label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                {flow.files.length > 0 && (
                  <p className="text-xs text-gray-600">Attached: {flow.files.map((f) => f.name).join(', ')}</p>
                )}
              </div>
              {flow.pricing_problems.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-medium">Before submitting:</p>
                  <ul className="list-disc pl-6">{flow.pricing_problems.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              )}
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={savePricing.isPending} onClick={() => savePricing.mutate()}>
                  {savePricing.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save pricing
                </Button>
              </div>
            </>
          ) : (
            <>
              {(flow.vendor || flow.quotation_reference || flow.po_number) && (
                <div className="grid gap-3 md:grid-cols-4 text-sm">
                  {flow.vendor && <div><p className="text-xs text-gray-500">Vendor</p><p className="font-medium">{flow.vendor.name}</p></div>}
                  {flow.quotation_reference && <div><p className="text-xs text-gray-500">Quotation</p><p className="font-medium">{flow.quotation_reference}</p></div>}
                  {flow.po_number && <div><p className="text-xs text-gray-500">PO</p><p className="font-medium">{flow.po_number}</p></div>}
                  {flow.expected_start_date && <div><p className="text-xs text-gray-500">Expected start</p><p className="font-medium">{flow.expected_start_date}</p></div>}
                </div>
              )}
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow>
                      <TableHead className="text-green-800">Scope of work</TableHead>
                      <TableHead className="text-green-800">Qty</TableHead>
                      {flow.lines[0]?.total_vendor !== undefined && <TableHead className="text-green-800">Vendor cost</TableHead>}
                      {flow.lines[0]?.total_client !== undefined && <TableHead className="text-green-800">Client price</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flow.lines.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-6">Not priced yet.</TableCell></TableRow>
                    ) : flow.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell>{line.quantity}</TableCell>
                        {line.total_vendor !== undefined && <TableCell>{naira(line.total_vendor)}</TableCell>}
                        {line.total_client !== undefined && <TableCell>{naira(line.total_client)}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                {flow.pricing.vendor_cost !== undefined && <span>Vendor cost <strong>{naira(flow.pricing.vendor_cost)}</strong></span>}
                {flow.pricing.client_price !== undefined && <span>Client price <strong>{naira(flow.pricing.client_price)}</strong></span>}
                {flow.pricing.margin !== undefined && <span>Margin <strong>{naira(flow.pricing.margin)}</strong>{flow.pricing.margin_percent != null && ` (${flow.pricing.margin_percent}%)`}</span>}
              </div>
              {flow.files.length > 0 && (
                <p className="text-sm">Quotation: {flow.files.map((f) => f.url
                  ? <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="text-green-700 underline mr-2">{f.name}</a>
                  : <span key={f.id} className="mr-2">{f.name}</span>)}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Price check for the Category Manager */}
      {flow.price_check.length > 0 && (
        <div className="rounded-lg border bg-white shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Price check: similar past jobs</p>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Job</TableHead><TableHead>Facility</TableHead><TableHead>Vendor</TableHead><TableHead>Client price</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {flow.price_check.map((p) => (
                <TableRow key={p.number}>
                  <TableCell>WO {p.number}</TableCell><TableCell>{p.facility ?? '—'}</TableCell>
                  <TableCell>{p.vendor ?? '—'}</TableCell><TableCell>{naira(p.client_price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <DialogDescription>{DIALOGS[dialog].description} (#{number})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className={`text-sm rounded-lg p-4 border ${DIALOGS[dialog].ok ? 'text-gray-700 bg-green-50 border-green-200'
                : DIALOGS[dialog].final ? 'text-red-800 bg-red-50 border-red-200' : 'text-amber-900 bg-amber-50 border-amber-200'}`}>
                {DIALOGS[dialog].box}
              </p>
              {dialog === 'accept' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Start date<span className="text-red-500 ml-1">*</span></label>
                    <Input type="date" value={acceptDate} onChange={(e) => { setAcceptDate(e.target.value); setFieldError(''); }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Technician<span className="text-red-500 ml-1">*</span></label>
                    <Input value={technician} onChange={(e) => { setTechnician(e.target.value); setFieldError(''); }} placeholder="Who will do the work" />
                  </div>
                </>
              ) : (
                <>
                  {dialog === 'review' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Note (optional)</label>
                      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Scope and price OK." />
                    </div>
                  )}
                  {dialog === 'approve' && (
                    <label className="flex items-start gap-2 text-sm">
                      <Checkbox checked={agree} onCheckedChange={(v) => { setAgree(!!v); setFieldError(''); }} />
                      <span>I confirm we agree to pay <strong>{naira(flow.pricing.client_price)}</strong> for this job.</span>
                    </label>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {dialog === 'send_back' || dialog === 'reject' ? 'Reason' : 'Digital signature (type your full name)'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    {dialog === 'send_back' || dialog === 'reject'
                      ? <Textarea value={text} onChange={(e) => { setText(e.target.value); setFieldError(''); }}
                                  placeholder="State the reason…" className={`min-h-[100px] ${fieldError ? 'border-red-500' : ''}`} />
                      : <Input value={text} onChange={(e) => { setText(e.target.value); setFieldError(''); }}
                               className={fieldError ? 'border-red-500' : ''} />}
                  </div>
                </>
              )}
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

export default Stage2Panel;
