// src/features/work/workrequests/WorkrequestManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useWorkrequestsQuery, useDeleteWorkrequest, useProcurementWorkrequestsQuery } from '@/hooks/workrequest/useWorkrequestQueries';
import { Workrequest, REJECTED_STATUSES } from '@/types/workrequest';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const WorkrequestManagement = () => {
  const { t } = useTypedTranslation('work');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workrequestToDelete, setWorkrequestToDelete] = useState<string | null>(null);

  const { canEdit } = useFeatureAccess('work_request')
  const { user } = useAuth();

  // Check if user is PROCUREMENT AND STORE
  const isProcurementUser = (user?.role || '').toUpperCase() === 'PROCUREMENT AND STORE';
  const isSuperAdmin = (user?.role || '').toUpperCase() === 'SUPER ADMIN';

  // Get filters from URL params
  const urlApprovalStatus = searchParams.get('approval_status');
  const urlDueStatus = searchParams.get('due_status');
  const urlIsReviewed = searchParams.get('is_reviewed');
  const urlApprovalStatusPo = searchParams.get('approval_status_po');

  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchValue, 400);

  // Fetch workrequests — only fire the query relevant to the current user's role
  const {
    data: allWorkrequests = { count: 0, results: [] },
    isFetching: isFetchingAll,
    isError: isErrorAll,
    refetch: refetchAll
  } = useWorkrequestsQuery(
    { search: debouncedSearch || undefined },
    !isProcurementUser
  );

  // Fetch procurement assigned workrequests — only fires for PROCUREMENT AND STORE role
  const {
    data: procurementWorkrequests = { count: 0, results: [] },
    isFetching: isFetchingProcurement,
    isError: isErrorProcurement,
    refetch: refetchProcurement
  } = useProcurementWorkrequestsQuery(isProcurementUser);

  // Use conditional data based on user role
  const data = isProcurementUser ?
    {
      count: procurementWorkrequests.count,
      // @ts-ignore - Intentionally mixing ProcurementWorkrequest with Workrequest for UI compatibility
      results: procurementWorkrequests.results.map(item => ({
        ...item,
        // Map procurement fields to Workrequest structure for compatibility
        type: item.type, // Default type
        category_detail: item.category_detail,
        subcategory_detail: item?.category_detail?.subcategories,
        facility_detail: item?.facility_detail,
        asset_detail: item?.asset_detail,
        department_detail: item?.department_detail,
        request_to_detail: item?.request_to_detail,
        requester_detail: item?.requester_detail,
      })) as Workrequest[]
    } :
    allWorkrequests;
  const isFetching = isProcurementUser ? isFetchingProcurement : isFetchingAll;
  const isError = isProcurementUser ? isErrorProcurement : isErrorAll;
  const refetch = isProcurementUser ? refetchProcurement : refetchAll;

  // Delete workrequest mutation using our custom hook
  const deleteWorkrequestMutation = useDeleteWorkrequest();

  // Isolate records to the current user's assignments (PROCUREMENT is already server-scoped)
  const userIsolatedResults = useMemo(() => {
    if (!user || isProcurementUser) return data.results || [];
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper === 'SUPER ADMIN' || roleUpper === 'ADMIN') return data.results || [];
    const userId = Number(user.id);
    return (data.results || []).filter(req => {
      switch (roleUpper) {
        case 'REQUESTER': return req.requester === userId;
        case 'REVIEWER': return req.reviewers?.includes(userId);
        case 'APPROVER': return req.approver === userId;
        default: return true;
      }
    });
  }, [data.results, user, isProcurementUser]);

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...userIsolatedResults];

    // Apply URL-based filters first
    if (urlApprovalStatus) {
      if (urlApprovalStatus === 'rejected') {
        results = results.filter(workrequest => REJECTED_STATUSES.includes(workrequest.approval_status));
      } else if (urlApprovalStatus === 'awaiting') {
        results = results.filter(workrequest =>
          ['Pending Review', 'CP Approved', 'Reviewed'].includes(workrequest.approval_status)
        );
      } else {
        results = results.filter(workrequest => workrequest.approval_status === urlApprovalStatus);
      }
    }

    if (urlDueStatus) {
      results = results.filter(workrequest => workrequest.due_status === urlDueStatus);
    }

    if (urlApprovalStatusPo !== null) {
      const approvalStatusPo = urlApprovalStatusPo === 'true';
      results = results.filter(workrequest => {
        const itemPoStatus = workrequest.approval_status_po ?? false;
        if (approvalStatusPo) {
          return workrequest.approval_status === 'Pending' && itemPoStatus === true;
        } else {
          return workrequest.approval_status === 'Pending' && itemPoStatus === false;
        }
      });
    }

    if (urlIsReviewed !== null) {
      const isReviewed = urlIsReviewed === 'true';
      results = results.filter(workrequest => {
        const hasReviewers = (workrequest.reviewers ?? []).length > 0;
        if (hasReviewers) {
          // Work requests use 'Pending Review' as the unreviewed status (not 'Pending')
          return isReviewed
            ? workrequest.approval_status !== 'Pending Review'
            : workrequest.approval_status === 'Pending Review';
        }
        return !isReviewed;
      });
    }

    // Search filter - search by type, category, facility, asset, and department
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(workrequest => {
        // For procurement users, search in different fields
        if (isProcurementUser) {
          const procurementData = workrequest as any;
          return (
            procurementData.work_request_number?.toLowerCase().includes(searchLower) ||
            procurementData.title?.toLowerCase().includes(searchLower) ||
            procurementData.description?.toLowerCase().includes(searchLower) ||
            procurementData.requester?.toLowerCase().includes(searchLower) ||
            procurementData.approval_status?.toLowerCase().includes(searchLower)
          );
        }

        // For regular users, use the existing search logic
        return (
          workrequest.type?.toLowerCase().includes(searchLower) ||
          workrequest.category_detail?.title?.toLowerCase().includes(searchLower) ||
          workrequest.facility_detail?.name?.toLowerCase().includes(searchLower) ||
          workrequest.asset_detail?.asset_name?.toLowerCase().includes(searchLower) ||
          workrequest.department_detail?.name?.toLowerCase().includes(searchLower) ||
          workrequest.description?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Type filter - only apply for regular users since procurement data structure might be different
    if (typeFilter && typeFilter !== 'all' && !isProcurementUser) {
      results = results.filter(workrequest => workrequest.type === typeFilter);
    }

    return results;
  }, [userIsolatedResults, searchValue, typeFilter, isProcurementUser, urlApprovalStatus, urlDueStatus, urlIsReviewed, urlApprovalStatusPo]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);

  // Calculate total pages
  const totalWorkrequests = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalWorkrequests / pageSize));

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, typeFilter]);

  // Event handlers
  const handleAddWorkrequest = () => {
    navigate('/dashboard/work/requests/create');
  };

  const handleViewWorkrequest = (slug: string) => {
    navigate(`/dashboard/work/requests/view/${slug}`);
  };

  const handleEditWorkrequest = (slug: string) => {
    navigate(`/dashboard/work/requests/edit/${slug}`);
  };

  const handleDeleteWorkrequest = (slug: string) => {
    setWorkrequestToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteWorkrequest = () => {
    if (workrequestToDelete) {
      deleteWorkrequestMutation.mutate(workrequestToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setWorkrequestToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle type filter
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Helper function to get badge styles
  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'Work':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
      case 'Procurement':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">{t('workRequest.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('workRequest.error')}</div>
        <Button onClick={() => refetch()} variant="outline">
          {t('common:actions.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isProcurementUser ? t('workRequest.procurementTitle') : t('workRequest.management')}
          </h1>
          <p className="text-gray-600 mt-2">
            {isProcurementUser
              ? t('workRequest.procurementDescription')
              : t('workRequest.description')
            }
          </p>
        </div>
        {/* {canEdit && !isProcurementUser && (
          <Button onClick={handleAddWorkrequest} className="bg-green-600 hover:bg-green-700 text-white px-6">
            <Plus className="mr-2 h-4 w-4" /> Add Workrequest
          </Button>
        )} */}
        <PermissionGuard feature='work_request' permission='view'>
          <Button onClick={handleAddWorkrequest}  className="bg-green-600 hover:bg-green-700 text-white px-6">
            <Plus className="mr-2 h-4 w-4" />
            {t('workRequest.add')}
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={isProcurementUser
                  ? t('workRequest.procurementSearchPlaceholder')
                  : t('workRequest.searchPlaceholder')
                }
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {!isProcurementUser && (
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-48 h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder={t('common:filter.filterByType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('workRequest.types.allTypes')}</SelectItem>
                  <SelectItem value="Work">{t('workRequest.types.work')}</SelectItem>
                  <SelectItem value="Procurement">{t('workRequest.types.procurement')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Results summary */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {t('workRequest.showing', { count: paginatedData.length, total: totalWorkrequests })}
          </p>

          {(searchValue || (!isProcurementUser && typeFilter !== 'all')) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchValue('');
                if (!isProcurementUser) {
                  setTypeFilter('all');
                }
              }}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              {t('common:actions.clearFilters')}
            </Button>
          )}
        </div>
      </div>

      {/* Workrequests Table */}
      <Card className="w-full shadow-lg border-0 rounded-xl overflow-hidden">
        <div className="bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50 border-b border-green-100">
                <TableHead className="font-semibold text-green-800 py-4">{t('workRequest.columns.type')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workRequest.columns.category')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workRequest.columns.facility')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workRequest.columns.asset')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workRequest.columns.status')}</TableHead>
                {/* <TableHead className="font-semibold text-green-800">Status</TableHead> */}
                <TableHead className="font-semibold text-green-800">{t('workRequest.columns.dueStatus')}</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">{t('workRequest.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500 font-medium">{t('workRequest.noItems')}</p>
                      <p className="text-sm text-gray-400">
                        {searchValue || typeFilter !== 'all'
                          ? t('common:table.adjustSearch')
                          : t('common:table.createFirst')
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((workrequest) => (
                  <TableRow key={workrequest.id} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                    <TableCell className="py-4">
                      <Badge variant="outline" className={getTypeBadgeStyles(workrequest.type)}>
                        {workrequest.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-medium text-gray-900">{workrequest.category_detail?.code || t('workRequest.dash')}</p>
                        {workrequest.subcategory_detail?.title && (
                          <p className="text-xs text-gray-500">{workrequest.subcategory_detail.title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{workrequest.facility_detail?.name || t('workRequest.dash')}</p>
                        {workrequest.facility_detail?.code && (
                          <p className="text-xs text-gray-500">{workrequest.facility_detail.code}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{workrequest.asset_detail?.asset_name || t('workRequest.dash')}</p>
                        {workrequest.asset_detail?.asset_type && (
                          <p className="text-xs text-gray-500">{workrequest.asset_detail.asset_type}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{workrequest?.approval_status || t('workRequest.dash')}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="font-medium text-gray-900" title={workrequest?.due_status}>
                        {workrequest?.due_status || t('workRequest.noDueStatus')}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <PermissionGuard feature="work_request" permission='view'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewWorkrequest(String(workrequest.slug))}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                            title={t('workRequest.tooltips.viewDetails')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        {!workrequest?.is_locked && (<PermissionGuard feature='work_request' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditWorkrequest(String(workrequest.slug))}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            title={t('workRequest.tooltips.editRequest')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>)}
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorkrequest(String(workrequest.slug))}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title={t('workRequest.tooltips.deleteRequest')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalWorkrequests > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalWorkrequests}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">{t('workRequest.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('workRequest.deleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">{t('workRequest.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkrequest}
              disabled={deleteWorkrequestMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteWorkrequestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common:status.deleting')}
                </>
              ) : (
                t('workRequest.delete.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkrequestManagement;