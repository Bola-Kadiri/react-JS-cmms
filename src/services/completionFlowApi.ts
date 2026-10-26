// src/services/completionFlowApi.ts
// Five-stage flow, Stage 3 (Work Completion Certificate): details, evidence, verification, approval.
import { api } from './apiClient';
import { ChainEntry, FlowTiming, HistoryEntry } from './workRequestFlowApi';

const WCC_API_BASE = '/work/api/work-order-completions';

export type EvidenceKind = 'before_photo' | 'after_photo' | 'signed_checklist';
export type CompletionAction = 'edit' | 'submit' | 'verify' | 'send_back' | 'approve';

export interface CompletionFlow {
  flow: 'legacy' | 'five_stage';
  status: string;
  number: string;
  waiting_on: 'requester' | 'central_operation' | 'approver' | null;
  chain: (Omit<ChainEntry, 'step'> & { step: 'requester' | 'central_operation' | 'approver' })[];
  work_order: { slug: string; number: string; description: string; facility: string | null; vendor: string | null };
  details: {
    started_at: string | null;
    finished_at: string | null;
    technician: string;
    vendor_rating: number | null;
    completion_notes: string;
    site_visit_date: string | null;
    time_on_job_minutes: number | null;
  };
  evidence: {
    kind: EvidenceKind; label: string;
    files: { id: number; url: string; name: string; uploaded_at: string }[];
    file: { id: number; url: string; name: string; uploaded_at: string } | null;
  }[];
  problems: string[];
  history: HistoryEntry[];
  timing: FlowTiming | null;
  my_actions: CompletionAction[];
}

export interface CompletionDetailsInput {
  started_at: string;
  finished_at: string;
  technician: string;
  vendor_rating: string;
  completion_notes: string;
}

export const startCompletion = async (workOrderSlug: string): Promise<CompletionFlow & { id: number }> =>
  (await api.post(`${WCC_API_BASE}/flow-start/`, { work_order: workOrderSlug })).data;

export const fetchCompletionFlow = async (id: number | string): Promise<CompletionFlow> =>
  (await api.get(`${WCC_API_BASE}/${id}/flow/`)).data;

export const saveCompletionDetails = async (id: number | string, input: CompletionDetailsInput): Promise<CompletionFlow> =>
  (await api.post(`${WCC_API_BASE}/${id}/flow-details/`, {
    ...input,
    // datetime-local values have no time zone; send them as the browser's local time.
    started_at: input.started_at ? new Date(input.started_at).toISOString() : '',
    finished_at: input.finished_at ? new Date(input.finished_at).toISOString() : '',
  })).data;

export const uploadCompletionEvidence = async (id: number | string, kind: EvidenceKind, files: File[]): Promise<CompletionFlow> => {
  const form = new FormData();
  form.append('kind', kind);
  files.forEach((file) => form.append('file', file));
  return (await api.post(`${WCC_API_BASE}/${id}/flow-evidence/`, form)).data;
};

export const removeCompletionEvidence = async (id: number | string, evidenceId: number): Promise<CompletionFlow> =>
  (await api.post(`${WCC_API_BASE}/${id}/flow-evidence-remove/`, { evidence: evidenceId })).data;

const ACTION_PATHS: Record<Exclude<CompletionAction, 'edit'>, string> = {
  submit: 'flow-submit',
  verify: 'flow-verify',
  send_back: 'flow-send-back',
  approve: 'flow-approve',
};

export const takeCompletionAction = async (
  id: number | string, action: Exclude<CompletionAction, 'edit'>, data: Record<string, unknown> = {},
): Promise<CompletionFlow> => (await api.post(`${WCC_API_BASE}/${id}/${ACTION_PATHS[action]}/`, data)).data;
