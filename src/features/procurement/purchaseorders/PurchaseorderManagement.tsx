// src/features/procurement/purchaseorders/PurchaseorderManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
// import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { usePurchaseordersQuery, useDeletePurchaseorder } from '@/hooks/purchaseorder/usePurchaseorderQueries';
import { Purchaseorder } from '@/types/purchaseorder';
import { PurchaseorderQueryParams } from '@/services/purchaseordersApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const PurchaseorderManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseorderToDelete, setPurchaseorderToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all purchaseorders - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = usePurchaseordersQuery();

  // Delete purchaseorder mutation using our custom hook
  const deletePurchaseorderMutation = useDeletePurchaseorder();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by type and requested by
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(purchaseorder => 
        purchaseorder.type.toLowerCase().includes(searchLower) ||
        purchaseorder.requested_by_detail?.first_name.toLowerCase().includes(searchLower) ||
        purchaseorder.requested_by_detail?.last_name.toLowerCase().includes(searchLower) ||
        purchaseorder.vendor_detail?.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(purchaseorder => purchaseorder.status === statusFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalPurchaseorders = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalPurchaseorders / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter]);

  // Event handlers
  const handleAddPurchaseorder = () => {
    navigate('/dashboard/procurement/purchase-order/create');
  };

  const handleViewPurchaseorder = (id: string) => {
    navigate(`/dashboard/procurement/purchase-order/view/${id}`);
  };

  const handleEditPurchaseorder = (id: string) => {
    navigate(`/dashboard/procurement/purchase-order/edit/${id}`);
  };

  const handleDeletePurchaseorder = (id: string) => {
    setPurchaseorderToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePurchaseorder = () => {
    if (purchaseorderToDelete) {
      deletePurchaseorderMutation.mutate(purchaseorderToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPurchaseorderToDelete(null);
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
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get badge styles based on status
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Draft':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case 'Pending':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'Sent':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Delivered':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Cancelled':
        return "bg-red-100 text-red-800 hover:bg-red-100";
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
          <p className="text-sm text-muted-foreground">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading purchase orders</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Purchase Order Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Order Management</h1>
        <Button onClick={handleAddPurchaseorder}>
          <Plus className="mr-2 h-4 w-4" /> Add Purchase Order
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchFilter 
              onSearch={handleSearch}
              placeholder="Search by type, vendor, or requester..."
              initialSearchValue={searchValue}
            />
          </div>
          
          <div className="w-full md:w-72">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Type</TableHead>
                <TableHead className="font-medium text-gray-600">Vendor</TableHead>
                <TableHead className="font-medium text-gray-600">Requested Date</TableHead>
                <TableHead className="font-medium text-gray-600">Expected Delivery</TableHead>
                <TableHead className="font-medium text-gray-600">Requested By</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((purchaseorder) => (
                  <TableRow key={purchaseorder.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {purchaseorder.type}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {purchaseorder.vendor_detail?.name || '-'}
                    </TableCell>
                    <TableCell>{formatDate(purchaseorder.requested_date)}</TableCell>
                    <TableCell>{formatDate(purchaseorder.expected_delivery_date)}</TableCell>
                    <TableCell>
                      {purchaseorder.requested_by_detail 
                        ? `${purchaseorder.requested_by_detail.first_name} ${purchaseorder.requested_by_detail.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeStyles(purchaseorder.status)}>
                        {purchaseorder.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewPurchaseorder(String(purchaseorder.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditPurchaseorder(String(purchaseorder.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePurchaseorder(String(purchaseorder.id))}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPurchaseorders > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPurchaseorders}
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
              This action cannot be undone. This will permanently delete the purchase order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePurchaseorder}
              disabled={deletePurchaseorderMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePurchaseorderMutation.isPending ? (
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

export default PurchaseorderManagement;