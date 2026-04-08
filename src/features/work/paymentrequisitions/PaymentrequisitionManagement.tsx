// src/features/asset/paymentrequisitions/PaymentrequisitionManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { usePaymentrequisitionsQuery, useDeletePaymentrequisition } from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { Paymentrequisition } from '@/types/paymentrequisition';
import { PaymentrequisitionQueryParams } from '@/services/paymentrequisitionsApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const PaymentrequisitionManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentrequisitionToDelete, setPaymentrequisitionToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {canEdit} = useFeatureAccess('requisition')
  
  // Fetch all paymentrequisitions - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = usePaymentrequisitionsQuery();

  // Delete paymentrequisition mutation using our custom hook
  const deletePaymentrequisitionMutation = useDeletePaymentrequisition();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(paymentrequisition => 
        (paymentrequisition.remark && paymentrequisition.remark.toLowerCase().includes(searchLower)) ||
        (paymentrequisition.comment && paymentrequisition.comment.toLowerCase().includes(searchLower)) ||
        paymentrequisition.expected_payment_amount.toString().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(paymentrequisition => 
        paymentrequisition.status === statusFilter
      );
    }
    
    // Approval status filter
    if (approvalStatusFilter && approvalStatusFilter !== 'all') {
      results = results.filter(paymentrequisition => 
        paymentrequisition.approval_status === approvalStatusFilter
      );
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, approvalStatusFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalPaymentrequisitions = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalPaymentrequisitions / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, approvalStatusFilter]);

  // Event handlers
  const handleAddPaymentrequisition = () => {
    navigate('/dashboard/work/payment-requisitions/create');
  };

  const handleViewPaymentrequisition = (id: string) => {
    navigate(`/dashboard/work/payment-requisitions/view/${id}`);
  };

  const handleEditPaymentrequisition = (id: string) => {
    navigate(`/dashboard/work/payment-requisitions/edit/${id}`);
  };

  const handleDeletePaymentrequisition = (id: string) => {
    setPaymentrequisitionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePaymentrequisition = () => {
    if (paymentrequisitionToDelete) {
      deletePaymentrequisitionMutation.mutate(paymentrequisitionToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPaymentrequisitionToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle status filter
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };
  
  // Handle approval status filter
  const handleApprovalStatusFilterChange = (value: string) => {
    setApprovalStatusFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(numAmount);
  };
  
  // Format vendor name (placeholder - would need real data)
  const formatVendorName = (vendorId: number) => {
    const vendors = {
      1: "Vendor One Ltd",
      2: "Supplier Two Inc",
      3: "Provider Three Co",
      // More vendors
    };
    
    return vendors[vendorId as keyof typeof vendors] || `Vendor #${vendorId}`;
  };

  const getApprovalStatusBadgeStyles = (status: string) => {
    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
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
          <p className="text-sm text-muted-foreground">Loading paymentrequisitions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading paymentrequisitions</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Paymentrequisition Management</h1>
        {canEdit && (
          <Button onClick={handleAddPaymentrequisition}>
          <Plus className="mr-2 h-4 w-4" /> Add Paymentrequisition
        </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchFilter 
            onSearch={handleSearch}
            placeholder="Search paymentrequisitions..."
            initialSearchValue={searchValue}
          />
        </div>
        
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={approvalStatusFilter} onValueChange={handleApprovalStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by approval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Approval Statuses</SelectItem>
              <SelectItem value="request">Request</SelectItem>
              <SelectItem value="approve">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Paymentrequisitions Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Pay To</TableHead>
                <TableHead className="font-medium text-gray-600">Expected Amount</TableHead>
                <TableHead className="font-medium text-gray-600">Expected Payment Date</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600">Approval Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No paymentrequisitions found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((paymentrequisition) => (
                  <TableRow key={paymentrequisition.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-semibold">
                      {paymentrequisition.pay_to_detail?.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(paymentrequisition.expected_payment_amount)}
                    </TableCell>
                    <TableCell>
                      {formatDate(paymentrequisition.expected_payment_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        paymentrequisition.status === 'Active' 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }>
                        {paymentrequisition.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        getApprovalStatusBadgeStyles(paymentrequisition.approval_status)
                      }>
                        {paymentrequisition.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='requisition' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewPaymentrequisition(String(paymentrequisition.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='requisition' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditPaymentrequisition(String(paymentrequisition.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='requisition' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePaymentrequisition(String(paymentrequisition.id))}
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
          {totalPaymentrequisitions > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPaymentrequisitions}
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
              This action cannot be undone. This will permanently delete the paymentrequisition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePaymentrequisition}
              disabled={deletePaymentrequisitionMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePaymentrequisitionMutation.isPending ? (
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

export default PaymentrequisitionManagement;