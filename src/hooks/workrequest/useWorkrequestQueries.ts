import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/hooks/dashboard/useDashboardQueries';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import React from 'react';
import {
  fetchWorkrequests,
  getWorkrequest,
  createWorkrequest,
  updateWorkrequest,
  deleteWorkrequest,
  getAssetsByFacility,
  getBuildingsByFacility,
  getProcurementUsers,
  getWorkrequestReviewers,
  getWorkrequestApprovers,
  fetchProcurementWorkrequests,
  fetchApprovedWorkrequests,
  cpApprove,
  cpReject,
  reviewerApprove,
  reviewerReject,
  finalApprove,
  finalReject,
  resubmitWorkrequest,
  WorkrequestQueryParams,
} from '@/services/workrequestsApi';

const ok = React.createElement(Check, { className: 'h-4 w-4 text-green-500' });
const err = React.createElement(X, { className: 'h-4 w-4 text-red-500' });

export const workrequestKeys = {
  all: ['workrequests'] as const,
  lists: () => [...workrequestKeys.all, 'list'] as const,
  list: (params: WorkrequestQueryParams) => [...workrequestKeys.lists(), params] as const,
  details: () => [...workrequestKeys.all, 'detail'] as const,
  detail: (slug: string) => [...workrequestKeys.details(), slug] as const,
  assetsByFacility: (facility_id: number) => [...workrequestKeys.all, 'assets-by-facility', facility_id] as const,
  buildingsByFacility: (facility_id: number) => [...workrequestKeys.all, 'buildings-by-facility', facility_id] as const,
  procurementUsers: () => [...workrequestKeys.all, 'procurement-users'] as const,
  reviewers: () => [...workrequestKeys.all, 'reviewers'] as const,
  approvers: () => [...workrequestKeys.all, 'approvers'] as const,
  procurementAssigned: () => [...workrequestKeys.all, 'procurement-assigned'] as const,
  approved: () => [...workrequestKeys.all, 'approved'] as const,
};

export const useWorkrequestsQuery = (params?: WorkrequestQueryParams, enabled = true) =>
  useQuery({
    queryKey: workrequestKeys.list(params || {}),
    queryFn: () => fetchWorkrequests(params),
    staleTime: 5 * 60 * 1000,
    enabled,
    placeholderData: { count: 0, next: null, previous: null, results: [] },
  });

export const useProcurementWorkrequestsQuery = (enabled = true) =>
  useQuery({
    queryKey: workrequestKeys.procurementAssigned(),
    queryFn: fetchProcurementWorkrequests,
    staleTime: 5 * 60 * 1000,
    enabled,
    placeholderData: { count: 0, results: [] },
  });

export const useWorkrequestQuery = (slug: string | undefined) =>
  useQuery({
    queryKey: workrequestKeys.detail(slug as string),
    queryFn: () => getWorkrequest(slug as string),
    enabled: !!slug,
    staleTime: 30000,
  });

export const useCreateWorkrequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkrequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Work request created successfully', { duration: 3000, icon: ok });
    },
    onError: () => {
      toast.error('Failed to create work request', { duration: 5000, icon: err });
    },
  });
};

export const useUpdateWorkrequest = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWorkrequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.detail(slug as string) });
      toast.success('Work request updated successfully', { duration: 3000, icon: ok });
    },
    onError: () => {
      toast.error('Failed to update work request', { duration: 5000, icon: err });
    },
  });
};

export const useDeleteWorkrequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkrequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Work request deleted successfully', { duration: 3000, icon: ok });
    },
    onError: () => {
      toast.error('Failed to delete work request', { duration: 5000, icon: err });
    },
  });
};

export const useAssetsByFacilityQuery = (facility_id: number | undefined) =>
  useQuery({
    queryKey: workrequestKeys.assetsByFacility(facility_id as number),
    queryFn: () => getAssetsByFacility(facility_id as number),
    enabled: !!facility_id,
    staleTime: 30000,
  });

export const useBuildingsByFacilityQuery = (facility_id: number | undefined) =>
  useQuery({
    queryKey: workrequestKeys.buildingsByFacility(facility_id as number),
    queryFn: () => getBuildingsByFacility(facility_id as number),
    enabled: !!facility_id,
    staleTime: 30000,
  });

export const useProcurementUsersQuery = () =>
  useQuery({ queryKey: workrequestKeys.procurementUsers(), queryFn: getProcurementUsers, staleTime: 30000 });

export const useReviewersQuery = () =>
  useQuery({ queryKey: workrequestKeys.reviewers(), queryFn: getWorkrequestReviewers, staleTime: 30000 });

export const useApproversQuery = () =>
  useQuery({ queryKey: workrequestKeys.approvers(), queryFn: getWorkrequestApprovers, staleTime: 30000 });

export const useApprovedWorkrequestsQuery = () =>
  useQuery({ queryKey: workrequestKeys.approved(), queryFn: fetchApprovedWorkrequests, staleTime: 30000, placeholderData: [] });

// --- Workflow action mutations ---

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>, slug: string) => {
  queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
  queryClient.invalidateQueries({ queryKey: workrequestKeys.detail(slug) });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
};

export const useCpApprove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cpApprove,
    onSuccess: (data) => {
      invalidateAll(queryClient, data.slug);
      toast.success('PO generated — status updated to CP Approved', { duration: 3000, icon: ok });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to approve';
      toast.error(msg, { duration: 5000, icon: err });
    },
  });
};

export const useCpReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cpReject,
    onSuccess: (data) => {
      invalidateAll(queryClient, data.slug);
      toast.success('Rejected — Requester notified to correct vendor', { duration: 3000, icon: ok });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to reject';
      toast.error(msg, { duration: 5000, icon: err });
    },
  });
};

export const useReviewerApprove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewerApprove,
    onSuccess: (data) => {
      invalidateAll(queryClient, data.slug);
      toast.success('Three-way audit passed — status updated to Reviewed', { duration: 3000, icon: ok });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to approve';
      toast.error(msg, { duration: 5000, icon: err });
    },
  });
};

export const useReviewerReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewerReject,
    onSuccess: (data) => {
      invalidateAll(queryClient, data.slug);
      toast.success('Rejected — Requester notified to correct discrepancy', { duration: 3000, icon: ok });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to reject';
      toast.error(msg, { duration: 5000, icon: err });
    },
  });
};

export const useFinalApprove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: finalApprove,
    onSuccess: (data) => {
      invalidateAll(queryClient, data.slug);
      toast.success('Fully Approved — committed to ledger', { duration: 3000, icon: ok });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to approve';
      toast.error(msg, { duration: 5000, icon: err });
    },
  });
};

export const useFinalReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: finalReject,
    onSuccess: (data) => {
      invalidateAll(queryClient, data.slug);
      toast.success('Rejected — sent to remediation queue', { duration: 3000, icon: ok });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to reject';
      toast.error(msg, { duration: 5000, icon: err });
    },
  });
};

export const useResubmitWorkrequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resubmitWorkrequest,
    onSuccess: (data) => {
      invalidateAll(queryClient, data.slug);
      toast.success('Resubmitted — pipeline restarted from Procurement review', { duration: 3000, icon: ok });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Failed to resubmit';
      toast.error(msg, { duration: 5000, icon: err });
    },
  });
};
