// src/services/delegationsApi.ts
import { api } from './apiClient';

const DELEGATIONS_API_BASE = '/work/api/delegations';

export interface CoverPerson {
  id: number;
  name: string;
  email: string;
  roles: string;
}

export type CoverStatus = 'scheduled' | 'active' | 'ended' | 'ended_early';

export interface Cover {
  id: number;
  person: CoverPerson;
  stand_in: CoverPerson;
  starts_at: string;
  ends_at: string;
  value_limit: string | null;
  reason: string;
  status: CoverStatus;
  created_at: string;
  ended_early_at: string | null;
  ended_early_by: CoverPerson | null;
}

export interface NewCover {
  person?: number;
  stand_in: number;
  starts_at: string;
  ends_at: string;
  value_limit?: string | null;
  reason: string;
}

export const fetchCovers = async (): Promise<Cover[]> => (await api.get(`${DELEGATIONS_API_BASE}/`)).data;

export const createCover = async (cover: NewCover): Promise<Cover> =>
  (await api.post(`${DELEGATIONS_API_BASE}/`, cover)).data;

export const endCover = async (id: number): Promise<Cover> =>
  (await api.post(`${DELEGATIONS_API_BASE}/${id}/end/`)).data;

export const fetchStandIns = async (personId?: number): Promise<CoverPerson[]> =>
  (await api.get(`${DELEGATIONS_API_BASE}/stand-ins/`, { params: personId ? { person: personId } : {} })).data;
