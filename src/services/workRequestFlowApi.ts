// src/services/workRequestFlowApi.ts
// Five-stage flow, Stage 1 (Work Request): chain, history, actions, and My Tasks.
import { api } from './apiClient';

const WR_API_BASE = '/work/api/work-requests';

export type FlowStep = 'requester' | 'approver' | 'client_rep';
export type FlowAction = 'review' | 'send_back' | 'resubmit' | 'approve' | 'reject';

export interface ChainEntry {
  step: FlowStep;
  label: string;
  kind: 'team' | 'named';
  people?: number;         // team: how many people can act
  person?: string | null;  // named: who signs
}

export interface HistoryEntry {
  action: string;
  label: string;
  actor: string;
  role: string;
  on_behalf_of: string | null;
  reason: string | null;
  signature: string | null;
  at: string;
  since_previous_seconds: number | null;
}

export interface FlowTiming {
  state: 'on_time' | 'reminder' | 'late';
  due_at: string;
  remind_at: string;
  hours: number;
  started_at: string;
}

export interface WorkRequestFlow {
  flow: 'legacy' | 'five_stage';
  status: string;
  client_approves: boolean;
  waiting_on: FlowStep | null;
  chain: ChainEntry[];
  history: HistoryEntry[];
  timing: FlowTiming | null;
  my_actions: FlowAction[];
  replaces: { slug: string; number: string } | null;
}

export interface FlowPreview {
  live: boolean;
  client_approves?: boolean;
  chain?: ChainEntry[];
}

export interface MyTask {
  kind: 'work_request' | 'work_order' | 'work_order_to_raise' | 'wcc' | 'wcc_to_raise';
  id: number;
  slug: string;
  number: string;
  facility: string | null;
  description: string;
  priority: string;
  status: string;
  step: FlowStep | 'procurement' | 'contractor' | 'central_operation';
  step_label: string;
  on_behalf_of: string | null;
  waiting_since: string;
  timing: { state: FlowTiming['state']; due_at: string } | null;
}

export const fetchWorkRequestFlow = async (slug: string): Promise<WorkRequestFlow> =>
  (await api.get(`${WR_API_BASE}/${slug}/flow/`)).data;

export const fetchFlowPreview = async (facilityId: number): Promise<FlowPreview> =>
  (await api.get(`${WR_API_BASE}/flow-preview/`, { params: { facility: facilityId } })).data;

const ACTION_PATHS: Record<FlowAction, string> = {
  review: 'flow-review',
  send_back: 'flow-send-back',
  resubmit: 'flow-resubmit',
  approve: 'flow-approve',
  reject: 'flow-reject',
};

export const takeWorkRequestAction = async (
  slug: string, action: FlowAction, data: { signature?: string; reason?: string; note?: string } = {},
): Promise<WorkRequestFlow> => (await api.post(`${WR_API_BASE}/${slug}/${ACTION_PATHS[action]}/`, data)).data;

export const fetchMyTasks = async (): Promise<MyTask[]> => (await api.get('/work/api/my-tasks/')).data;
