// src/features/work/workorders/WorkorderManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pagination } from '@/components/Pagination';
import { useWorkordersQuery, useDeleteWorkorder } from '@/hooks/workorder/useWorkorderQueries';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { useAuth } from '@/contexts/AuthContext';

const WorkorderManagement = () => {
  const { t } = useTypedTranslation('work');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workorderToDelete, setWorkorderToDelete] = useState<string | null>(null);

  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch all workorders - we'll filter client-side
  const {
    data = { count: 0, results: [] },
    isFetching,
    isError,
    refetch
  } = useWorkordersQuery();

  // Delete workorder mutation using our custom hook
  const deleteWorkorderMutation = useDeleteWorkorder();

  // Isolate records to the current user's assignments
  const userIsolatedResults = useMemo(() => {
    if (!user) return data.results || [];
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper === 'SUPER ADMIN' || roleUpper === 'ADMIN') return data.results || [];
    const userId = Number(user.id);
    return (data.results || []).filter(wo => {
      switch (roleUpper) {
        case 'REQUESTER': return wo.requester === userId;
        case 'REVIEWER': return wo.reviewers?.includes(userId);
        case 'APPROVER': return wo.approver === userId;
        default: return true;
      }
    });
  }, [data.results, user]);

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...userIsolatedResults];

    // Approval status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(workorder => workorder.approval_status === statusFilter);
    }

    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(workorder =>
        workorder.work_order_number.toLowerCase().includes(searchLower) ||
        workorder.description?.toLowerCase().includes(searchLower) ||
        workorder.category_detail?.name.toLowerCase().includes(searchLower) ||
        workorder.facility_detail?.name.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter && typeFilter !== 'all') {
      results = results.filter(workorder => workorder.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter && priorityFilter !== 'all') {
      results = results.filter(workorder => workorder.priority === priorityFilter);
    }

    return results;
  }, [userIsolatedResults, searchValue, typeFilter, priorityFilter, statusFilter]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);

  // Calculate total pages
  const totalWorkorders = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalWorkorders / pageSize));

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, typeFilter, priorityFilter, statusFilter]);

  // Event handlers
  const handleAddWorkorder = () => {
    navigate('/dashboard/work/orders/create');
  };

  const handleViewWorkorder = (slug: string) => {
    navigate(`/dashboard/work/orders/view/${slug}`);
  };

  const handleEditWorkorder = (slug: string) => {
    navigate(`/dashboard/work/orders/edit/${slug}`);
  };

  const handleDeleteWorkorder = (slug: string) => {
    setWorkorderToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteWorkorder = () => {
    if (workorderToDelete) {
      deleteWorkorderMutation.mutate(workorderToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setWorkorderToDelete(null);
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

  // Handle priority filter
  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
  };

  // Handle status filter
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'FROM-PPM':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case 'FROM-WORK-REQUEST':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'RAISE-PAYMENT':
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('workOrder.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('workOrder.error')}</div>
        <Button onClick={() => refetch()} variant="outline">
          {t('common:actions.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Workorder Management</title>
      </Helmet> */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('workOrder.management')}</h1>
        {/* {(canEdit || isRequester) && (
          <Button onClick={handleAddWorkorder} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Add Workorder
        </Button>
        )} */}
        <PermissionGuard feature='work_order' permission='view'>
          <Button onClick={handleAddWorkorder} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            {t('workOrder.add')}
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('workOrder.searchPlaceholder')}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder={t('common:filter.filterByType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filter.allTypes')}</SelectItem>
              <SelectItem value="FROM-PPM">{t('workOrder.types.fromPpm')}</SelectItem>
              <SelectItem value="FROM-WORK-REQUEST">{t('workOrder.types.fromWorkRequest')}</SelectItem>
              <SelectItem value="RAISE-PAYMENT">{t('workOrder.types.raisePayment')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={handlePriorityFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder={t('common:filter.filterByPriority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filter.allPriorities')}</SelectItem>
              <SelectItem value="High">{t('workOrder.priority.high')}</SelectItem>
              <SelectItem value="Medium">{t('workOrder.priority.medium')}</SelectItem>
              <SelectItem value="Low">{t('workOrder.priority.low')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder={t('common:filter.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filter.allStatuses')}</SelectItem>
              <SelectItem value="Pending">{t('workOrder.status.pending')}</SelectItem>
              <SelectItem value="Reviewed">{t('workOrder.status.reviewed')}</SelectItem>
              <SelectItem value="Approved">{t('workOrder.status.approved')}</SelectItem>
              <SelectItem value="Reviewer Rejected">{t('workOrder.status.reviewerRejected')}</SelectItem>
              <SelectItem value="Approver Rejected">{t('workOrder.status.approverRejected')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchValue('');
              setTypeFilter('all');
              setPriorityFilter('all');
              setStatusFilter('all');
            }}
            className="h-10 border-gray-300 hover:bg-gray-50"
          >
            {t('common:actions.clearFilters')}
          </Button>
        </div>
      </div>

      {/* Workorders Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50 border-green-100">
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.number')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.type')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.category')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.facility')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.asset')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.cost')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.poNumber')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.dueStatus')}</TableHead>
                <TableHead className="font-semibold text-green-800">{t('workOrder.columns.status')}</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">{t('workOrder.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-lg font-medium">{t('workOrder.noItems')}</div>
                      <div className="text-sm">{t('workOrder.noItemsHint')}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((workorder) => (
                  <TableRow key={workorder.id} className="border-b border-gray-100 hover:bg-green-25">
                    <TableCell className="font-medium text-green-800">
                      #{workorder.work_order_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeBadgeStyles(workorder.type)}>
                        {workorder.type === 'FROM-PPM' ? t('workOrder.types.fromPpm') :
                          workorder.type === 'FROM-WORK-REQUEST' ? t('workOrder.types.fromWorkRequest') :
                            workorder.type === 'RAISE-PAYMENT' ? t('workOrder.types.raisePayment') : workorder.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{workorder.category_detail?.name || t('workOrder.na')}</span>
                        {workorder.subcategory_detail?.name && (
                          <span className="text-xs text-gray-500">{workorder.subcategory_detail.name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{workorder.facility_detail?.name || t('workOrder.na')}</span>
                        {workorder.facility_detail?.code && (
                          <span className="text-xs text-gray-500">{t('workOrder.facilityCode', { code: workorder.facility_detail.code })}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{workorder.asset_detail?.asset_name || t('workOrder.na')}</span>
                        {workorder.asset_detail?.asset_type && (
                          <span className="text-xs text-gray-500">{workorder.asset_detail.asset_type}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{workorder?.currency}</span>
                        {workorder?.cost}
                      </div>
                    </TableCell>
                    <TableCell>
                      {workorder.source_work_request_detail?.po_number ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-sm text-gray-800">
                            {workorder.source_work_request_detail.po_number}
                          </span>
                          {workorder.source_work_request_detail.po_document && (
                            <a
                              href={workorder.source_work_request_detail.po_document}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 underline"
                            >
                              {t('workOrder.viewPo')}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{t('workOrder.na')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* <Badge variant="outline" className={getPriorityBadgeStyles(workorder.priority)}>
                        {workorder.priority}
                      </Badge> */}
                      <div>{workorder?.due_status}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          workorder.approval_status === 'Approved'
                            ? "bg-green-100 text-green-800 border-green-200"
                            : workorder.approval_status === 'Reviewed'
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : workorder.approval_status === 'Reviewer Rejected' || workorder.approval_status === 'Approver Rejected'
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }
                      >
                        {workorder.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='work_order' permission='view'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewWorkorder(String(workorder.slug))}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='work_order' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditWorkorder(String(workorder.slug))}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='work_order' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorkorder(String(workorder.slug))}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
          {totalWorkorders > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalWorkorders}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common:confirmation.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('workOrder.deleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('workOrder.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkorder}
              disabled={deleteWorkorderMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteWorkorderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common:status.deleting')}
                </>
              ) : (
                t('workOrder.delete.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkorderManagement;