// src/features/procurement/porequisitions/PorequisitionManagement.tsx
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
import { usePorequisitionsQuery, useDeletePorequisition } from '@/hooks/porequisition/usePorequisitionQueries';
import { Porequisition } from '@/types/porequisition';
import { PorequisitionQueryParams } from '@/services/porequisitionsApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const PorequisitionManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [porequisitionToDelete, setPorequisitionToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all porequisitions - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = usePorequisitionsQuery();

  console.log('*******************************************')
  console.log(data);

  // Delete porequisition mutation using our custom hook
  const deletePorequisitionMutation = useDeletePorequisition();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by invoice_number, title, and vendor name
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(porequisition => 
        porequisition.invoice_number.toLowerCase().includes(searchLower) ||
        porequisition.title.toLowerCase().includes(searchLower) ||
        (porequisition.vendor_detail?.name && porequisition.vendor_detail.name.toLowerCase().includes(searchLower))
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
  const totalPorequisitions = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalPorequisitions / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  // Event handlers
  const handleAddPorequisition = () => {
    navigate('/dashboard/procurement/po-requisition/create');
  };

  const handleViewPorequisition = (id: string) => {
    navigate(`/dashboard/procurement/po-requisition/view/${id}`);
  };

  const handleEditPorequisition = (id: string) => {
    navigate(`/dashboard/procurement/po-requisition/edit/${id}`);
  };

  const handleDeletePorequisition = (id: string) => {
    setPorequisitionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePorequisition = () => {
    if (porequisitionToDelete) {
      deletePorequisitionMutation.mutate(porequisitionToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPorequisitionToDelete(null);
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

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    try {
      const numAmount = parseFloat(amount);
      return numAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
    } catch (e) {
      return amount;
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading PO requisitions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading PO requisitions</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>PO Requisition Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PO Requisition Management</h1>
        <Button onClick={handleAddPorequisition}>
          <Plus className="mr-2 h-4 w-4" /> Add PO Requisition
        </Button>
      </div>

      {/* Search Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          placeholder="Search by invoice number, title, or vendor..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Porequisitions Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Invoice Number</TableHead>
                <TableHead className="font-medium text-gray-600">Title</TableHead>
                <TableHead className="font-medium text-gray-600">Vendor</TableHead>
                <TableHead className="font-medium text-gray-600">Amount</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600">Expected Delivery</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No PO requisitions found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((porequisition) => (
                  <TableRow key={porequisition.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {porequisition.invoice_number}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={porequisition.title}>
                      {porequisition.title}
                    </TableCell>
                    <TableCell>
                      {porequisition.vendor_detail?.name || `-`}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      {formatCurrency(porequisition.amount)}
                    </TableCell>
                    <TableCell>
                      {porequisition.review_status && (
                        <Badge 
                          variant={
                            porequisition.review_status === 'Approved' ? 'default' : 
                            porequisition.review_status === 'Rejected' ? 'destructive' : 
                            'secondary'
                          }
                          className={
                            porequisition.review_status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                          }
                        >
                          {porequisition.review_status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(porequisition.expected_delivery_date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewPorequisition(String(porequisition.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditPorequisition(String(porequisition.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePorequisition(String(porequisition.id))}
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
          {totalPorequisitions > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPorequisitions}
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
              This action cannot be undone. This will permanently delete the PO requisition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePorequisition}
              disabled={deletePorequisitionMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePorequisitionMutation.isPending ? (
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

export default PorequisitionManagement;