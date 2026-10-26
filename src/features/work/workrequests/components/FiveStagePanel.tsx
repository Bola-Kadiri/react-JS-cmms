// src/features/work/workrequests/components/FiveStagePanel.tsx
// Stage 1 of the five-stage flow on the Work Request page: chain, timing, history,
// and the Review / Send back / Resubmit / Approve / Reject actions with their dialogs.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle, CheckCircle, CheckCircle2, Clock, Edit, Loader2, Paperclip, RefreshCw, Users, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { workrequestKeys } from '@/hooks/workrequest/useWorkrequestQueries';
import {
  FlowAction, FlowStep, WorkRequestFlow, fetchWorkRequestFlow, takeWorkRequestAction,
} from '@/services/workRequestFlowApi';

type DialogAction = Exclude<FlowAction, 'resubmit'>;

const DIALOGS: Record<DialogAction, {
  title: string; description: string; confirm: string; ok: boolean; box: string; final?: boolean;
  field: 'signature' | 'reason';
}> = {
  review: {
    title: 'Review and send on', description: 'Confirm you have checked this Work Request.', confirm: 'Confirm review',
    ok: true, field: 'signature', box: 'It goes to the client for approval, or straight to Procurement & Store if this client approves the price only.',
  },
  send_back: {
    title: 'Send back to Site Manager', description: 'Explain what must be fixed.', confirm: 'Send back',
    ok: false, field: 'reason', box: 'The facility’s Site Managers fix it and resubmit. This is not final.',
  },
  approve: {
    title: 'Approve Work Request', description: 'You are approving the job to be priced.', confirm: 'Confirm approval',
    ok: true, field: 'signature', box: 'Procurement & Store will get quotes and price the job. No money is committed yet; you approve the price next.',
  },
  reject: {
    title: 'Reject Work Request', description: 'State the reason for rejection.', confirm: 'Reject and close',
    ok: false, final: true, field: 'reason', box: 'This ends the job. It is kept read-only as Rejected and cannot be reopened.',
  },
};

const ACTION_LABEL: Record<FlowAction, string> = {
  review: 'Review and send on', send_back: 'Send back', resubmit: 'Resubmit', approve: 'Approve', reject: 'Reject',
};

const TIMING = {
  on_time: { label: 'On time', className: 'bg-green-100 text-green-800 border-green-200' },
  reminder: { label: 'Due soon', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-100 text-red-800 border-red-200' },
};

const STEP_ORDER: FlowStep[] = ['requester', 'approver', 'client_rep'];

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const took = (seconds: number | null) => {
  if (seconds === null) return null;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} m`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h ${minutes % 60} m` : `${Math.floor(hours / 24)} d ${hours % 24} h`;
};

interface Props {
  slug: string;
  number: string;
}

const FiveStagePanel = ({ slug, number }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [fieldError, setFieldError] = useState('');

  const { data: flow, isLoading } = useQuery({ queryKey: ['workrequest-flow', slug], queryFn: () => fetchWorkRequestFlow(slug) });

  const act = useMutation({
    mutationFn: ({ action, data }: { action: FlowAction; data?: Record<string, string> }) =>
      takeWorkRequestAction(slug, action, data),
    onSuccess: (updated: WorkRequestFlow, { action }) => {
      queryClient.setQueryData(['workrequest-flow', slug], updated);
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success(`${ACTION_LABEL[action]} done`);
      setDialog(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Could not complete the action. Please try again.';
      setFieldError(message);
      toast.error(message);
    },
  });

  if (isLoading || !flow) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>;
  }

  const open = (action: DialogAction) => { setDialog(action); setValue(''); setNote(''); setFieldError(''); };
  const submit = () => {
    if (!dialog) return;
    const meta = DIALOGS[dialog];
    if (!value.trim()) {
      setFieldError(meta.field === 'signature' ? 'Type your full name to sign.' : 'A reason is required.');
      return;
    }
    act.mutate({ action: dialog, data: { [meta.field]: value, ...(dialog === 'review' && note.trim() ? { note } : {}) } });
  };

  const status = flow.status;
  const steps = flow.chain;
  const finished = status === 'Fully Approved';
  const rejected = status === 'Client Rejected';
  const currentIndex = finished ? steps.length : STEP_ORDER.indexOf(flow.waiting_on ?? 'requester');
  const lastReason = [...flow.history].reverse().find((h) => h.reason)?.reason;

  return (
    <div className="space-y-6 mb-6">
      {/* Actions for this person */}
      {flow.my_actions.length > 0 && (
        <div className="bg-white border-2 border-green-600 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-green-800">This Work Request is waiting for you.</p>
          <div className="flex flex-wrap gap-2">
            {flow.my_actions.includes('resubmit') && (
              <>
                <Button variant="outline" onClick={() => navigate(`/dashboard/work/requests/edit/${slug}`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit &amp; correct
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={act.isPending}
                        onClick={() => act.mutate({ action: 'resubmit' })}>
                  {act.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Resubmit
                </Button>
              </>
            )}
            {flow.my_actions.includes('send_back') && (
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => open('send_back')}>
                Send back to Site Manager
              </Button>
            )}
            {flow.my_actions.includes('review') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('review')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Review and send on
              </Button>
            )}
            {flow.my_actions.includes('reject') && (
              <Button variant="destructive" onClick={() => open('reject')}>
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            )}
            {flow.my_actions.includes('approve') && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => open('approve')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
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
          <p className="mt-1">Any Site Manager at this facility can correct it and resubmit. This is not final.</p>
        </div>
      )}
      {rejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold flex items-center gap-2"><XCircle className="h-4 w-4" /> Rejected by the client. This job has ended.</p>
            {lastReason && <p className="mt-1">Reason: {lastReason}</p>}
            <p className="mt-1">It is kept read-only for reference and cannot be reopened.</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => navigate(`/dashboard/work/requests/create?replaces=${slug}`)}>
            Raise a new request from this one
          </Button>
        </div>
      )}
      {finished && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm text-green-900">
          <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Approved — ready for Procurement &amp; Store to price</p>
        </div>
      )}
      {flow.replaces && (
        <p className="text-sm text-gray-600">
          Raised again from{' '}
          <button type="button" className="text-green-700 underline" onClick={() => navigate(`/dashboard/work/requests/view/${flow.replaces!.slug}`)}>
            {flow.replaces.number}
          </button>
          , which the client rejected.
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
        <div className={`grid grid-cols-1 gap-4 ${steps.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {steps.map((entry, index) => {
            const done = !rejected && index < currentIndex;
            const current = !finished && !rejected && index === currentIndex;
            const failed = rejected && entry.step === 'client_rep';
            return (
              <div key={entry.step} className={`p-3 rounded-lg border ${current ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="text-xs text-gray-500 font-medium">Step {index + 1} · {entry.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                  {entry.kind === 'team'
                    ? <><Users className="h-4 w-4 text-green-700" /> Site Managers at this facility ({entry.people})</>
                    : entry.person ?? <span className="text-red-600">Not set</span>}
                </p>
                <p className="text-xs mt-1">
                  {failed ? <span className="text-red-700">Rejected</span>
                    : done ? <span className="text-green-700">Done</span>
                    : current ? <span className="text-blue-700 font-medium">Waiting</span>
                    : <span className="text-gray-400">Next</span>}
                </p>
              </div>
            );
          })}
        </div>
        {!flow.client_approves && (
          <p className="text-xs text-gray-500 mt-3">This client approves the price only, so there is no client step here.</p>
        )}
      </div>

      {/* Supporting documents */}
      {flow.files?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5 text-green-600" /> Supporting documents ({flow.files.length})
          </p>
          <ul className="space-y-1.5 text-sm">
            {flow.files.map((f) => (
              <li key={f.id}>
                {f.url
                  ? <a href={f.url} target="_blank" rel="noreferrer" className="text-green-700 underline break-all">{f.name}</a>
                  : <span>{f.name}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Every step, time stamped</p>
        <ol className="space-y-3">
          {flow.history.map((entry, index) => (
            <li key={index} className="flex flex-wrap justify-between gap-2 text-sm border-b border-gray-100 pb-2 last:border-0">
              <div>
                <p className="font-medium text-gray-800">{entry.label} · {entry.actor}
                  {entry.on_behalf_of && <span className="text-gray-500 font-normal"> on behalf of {entry.on_behalf_of}</span>}
                </p>
                <p className="text-xs text-gray-500">{entry.role}{took(entry.since_previous_seconds) ? ` · took ${took(entry.since_previous_seconds)}` : ''}</p>
                {entry.reason && <p className="text-xs text-gray-700 mt-1">“{entry.reason}”</p>}
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">{when(entry.at)}</span>
            </li>
          ))}
        </ol>
      </div>

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
              {dialog === 'review' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Note to the client (optional)</label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Compressor fault likely; needs a vendor." />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {DIALOGS[dialog].field === 'signature' ? 'Digital signature (type your full name)' : 'Reason'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {DIALOGS[dialog].field === 'signature'
                  ? <Input value={value} onChange={(e) => { setValue(e.target.value); setFieldError(''); }}
                           className={fieldError ? 'border-red-500' : ''} />
                  : <Textarea value={value} onChange={(e) => { setValue(e.target.value); setFieldError(''); }}
                              placeholder="State the reason…" className={`min-h-[100px] ${fieldError ? 'border-red-500' : ''}`} />}
                {fieldError && <p className="text-sm text-red-600">{fieldError}</p>}
              </div>
            </div>
            <DialogFooter className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialog(null)} disabled={act.isPending}>Cancel</Button>
              <Button onClick={submit} disabled={act.isPending}
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

export default FiveStagePanel;
