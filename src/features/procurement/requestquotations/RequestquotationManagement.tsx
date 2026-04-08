// src/features/procurement/requestquotations/RequestquotationManagement.tsx
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
import { useRequestquotationsQuery, useDeleteRequestquotation } from '@/hooks/requestquotation/useRequestquotationQueries';
import { Requestquotation } from '@/types/requestquotation';
import { RequestquotationQueryParams } from '@/services/requestquotationsApi';
import { format } from 'date-fns';

const RequestquotationManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestquotationToDelete, setRequestquotationToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all requestquotations - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useRequestquotationsQuery();

  // Delete requestquotation mutation using our custom hook
  const deleteRequestquotationMutation = useDeleteRequestquotation();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by type, title, facility, and requester
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(requestquotation => 
        requestquotation.type?.toLowerCase().includes(searchLower) ||
        requestquotation.title?.toLowerCase().includes(searchLower) ||
        requestquotation.title_en?.toLowerCase().includes(searchLower) ||
        requestquotation.facility_detail?.name?.toLowerCase().includes(searchLower) ||
        requestquotation.requester_detail?.first_name?.toLowerCase().includes(searchLower) ||
        requestquotation.requester_detail?.last_name?.toLowerCase().includes(searchLower)
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
  const totalRequestquotations = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRequestquotations / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  // Event handlers
  const handleAddRequestquotation = () => {
    navigate('/dashboard/procurement/request-quotation/create');
  };

  const handleViewRequestquotation = (id: string) => {
    navigate(`/dashboard/procurement/request-quotation/view/${id}`);
  };

  const handleEditRequestquotation = (id: string) => {
    navigate(`/dashboard/procurement/request-quotation/edit/${id}`);
  };

  const handleDeleteRequestquotation = (id: string) => {
    setRequestquotationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRequestquotation = () => {
    if (requestquotationToDelete) {
      deleteRequestquotationMutation.mutate(requestquotationToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setRequestquotationToDelete(null);
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

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading request quotations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading request quotations</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Request Quotation Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Request Quotation Management</h1>
        <Button onClick={handleAddRequestquotation}>
          <Plus className="mr-2 h-4 w-4" /> Add Request Quotation
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          placeholder="Search by type, title, facility, or requester..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Request Quotations Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Type</TableHead>
                <TableHead className="font-medium text-gray-600">Title</TableHead>
                <TableHead className="font-medium text-gray-600">Facility</TableHead>
                <TableHead className="font-medium text-gray-600">Requester</TableHead>
                <TableHead className="font-medium text-gray-600">Currency</TableHead>
                <TableHead className="font-medium text-gray-600">Created At</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No request quotations found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((requestquotation) => (
                  <TableRow key={requestquotation.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {requestquotation.type || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {requestquotation.title || requestquotation.title_en || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {requestquotation.facility_detail?.name || '-'}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {requestquotation.requester_detail 
                        ? `${requestquotation.requester_detail.first_name} ${requestquotation.requester_detail.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>{requestquotation.currency || '-'}</TableCell>
                    <TableCell>{formatDate(requestquotation.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewRequestquotation(String(requestquotation.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditRequestquotation(String(requestquotation.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteRequestquotation(String(requestquotation.id))}
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
          {totalRequestquotations > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalRequestquotations}
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
              This action cannot be undone. This will permanently delete the request quotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRequestquotation}
              disabled={deleteRequestquotationMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteRequestquotationMutation.isPending ? (
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

export default RequestquotationManagement;