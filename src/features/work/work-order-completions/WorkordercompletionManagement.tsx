import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  XCircle
} from 'lucide-react';
import { 
  useWorkOrderCompletionsQuery, 
  useDeleteWorkOrderCompletionMutation
} from '@/hooks/workordercompletion/useWorkordercompletionQueries';
import { WorkOrderCompletion } from '@/types/workordercompletion';
import { formatDate } from '@/utils/formatters';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { useAuth } from '@/contexts/AuthContext';

const WorkordercompletionManagement = () => {
  const { t } = useTypedTranslation('work');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const urlIsReviewed = searchParams.get('is_reviewed');

  // State for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('all');
  const [deleteItem, setDeleteItem] = useState<WorkOrderCompletion | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const pageSize = 10;

  // Fetch data — search sent to server, other filters applied client-side
  const { data: rawData, isLoading, error } = useWorkOrderCompletionsQuery(
    { search: debouncedSearchQuery || undefined }
  );
  const deleteMutation = useDeleteWorkOrderCompletionMutation();

  // Isolate records to the current user's assignments
  const userIsolatedResults = useMemo(() => {
    if (!rawData?.results) return [];
    if (!user) return rawData.results;
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper === 'SUPER ADMIN' || roleUpper === 'ADMIN') return rawData.results;
    const userId = Number(user.id);
    return rawData.results.filter(wcc => {
      switch (roleUpper) {
        case 'REQUESTER': return wcc.owner === userId;
        case 'REVIEWER':  return wcc.reviewers?.includes(userId);
        case 'APPROVER':  return wcc.approver === userId;
        default:          return true;
      }
    });
  }, [rawData?.results, user]);

  // Client-side filtering and pagination
  const filteredAndPaginatedData = useMemo(() => {
    if (!userIsolatedResults.length && !isLoading) {
      return {
        results: [],
        count: 0,
        totalPages: 0,
        startItem: 0,
        endItem: 0
      };
    }

    let filteredResults = [...userIsolatedResults];

    if (urlIsReviewed !== null) {
      const isReviewed = urlIsReviewed === 'true';
      filteredResults = filteredResults.filter(completion => {
        const hasReviewers = (completion.reviewers ?? []).length > 0;
        if (hasReviewers) {
          // Use the dedicated is_reviewed boolean — approval_status may stay 'Pending' after review
          return isReviewed ? completion.is_reviewed === true : completion.is_reviewed === false;
        }
        return !isReviewed;
      });
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filteredResults = filteredResults.filter((completion) => {
        const searchableFields = [
          completion.work_order_detail?.work_order_number || '',
          completion.approval_status,
          completion.due_status || '',
          formatDate(completion.start_date),
          formatDate(completion.due_date)
        ];
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(query)
        );
      });
    }

    // Apply approval status filter
    if (approvalStatusFilter !== 'all') {
      filteredResults = filteredResults.filter((completion) => 
        completion.approval_status === approvalStatusFilter
      );
    }

    // Calculate pagination
    const totalCount = filteredResults.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    const startItem = totalCount > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(endIndex, totalCount);

    return {
      results: paginatedResults,
      count: totalCount,
      totalPages,
      startItem,
      endItem
    };
  }, [userIsolatedResults, isLoading, debouncedSearchQuery, approvalStatusFilter, currentPage, pageSize, urlIsReviewed]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setApprovalStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= filteredAndPaginatedData.totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle delete
  const handleDelete = async (completion: WorkOrderCompletion) => {
    try {
      await deleteMutation.mutateAsync(completion.id);
      setDeleteItem(null);
    } catch (error) {
      console.error('Failed to delete work order completion:', error);
    }
  };

  // Get due status badge
  const getDueStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'on time':
      case 'ontime':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">{t('wcc.dueStatus.onTime')}</Badge>;
      case 'overdue':
        return <Badge variant="destructive">{t('wcc.dueStatus.overdue')}</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">{t('wcc.dueStatus.upcoming')}</Badge>;
      case 'future':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">{t('wcc.dueStatus.future')}</Badge>;
      case 'due within 1 week':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">{t('wcc.dueStatus.dueWithin1Week')}</Badge>;
      case 'due today':
        return <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-300">{t('wcc.dueStatus.dueToday')}</Badge>;
      default:
        return <Badge variant="outline">{status || t('wcc.na')}</Badge>;
    }
  };

  // Get approval status badge
  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">{t('wcc.approvalStatus.approved')}</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">{t('wcc.approvalStatus.rejected')}</Badge>;
      case 'Pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">{t('wcc.approvalStatus.pending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Pagination info is now handled in filteredAndPaginatedData

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t('wcc.error')}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            {t('common:actions.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('wcc.management')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('wcc.description')}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/work/work-order-completions/new')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('wcc.add')}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('wcc.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery !== debouncedSearchQuery && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                )}
                {searchQuery && searchQuery === debouncedSearchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Approval Status Filter */}
          <div className="sm:w-48">
            <Select value={approvalStatusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('common:filter.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common:filter.allStatuses')}</SelectItem>
                <SelectItem value="Pending">{t('wcc.approvalStatus.pending')}</SelectItem>
                <SelectItem value="Approved">{t('wcc.approvalStatus.approved')}</SelectItem>
                <SelectItem value="Rejected">{t('wcc.approvalStatus.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-700">{t('wcc.columns.workOrderNumber')}</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">{t('wcc.columns.startDate')}</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">{t('wcc.columns.dueDate')}</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">{t('wcc.columns.dueStatus')}</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">{t('wcc.columns.resources')}</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">{t('wcc.columns.approvalStatus')}</TableHead>
              <TableHead className="text-xs font-medium text-gray-700 w-20">{t('wcc.columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-600">{t('wcc.loading')}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAndPaginatedData.results?.length ? (
              filteredAndPaginatedData.results.map((completion) => (
                <TableRow key={completion.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm font-medium text-gray-900">
                    {completion.work_order_detail?.work_order_number ? (
                      `WO-${completion.work_order_detail.work_order_number}`
                    ) : (
                      <span className="text-gray-400">{t('wcc.na')}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {completion.start_date ? formatDate(completion.start_date) : (
                      <span className="text-gray-400">{t('wcc.notSet')}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {completion.due_date ? formatDate(completion.due_date) : (
                      <span className="text-gray-400">{t('wcc.notSet')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getDueStatusBadge(completion.due_status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {completion.resources_data?.length ? (
                      <span className="text-green-700 font-medium">
                        {t('wcc.filesCount', { count: completion.resources_data.length })}
                      </span>
                    ) : (
                      <span className="text-gray-400">{t('wcc.noFiles')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getApprovalStatusBadge(completion.approval_status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/dashboard/work/work-order-completions/${completion.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('wcc.actions.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/dashboard/work/work-order-completions/${completion.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('wcc.actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteItem(completion)}
                          className="text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('wcc.actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  {debouncedSearchQuery || approvalStatusFilter !== 'all' ? (
                    <div>
                      <p>{t('common:table.noResults')}</p>
                      <p className="text-sm mt-1">
                        {t('common:table.adjustSearch')}
                      </p>
                    </div>
                  ) : (
                    t('wcc.noItemsFallback')
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredAndPaginatedData.count > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              {t('wcc.pagination.showing', { start: filteredAndPaginatedData.startItem, end: filteredAndPaginatedData.endItem, total: filteredAndPaginatedData.count })}
              {(debouncedSearchQuery || approvalStatusFilter !== 'all') && rawData?.results && (
                <span className="text-gray-500 ml-1">
                  {t('wcc.pagination.filteredFrom', { total: rawData.results.length })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('wcc.pagination.previous')}
              </Button>
              <span className="text-sm text-gray-600">
                {t('wcc.pagination.page', { current: currentPage, total: filteredAndPaginatedData.totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === filteredAndPaginatedData.totalPages || isLoading}
              >
                {t('wcc.pagination.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('wcc.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('wcc.deleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('wcc.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && handleDelete(deleteItem)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('wcc.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkordercompletionManagement; 