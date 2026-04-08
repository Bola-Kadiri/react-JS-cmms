// src/features/asset/paymentcomments/PaymentcommentManagement.tsx
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
import { usePaymentcommentsQuery, useDeletePaymentcomment } from '@/hooks/paymentcomment/usePaymentCommentQueries';
import { Paymentcomment } from '@/types/paymentComment';
import { PaymentcommentQueryParams } from '@/services/paymentcommentApi';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const PaymentcommentManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentcommentToDelete, setPaymentcommentToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  // const [facilityFilter, setFacilityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {canEdit} = useFeatureAccess('requisition')
  
  // Fetch all paymentcomments - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = usePaymentcommentsQuery();

  // Delete paymentcomment mutation using our custom hook
  const deletePaymentcommentMutation = useDeletePaymentcomment();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(paymentcomment => 
        paymentcomment.message.toLowerCase().includes(searchLower) ||
        paymentcomment.payment.toString().includes(searchLower)
      );
    }
    
    return results;
  }, [data.results, searchValue]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalPaymentcomments = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalPaymentcomments / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  // Event handlers
  const handleAddPaymentcomment = () => {
    navigate('/dashboard/work/payment-comments/create');
  };

  const handleViewPaymentcomment = (id: string) => {
    navigate(`/dashboard/work/payment-comments/view/${id}`);
  };

  const handleEditPaymentcomment = (id: string) => {
    navigate(`/dashboard/work/payment-comments/edit/${id}`);
  };

  const handleDeletePaymentcomment = (id: string) => {
    setPaymentcommentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePaymentcomment = () => {
    if (paymentcommentToDelete) {
      deletePaymentcommentMutation.mutate(paymentcommentToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPaymentcommentToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading paymentcomments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading paymentcomments</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Paymentcomment Management</h1>
        {canEdit && (
          <Button onClick={handleAddPaymentcomment}>
          <Plus className="mr-2 h-4 w-4" /> Add Paymentcomment
        </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          placeholder="Search paymentcomments..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Paymentcomments Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Payment</TableHead>
                <TableHead className="font-medium text-gray-600">Message</TableHead>
                <TableHead className="font-medium text-gray-600">Send Notification</TableHead>
                <TableHead className="font-medium text-gray-600">Internal Only</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No paymentcomments found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((paymentcomment) => (
                  <TableRow key={paymentcomment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-semibold">{paymentcomment.payment}</TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">
                        {paymentcomment.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentcomment.send_notification ? "default" : "outline"} className="bg-green-100 text-green-800 hover:bg-green-100">
                        {paymentcomment.send_notification ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentcomment.internal_only ? "default" : "outline"} className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        {paymentcomment.internal_only ? 'Internal' : 'External'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='requisition' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewPaymentcomment(String(paymentcomment.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='requisition' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditPaymentcomment(String(paymentcomment.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='requisition' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePaymentcomment(String(paymentcomment.id))}
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
          {totalPaymentcomments > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPaymentcomments}
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
              This action cannot be undone. This will permanently delete the paymentcomment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePaymentcomment}
              disabled={deletePaymentcommentMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePaymentcommentMutation.isPending ? (
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

export default PaymentcommentManagement;