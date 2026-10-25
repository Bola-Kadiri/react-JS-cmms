// src/services/approvalMatrixApi.ts
import { api } from './apiClient';

const MATRIX_API_BASE = '/work/api/approval-matrix';
const COMPANY_API = '/work/api/company-approvers/';

// Named steps: one accountable person, chosen by the Super Admin.
export type FacilitySlot = 'approver' | 'client_rep';
export type CompanySlot = 'head_of_finance';
// Team steps: everyone with the role (in scope) can act; nobody is chosen.
export type TeamSlot = 'requester' | 'procurement' | 'central_operation' | 'ap_officer' | 'reviewer';
export type MatrixSlot = FacilitySlot | CompanySlot | TeamSlot | 'contractor';

export interface MatrixPerson {
  id: number;
  name: string;
  email: string;
  roles: string;
}

export interface MatrixFacility {
  id: number;
  name: string;
  client: string | null;
}

export interface MatrixListRow {
  facility: MatrixFacility;
  is_live: boolean;
  ready: boolean;
  problem_count: number;
}

export interface ChainRow {
  stage: string;
  raises: MatrixSlot;
  reviews: MatrixSlot;
  approves: MatrixSlot;
  kinds: { raises: 'named' | 'team'; reviews: 'named' | 'team'; approves: 'named' | 'team' };
}

export interface TeamInfo {
  role: string;
  scope: 'facility' | 'company';
  people: number;
}

export interface MatrixDetail {
  facility: MatrixFacility;
  slots: Partial<Record<FacilitySlot | CompanySlot, MatrixPerson | null>>;
  slot_labels: Record<MatrixSlot, string>;
  company_wide_slots: CompanySlot[];
  teams: Record<TeamSlot, TeamInfo>;
  chain: ChainRow[];
  problems: string[];
  is_live: boolean;
  went_live_at: string | null;
  went_live_by: MatrixPerson | null;
}

export type Candidates = Partial<Record<FacilitySlot | CompanySlot, MatrixPerson[]>>;

export const fetchMatrixList = async (): Promise<MatrixListRow[]> =>
  (await api.get(`${MATRIX_API_BASE}/`)).data;

export const fetchMatrix = async (facilityId: number): Promise<MatrixDetail> =>
  (await api.get(`${MATRIX_API_BASE}/${facilityId}/`)).data;

export const fetchCandidates = async (facilityId: number): Promise<Candidates> =>
  (await api.get(`${MATRIX_API_BASE}/${facilityId}/candidates/`)).data;

export const updateFacilitySlots = async (
  facilityId: number, slots: Partial<Record<FacilitySlot, number | null>>,
): Promise<MatrixDetail> => (await api.patch(`${MATRIX_API_BASE}/${facilityId}/`, slots)).data;

export const updateCompanySlots = async (slots: Partial<Record<CompanySlot, number | null>>) =>
  (await api.patch(COMPANY_API, slots)).data;

export const goLive = async (facilityId: number): Promise<MatrixDetail> =>
  (await api.post(`${MATRIX_API_BASE}/${facilityId}/go-live/`)).data;

export const switchOff = async (facilityId: number): Promise<MatrixDetail> =>
  (await api.post(`${MATRIX_API_BASE}/${facilityId}/switch-off/`)).data;
