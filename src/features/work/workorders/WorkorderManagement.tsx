// src/features/work/workorders/WorkorderManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
// import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Search, Paperclip } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useWorkordersQuery, useDeleteWorkorder } from '@/hooks/workorder/useWorkorderQueries';
import { Workorder } from '@/types/workorder';
import { WorkorderQueryParams } from '@/services/workordersApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useAuth } from '@/contexts/AuthContext';

const WorkorderManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workorderToDelete, setWorkorderToDelete] = useState<string | null>(null);

  const { canEdit } = useFeatureAccess('work_order')
  const { user } = useAuth();

  // Check if user is REQUESTER
  const isRequester = (user?.role || '').toUpperCase() === 'REQUESTER';

  // Get filters from URL params
  const urlApprovalStatus = searchParams.get('approval_status');
  const urlDueStatus = searchParams.get('due_status');
  const urlIsReviewed = searchParams.get('is_reviewed');

  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];

    // Apply URL-based filters first
    if (urlApprovalStatus) {
      results = results.filter(workorder => workorder.approval_status === urlApprovalStatus);
    }

    if (urlDueStatus) {
      results = results.filter(workorder => workorder.due_status === urlDueStatus);
    }

    if (urlIsReviewed !== null) {
      const isReviewed = urlIsReviewed === 'true';
      results = results.filter(workorder => workorder.is_reviewed === isReviewed);
    }

    // Search filter - search by work order number, description, category, facility, and department
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(workorder =>
        workorder.work_order_number.toLowerCase().includes(searchLower) ||
        workorder.description?.toLowerCase().includes(searchLower) ||
        workorder.category_detail?.title.toLowerCase().includes(searchLower) ||
        workorder.facility_detail?.name.toLowerCase().includes(searchLower) ||
        workorder.department_detail?.name.toLowerCase().includes(searchLower)
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
  }, [data.results, searchValue, typeFilter, priorityFilter, urlApprovalStatus, urlDueStatus, urlIsReviewed]);

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
  }, [searchValue, typeFilter, priorityFilter]);

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

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Helper function to get badge variant based on status
  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'High':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'Medium':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'Low':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Inactive':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
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

  const getApprovalStatusBadgeStyles = (status: string) => {
    if (status === "Pending") {
      return "bg-green-100 text-green-800 hover:bg-green-100";
    } else if (status === "Approved") {
      return "bg-green-100 text-green-800 hover:bg-green-100";
    } else if (status === "Rejected") {
      return "bg-red-100 text-red-800 hover:bg-red-100";
    } else {
      return "";
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading workorders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading workorders</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
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
        <h1 className="text-2xl font-bold">Workorder Management</h1>
        {/* {(canEdit || isRequester) && (
          <Button onClick={handleAddWorkorder} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Add Workorder
        </Button>
        )} */}
        <PermissionGuard feature='work_order' permission='view'>
          <Button onClick={handleAddWorkorder} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Workorder
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
                placeholder="Search by work order number, description, category, facility, or department..."
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
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FROM-PPM">From PPM</SelectItem>
              <SelectItem value="FROM-WORK-REQUEST">From Work Request</SelectItem>
              <SelectItem value="RAISE-PAYMENT">Raise Payment</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={handlePriorityFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchValue('');
              setTypeFilter('all');
              setPriorityFilter('all');
            }}
            className="h-10 border-gray-300 hover:bg-gray-50"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Workorders Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50 border-green-100">
                <TableHead className="font-semibold text-green-800">Work Order #</TableHead>
                <TableHead className="font-semibold text-green-800">Type</TableHead>
                <TableHead className="font-semibold text-green-800">Category</TableHead>
                <TableHead className="font-semibold text-green-800">Facility</TableHead>
                <TableHead className="font-semibold text-green-800">Asset</TableHead>
                <TableHead className="font-semibold text-green-800">Cost</TableHead>
                <TableHead className="font-semibold text-green-800">Resources</TableHead>
                <TableHead className="font-semibold text-green-800">Due Status</TableHead>
                <TableHead className="font-semibold text-green-800">Reviewed</TableHead>
                <TableHead className="font-semibold text-green-800">Approved</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-lg font-medium">No work orders found</div>
                      <div className="text-sm">Try adjusting your search or filter criteria</div>
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
                        {workorder.type === 'FROM-PPM' ? 'From PPM' :
                          workorder.type === 'FROM-WORK-REQUEST' ? 'From Work Request' :
                            workorder.type === 'RAISE-PAYMENT' ? 'Raise Payment' : workorder.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{workorder.category_detail?.title || 'N/A'}</span>
                        {workorder.subcategory_detail?.title && (
                          <span className="text-xs text-gray-500">{workorder.subcategory_detail.title}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{workorder.facility_detail?.name || 'N/A'}</span>
                        {workorder.facility_detail?.code && (
                          <span className="text-xs text-gray-500">Code: {workorder.facility_detail.code}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{workorder.asset_detail?.asset_name || 'N/A'}</span>
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
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {workorder?.resources_data?.length || 0}
                        </span>
                      </div>
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
                        className={workorder.is_reviewed
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {workorder.is_reviewed ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={workorder.is_approved
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {workorder.is_approved ? 'Yes' : 'No'}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workorder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkorder}
              disabled={deleteWorkorderMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteWorkorderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkorderManagement;