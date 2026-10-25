// src/features/work/work-order-completions/components/Stage3Panel.tsx
// Stage 3 of the five-stage flow on the certificate page: Site Managers fill in the work
// done and the three pieces of evidence, Central Operations verify on site, the
// Category Manager approves. Send-backs return it to the Site Managers.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, CheckCircle2, Clock, FileCheck, Loader2, Send, Upload, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  CompletionFlow, EvidenceKind, fetchCompletionFlow, saveCompletionDetails, takeCompletionAction, uploadCompletionEvidence,
} from '@/services/completionFlowApi';

type DialogAction = 'verify' | 'send_back' | 'approve';

const DIALOGS: Record<DialogAction, { title: string; description: string; confirm: string; ok: boolean; box: string }> = {
  verify: {
    title: 'Work verified', description: 'Confirm you have checked the work on site.', confirm: 'Confirm verification', ok: true,
    box: 'The Category Manager will be asked to approve the certificate.',
  },
  send_back: {
    title: 'Send back to Site Manager', description: 'Explain what must be fixed.', confirm: 'Send back', ok: false,
    box: 'The facility’s Site Managers fix it and resubmit; the check then starts again at Central Operations. This is not final.',
  },
  approve: {
    title: 'Approve the certificate', description: 'Confirm the work is complete and to standard.', confirm: 'Confirm approval', ok: true,
    box: 'The contractor will be told they can submit their invoice.',
  },
};

const TIMING = {
  on_time: { label: 'On time', className: 'bg-green-100 text-green-800 border-green-200' },
  reminder: { label: 'Due soon', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-100 text-red-800 border-red-200' },
};
const STEP_ORDER = ['requester', 'central_operation', 'approver'];

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const duration = (minutes: number | null) => (minutes == null ? null : `${Math.floor(minutes / 60)} h ${minutes % 60} min`);

interface Props { id: number }

const Stage3Panel = ({ id }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: flow, isLoading } = useQuery({ queryKey: ['completion-flow', id], queryFn: () => fetchCompletionFlow(id) });
  const canEdit = !!flow?.my_actions.includes('edit');

  const [details, setDetails] = useState({ started_at: '', finished_at: '', technician: '', vendor_rating: '', completion_notes: '' });
  useEffect(() => {
    if (!flow || !canEdit) return;
    setDetails({
      started_at: toLocalInput(flow.details.started_at), finished_at: toLocalInput(flow.details.finished_at),
      technician: flow.details.technician, vendor_rating: flow.details.vendor_rating ? String(flow.details.vendor_rating) : '',
      completion_notes: flow.details.completion_notes,
    });
  }, [flow, canEdit]);

  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [fieldError, setFieldError] = useState('');

  const refresh = (updated: CompletionFlow) => {
    queryClient.setQueryData(['completion-flow', id], updated);
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['workordercompletions'] });
  };
  const onError = (error: any) => {
    const message = error?.response?.data?.error || 'Could not complete the action. Please try again.';
    setFieldError(message);
    toast.error(message);
  };

  const saveDetails = useMutation({
    mutationFn: () => saveCompletionDetails(id, details),
    onSuccess: (updated) => { refresh(updated); toast.success('Details saved'); },
    onError,
  });
  const upload = useMutation({
    mutationFn: ({ kind, file }: { kind: EvidenceKind; file: File }) => uploadCompletionEvidence(id, kind, file),
    onSuccess: (updated) => { refresh(updated); toast.success('Evidence attached'); },
    onError,
  });
  const act = useMutation({
    mutationFn: ({ action, data }: { action: 'submit' | DialogAction; data?: Record<string, unknown> }) =>
      takeCompletionAction(id, action, data),
    onSuccess: (updated) => { refresh(updated); toast.success('Done'); setDialog(null); },
    onError,
  });

  if (isLoading || !flow) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>;
  }

  const open = (action: DialogAction) => {
    setDialog(action); setText(''); setNote(''); setVisitDate(new Date().toISOString().slice(0, 10)); setFieldError('');
  };
  const submitDialog = () => {
    if (!dialog) return;
    if (dialog === 'send_back') {
      if (!text.trim()) { setFieldError('A reason is required.'); return; }
      act.mutate({ action: 'send_back', data: { reason: text } });
      return;
    }
    if (!text.trim()) { setFieldError('Type your full name to sign.'); return; }
    if (dialog === 'verify') {
      if (!visitDate) { setFieldError('Enter the date you checked the work on site.'); return; }
      act.mutate({ action: 'verify', data: { signature: text, site_visit_date: visitDate, ...(note.trim() ? { note } : {}) } });
      return;
    }
    act.mutate({ action: 'approve', data: { signature: text } });
  };

  const status = flow.status;
  const approved = status === 'Approved';
  const currentIndex = approved ? 3 : STEP_ORDER.indexOf(flow.waiting_on ?? 'requester');
  const lastReason = [...flow.history].reverse().find((h) => h.action === 'sent_back')?.reason;
  const setField = (key: keyof typeof details, value: string) => setDetails((d) => ({ ...d, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Actions for this person */}
      {flow.my_actions.some((a) => a !== 'edit') && (
        <div className="bg-white border-2 border-green-600 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-green-800">This certificate is waiting for you.</p>
          <div className="flex flex-wrap gap-2">
            {flow.my_actions.includes('submit') && (
              <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={act.isPending || flow.problems.length > 0}
                      title={flow.problems.join(' ') || undefined} onClick={() => act.mutate({ action: 'submit' })}>
                {act.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit certificate
              </Button>
            )}
            {flow.my_actions.includes('send_back') && (
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => open('send_back')}>
                Send back to Site Manager
              </Button>
            )}
            {flow.my_actions.includes('verify') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('verify')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Verified — send to Category Manager
              </Button>
            )}
            {flow.my_actions.includes('approve') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={flow.problems.length > 0}
                      title={flow.problems.join(' ') || undefined} onClick={() => open('approve')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve certificate
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Banners */}
      {status === 'Sent Back' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Sent back to the Site Manager</p>
          {lastReason && <p className="mt-1">Reason: {lastReason}</p>}
          <p className="mt-1">Any Site Manager at this facility can fix it and resubmit. The check then starts again at Central Operations.</p>
        </div>
      )}
      {approved && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm text-green-900">
          <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Work approved as complete</p>
          <p className="mt-1">The contractor can now submit their invoice.</p>
        </div>
      )}
      <p className="text-sm text-gray-600">
        For Work Order{' '}
        <button type="button" className="text-green-700 underline" onClick={() => navigate(`/dashboard/work/orders/view/${flow.work_order.slug}`)}>
          {flow.work_order.number}
        </button>
        {flow.work_order.vendor ? ` · ${flow.work_order.vendor}` : ''}{flow.work_order.facility ? ` · ${flow.work_order.facility}` : ''}
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
              <div key={entry.step} className={`p-3 rounded-lg border ${current ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xs text-gray-500 font-medium">Step {index + 1} · {entry.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                  {entry.kind === 'team'
                    ? <><Users className="h-4 w-4 text-green-700" /> {entry.label} team ({entry.people})</>
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

      {/* Work done */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="p-5 bg-green-50 border-b border-green-100"><h2 className="text-lg font-semibold text-green-800">Work done</h2></div>
        <div className="p-5">
          {canEdit ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Work started<span className="text-red-500 ml-1">*</span></label>
                  <Input type="datetime-local" value={details.started_at} onChange={(e) => setField('started_at', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Work finished<span className="text-red-500 ml-1">*</span></label>
                  <Input type="datetime-local" value={details.finished_at} onChange={(e) => setField('finished_at', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Technician<span className="text-red-500 ml-1">*</span></label>
                  <Input value={details.technician} onChange={(e) => setField('technician', e.target.value)} placeholder="Vendor's person on site" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your rating of the vendor<span className="text-red-500 ml-1">*</span></label>
                  <Select value={details.vendor_rating || undefined} onValueChange={(v) => setField('vendor_rating', v)}>
                    <SelectTrigger><SelectValue placeholder="Select 1–5" /></SelectTrigger>
                    <SelectContent>
                      {['5', '4', '3', '2', '1'].map((r) => <SelectItem key={r} value={r}>{r} out of 5</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Completion notes<span className="text-red-500 ml-1">*</span></label>
                <Textarea value={details.completion_notes} onChange={(e) => setField('completion_notes', e.target.value)}
                          placeholder="What was done, and anything the next person should know." />
              </div>
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={saveDetails.isPending} onClick={() => saveDetails.mutate()}>
                  {saveDetails.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save details
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div><p className="text-xs text-gray-500">Started</p><p className="font-medium">{flow.details.started_at ? when(flow.details.started_at) : '—'}</p></div>
              <div><p className="text-xs text-gray-500">Finished</p><p className="font-medium">{flow.details.finished_at ? when(flow.details.finished_at) : '—'}</p></div>
              <div><p className="text-xs text-gray-500">Time on job</p><p className="font-medium">{duration(flow.details.time_on_job_minutes) ?? '—'}</p></div>
              <div><p className="text-xs text-gray-500">Technician</p><p className="font-medium">{flow.details.technician || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Vendor rating</p><p className="font-medium">{flow.details.vendor_rating ? `${flow.details.vendor_rating} / 5` : '—'}</p></div>
              <div><p className="text-xs text-gray-500">Site visit (Central Ops)</p><p className="font-medium">{flow.details.site_visit_date ?? '—'}</p></div>
              <div className="md:col-span-3"><p className="text-xs text-gray-500">Completion notes</p><p className="font-medium">{flow.details.completion_notes || '—'}</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Evidence */}
      <div className="rounded-lg border-2 border-green-600 bg-white shadow-sm overflow-hidden">
        <div className="p-5 bg-green-50 border-b border-green-100">
          <h2 className="text-lg font-semibold text-green-800">Evidence (all required)</h2>
        </div>
        <div className="p-5 grid gap-4 md:grid-cols-3">
          {flow.evidence.map((item) => (
            <div key={item.kind} className={`rounded-lg border p-4 space-y-2 ${item.file ? 'border-green-200' : 'border-red-200 bg-red-50/40'}`}>
              <p className="text-sm font-semibold flex items-center gap-2">
                {item.file ? <FileCheck className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                {item.label}
              </p>
              {item.file
                ? <a href={item.file.url} target="_blank" rel="noreferrer" className="text-sm text-green-700 underline break-all">{item.file.name}</a>
                : <p className="text-sm text-red-600">Not attached yet</p>}
              {canEdit && (
                <label className="inline-flex items-center gap-2 text-sm text-green-800 cursor-pointer">
                  <Upload className="h-4 w-4" /> {item.file ? 'Replace' : 'Upload'}
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" disabled={upload.isPending}
                         onChange={(e) => { const file = e.target.files?.[0]; if (file) upload.mutate({ kind: item.kind, file }); e.target.value = ''; }} />
                </label>
              )}
            </div>
          ))}
        </div>
        {flow.problems.length > 0 && (
          <div className="mx-5 mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-medium">{canEdit ? 'Before submitting:' : 'Cannot be approved yet:'}</p>
            <ul className="list-disc pl-6">{flow.problems.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        )}
      </div>

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
              <DialogDescription>{DIALOGS[dialog].description} (WCC-{flow.number})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className={`text-sm rounded-lg p-4 border ${DIALOGS[dialog].ok ? 'text-gray-700 bg-green-50 border-green-200' : 'text-amber-900 bg-amber-50 border-amber-200'}`}>
                {DIALOGS[dialog].box}
              </p>
              {dialog === 'verify' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Site visit date<span className="text-red-500 ml-1">*</span></label>
                    <Input type="date" value={visitDate} onChange={(e) => { setVisitDate(e.target.value); setFieldError(''); }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Note (optional)</label>
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Unit cooling at 18°C, area clean." />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {dialog === 'send_back' ? 'Reason' : 'Digital signature (type your full name)'}<span className="text-red-500 ml-1">*</span>
                </label>
                {dialog === 'send_back'
                  ? <Textarea value={text} onChange={(e) => { setText(e.target.value); setFieldError(''); }}
                              placeholder="e.g. After photo is blurry…" className={`min-h-[100px] ${fieldError ? 'border-red-500' : ''}`} />
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

export default Stage3Panel;
