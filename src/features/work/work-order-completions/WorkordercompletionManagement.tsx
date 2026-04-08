import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toast } from '@/components/ui/use-toast';
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

const WorkordercompletionManagement = () => {
  const navigate = useNavigate();
  
  // State for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('all');
  const [deleteItem, setDeleteItem] = useState<WorkOrderCompletion | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const pageSize = 10;

  // Fetch all data without server-side filtering
  const { data: rawData, isLoading, error } = useWorkOrderCompletionsQuery();
  const deleteMutation = useDeleteWorkOrderCompletionMutation();

  // Client-side filtering and pagination
  const filteredAndPaginatedData = useMemo(() => {
    if (!rawData?.results) {
      return {
        results: [],
        count: 0,
        totalPages: 0,
        startItem: 0,
        endItem: 0
      };
    }

    let filteredResults = [...rawData.results];

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
  }, [rawData?.results, debouncedSearchQuery, approvalStatusFilter, currentPage, pageSize]);

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
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">On Time</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">Upcoming</Badge>;
      case 'future':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">Future</Badge>;
      case 'due within 1 week':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">Due Within 1 Week</Badge>;
      case 'due today':
        return <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-300">Due Today</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  // Get approval status badge
  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Pagination info is now handled in filteredAndPaginatedData

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load work order completions</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Try Again
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
          <h1 className="text-xl font-semibold text-gray-900">Work Order Completions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track work order completion records
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/work/work-order-completions/new')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Completion
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
                placeholder="Search work order completions..."
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
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
              <TableHead className="text-xs font-medium text-gray-700">Work Order Number</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Start Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Due Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Due Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Resources</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Approval Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-700 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading...</span>
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
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {completion.start_date ? formatDate(completion.start_date) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {completion.due_date ? formatDate(completion.due_date) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getDueStatusBadge(completion.due_status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {completion.resources_data?.length ? (
                      <span className="text-green-700 font-medium">
                        {completion.resources_data.length} file(s)
                      </span>
                    ) : (
                      <span className="text-gray-400">No files</span>
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
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate(`/dashboard/work/work-order-completions/${completion.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteItem(completion)}
                          className="text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
                      <p>No work order completions match your search criteria</p>
                      <p className="text-sm mt-1">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  ) : (
                    "No work order completions found"
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
              Showing {filteredAndPaginatedData.startItem} to {filteredAndPaginatedData.endItem} of {filteredAndPaginatedData.count} results
              {(debouncedSearchQuery || approvalStatusFilter !== 'all') && rawData?.results && (
                <span className="text-gray-500 ml-1">
                  (filtered from {rawData.results.length} total)
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
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {filteredAndPaginatedData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === filteredAndPaginatedData.totalPages || isLoading}
              >
                Next
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
            <AlertDialogTitle>Delete Work Order Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work order completion? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && handleDelete(deleteItem)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkordercompletionManagement; 