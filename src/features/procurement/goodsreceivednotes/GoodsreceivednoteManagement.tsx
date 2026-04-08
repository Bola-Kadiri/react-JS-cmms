// src/features/procurement/goodsreceivednotes/GoodsreceivednoteManagement.tsx
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
import { useGoodsreceivednotesQuery, useDeleteGoodsreceivednote } from '@/hooks/goodsreceivednote/useGoodsreceivednoteQueries';
import { Goodsreceivednote } from '@/types/goodsreceivednote';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const GoodsreceivednoteManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goodsreceivednoteToDelete, setGoodsreceivednoteToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all goodsreceivednotes - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useGoodsreceivednotesQuery();

  // Delete goodsreceivednote mutation using our custom hook
  const deleteGoodsreceivednote = useDeleteGoodsreceivednote();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by GRN number, delivery note, invoice, vendor, facility, or receiver
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(goodsreceivednote => 
        goodsreceivednote.grn_number?.toLowerCase().includes(searchLower) ||
        goodsreceivednote.delivery_note_number?.toLowerCase().includes(searchLower) ||
        goodsreceivednote.invoice_number?.toLowerCase().includes(searchLower) ||
        (goodsreceivednote.vendor_detail?.name && goodsreceivednote.vendor_detail.name.toLowerCase().includes(searchLower)) ||
        (goodsreceivednote.facility_detail?.name && goodsreceivednote.facility_detail.name.toLowerCase().includes(searchLower)) ||
        (goodsreceivednote.received_by_detail?.email && goodsreceivednote.received_by_detail.email.toLowerCase().includes(searchLower))
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
  const totalGoodsreceivednotes = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalGoodsreceivednotes / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  // Event handlers
  const handleAddGoodsreceivednote = () => {
    navigate('/dashboard/procurement/goods-received-note/create');
  };

  const handleViewGoodsreceivednote = (id: string) => {
    navigate(`/dashboard/procurement/goods-received-note/view/${id}`);
  };

  const handleEditGoodsreceivednote = (id: string) => {
    navigate(`/dashboard/procurement/goods-received-note/edit/${id}`);
  };

  const handleDeleteGoodsreceivednote = (id: string) => {
    setGoodsreceivednoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteGoodsreceivednote = () => {
    if (goodsreceivednoteToDelete) {
      deleteGoodsreceivednote.mutate(goodsreceivednoteToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setGoodsreceivednoteToDelete(null);
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
          <p className="text-sm text-muted-foreground">Loading goods received notes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading goods received notes</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Goods Received Note Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Goods Received Note Management</h1>
        <Button onClick={handleAddGoodsreceivednote}>
          <Plus className="mr-2 h-4 w-4" /> Add Goods Received Note
        </Button>
      </div>

      {/* Search Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          placeholder="Search by GRN number, delivery note, invoice, vendor, or facility..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Goods Received Notes Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">GRN Number</TableHead>
                <TableHead className="font-medium text-gray-600">Date of Receipt</TableHead>
                <TableHead className="font-medium text-gray-600">Vendor</TableHead>
                <TableHead className="font-medium text-gray-600">Facility</TableHead>
                <TableHead className="font-medium text-gray-600">Invoice Number</TableHead>
                <TableHead className="font-medium text-gray-600">Received By</TableHead>
                <TableHead className="font-medium text-gray-600">Review Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No goods received notes found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((goodsreceivednote) => (
                  <TableRow key={goodsreceivednote.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {goodsreceivednote.grn_number}
                    </TableCell>
                    <TableCell>{formatDate(goodsreceivednote.date_of_receipt)}</TableCell>
                    <TableCell>
                      {goodsreceivednote.vendor_detail?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {goodsreceivednote.facility_detail?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {goodsreceivednote.invoice_number}
                    </TableCell>
                    <TableCell>
                      {goodsreceivednote.received_by_detail
                        ? `${goodsreceivednote.received_by_detail.first_name} ${goodsreceivednote.received_by_detail.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          goodsreceivednote.review_status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            : goodsreceivednote.review_status === 'Approved'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }
                      >
                        {goodsreceivednote.review_status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewGoodsreceivednote(String(goodsreceivednote.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditGoodsreceivednote(String(goodsreceivednote.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteGoodsreceivednote(String(goodsreceivednote.id))}
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
          {totalGoodsreceivednotes > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalGoodsreceivednotes}
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
              This action cannot be undone. This will permanently delete the goods received note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteGoodsreceivednote}
              disabled={deleteGoodsreceivednote.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteGoodsreceivednote.isPending ? (
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

export default GoodsreceivednoteManagement;