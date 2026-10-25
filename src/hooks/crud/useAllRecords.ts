// src/hooks/crud/useAllRecords.ts
// Loads every page of a list endpoint, for dropdowns that must offer every option
// (the API pages lists 20 at a time; useList only fetches one page).
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/apiClient';

const MAX_PAGES = 200;

export async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data } = await api.get(`/${endpoint.replace(/^\//, '')}`, { params: { page } });
    if (Array.isArray(data)) return [...items, ...data];
    items.push(...(data.results ?? []));
    if (!data.next) break;
  }
  return items;
}

export function useAllRecords<T>(resource: string, endpoint: string, enabled = true) {
  return useQuery({
    queryKey: [resource, 'all-pages'],
    queryFn: () => fetchAllPages<T>(endpoint),
    enabled,
    staleTime: 60_000,
  });
}
