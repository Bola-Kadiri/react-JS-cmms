// src/features/work/workrequests/WorkrequestManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useWorkrequestsQuery, useDeleteWorkrequest, useProcurementWorkrequestsQuery } from '@/hooks/workrequest/useWorkrequestQueries';
import { Workrequest } from '@/types/workrequest';
import { WorkrequestQueryParams, ProcurementWorkrequest } from '@/services/workrequestsApi';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const WorkrequestManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workrequestToDelete, setWorkrequestToDelete] = useState<string | null>(null);

  const { canEdit } = useFeatureAccess('work_request')
  const { user } = useAuth();

  // Check if user is PROCUREMENT AND STORE
  const isProcurementUser = (user?.role || '').toUpperCase() === 'PROCUREMENT AND STORE';

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

  // Fetch all workrequests - we'll filter client-side
  const {
    data: allWorkrequests = { count: 0, results: [] },
    isFetching: isFetchingAll,
    isError: isErrorAll,
    refetch: refetchAll
  } = useWorkrequestsQuery();

  // Fetch procurement assigned workrequests
  const {
    data: procurementWorkrequests = { count: 0, results: [] },
    isFetching: isFetchingProcurement,
    isError: isErrorProcurement,
    refetch: refetchProcurement
  } = useProcurementWorkrequestsQuery();

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

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];

    // Apply URL-based filters first
    if (urlApprovalStatus) {
      results = results.filter(workrequest => workrequest.approval_status === urlApprovalStatus);
    }

    if (urlDueStatus) {
      results = results.filter(workrequest => workrequest.due_status === urlDueStatus);
    }

    if (urlApprovalStatusPo !== null) {
      const approvalStatusPo = urlApprovalStatusPo === 'true';
      results = results.filter(workrequest => {
        // approval_status_po=true means awaiting PO approval (reviewed but not approved)
        // approval_status_po=false means new/awaiting review (not yet reviewed)
        if (approvalStatusPo) {
          // Awaiting Approval: Pending status and has been reviewed
          return workrequest.approval_status === 'Pending' && workrequest.approval_status_po === true;
        } else {
          // New-Awaiting Review: Pending status and not yet reviewed
          return workrequest.approval_status === 'Pending' && workrequest.approval_status_po === false;
        }
      });
    }

    if (urlIsReviewed !== null) {
      const isReviewed = urlIsReviewed === 'true';
      results = results.filter(workrequest => {
        // Check if workrequest has reviewers_detail and if all have reviewed
        if (workrequest.reviewers_detail && workrequest.reviewers_detail.length > 0) {
          // If is_reviewed param is true, check if reviewed
          // If is_reviewed param is false, check if not reviewed
          return isReviewed ? workrequest.approval_status !== 'Pending' : workrequest.approval_status === 'Pending';
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
  }, [data.results, searchValue, typeFilter, isProcurementUser, urlApprovalStatus, urlDueStatus, urlIsReviewed, urlApprovalStatusPo]);

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
          <p className="text-sm text-muted-foreground">Loading workrequests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading workrequests</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isProcurementUser ? 'Procurement Work Requests' : 'Work Request Management'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isProcurementUser
              ? 'Manage procurement details for assigned work requests'
              : 'Manage and track all work requests and procurement orders'
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
            Add Workrequest
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
                  ? "Search by work request number, title, description, requester, or status..."
                  : "Search by type, category, facility, asset, department, or description..."
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
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Procurement">Procurement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Results summary */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {paginatedData.length} of {totalWorkrequests} work requests
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
              Clear Filters
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
                <TableHead className="font-semibold text-green-800 py-4">Type</TableHead>
                <TableHead className="font-semibold text-green-800">Cost</TableHead>
                <TableHead className="font-semibold text-green-800">Category</TableHead>
                <TableHead className="font-semibold text-green-800">Facility</TableHead>
                <TableHead className="font-semibold text-green-800">Asset</TableHead>
                <TableHead className="font-semibold text-green-800">Status</TableHead>
                {/* <TableHead className="font-semibold text-green-800">Status</TableHead> */}
                <TableHead className="font-semibold text-green-800">Due Status</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500 font-medium">No work requests found</p>
                      <p className="text-sm text-gray-400">
                        {searchValue || typeFilter !== 'all'
                          ? 'Try adjusting your search criteria'
                          : 'Create your first work request to get started'
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
                        <p className="font-medium text-gray-900">{workrequest?.cost || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-medium text-gray-900">{workrequest.category_detail?.code || '-'}</p>
                        {workrequest.subcategory_detail?.title && (
                          <p className="text-xs text-gray-500">{workrequest.subcategory_detail.title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{workrequest.facility_detail?.name || '-'}</p>
                        {workrequest.facility_detail?.code && (
                          <p className="text-xs text-gray-500">{workrequest.facility_detail.code}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{workrequest.asset_detail?.asset_name || '-'}</p>
                        {workrequest.asset_detail?.asset_type && (
                          <p className="text-xs text-gray-500">{workrequest.asset_detail.asset_type}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{workrequest?.approval_status || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="font-medium text-gray-900" title={workrequest?.due_status}>
                        {workrequest?.due_status || 'No due status'}
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
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        {workrequest?.approval_status === 'Pending' && (<PermissionGuard feature='work_request' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditWorkrequest(String(workrequest.slug))}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            title="Edit request"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>)}
                        <PermissionGuard feature='work_request' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorkrequest(String(workrequest.slug))}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete request"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
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
            <AlertDialogTitle className="text-red-600">Delete Work Request</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the work request and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkrequest}
              disabled={deleteWorkrequestMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteWorkrequestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Request'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkrequestManagement;