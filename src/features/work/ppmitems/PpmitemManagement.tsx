// src/features/work/ppmitems/PpmitemManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { usePPMItemsQuery, useDeletePPMItem } from '@/hooks/ppmitem/usePpmitemQueries';
import { PPMItem } from '@/types/ppmitem';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const PpmitemManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ppmitemToDelete, setPpmitemToDelete] = useState<string | null>(null);

  const {canEdit} = useFeatureAccess('ppm_item')
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all ppm items - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = usePPMItemsQuery();

  // Delete ppm item mutation using our custom hook
  const deletePPMItemMutation = useDeletePPMItem();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by description, unit, and unit price
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(ppmitem => 
        ppmitem.description.toLowerCase().includes(searchLower) ||
        ppmitem.unit.toLowerCase().includes(searchLower) ||
        ppmitem.unit_price.toLowerCase().includes(searchLower)
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
  const totalPPMItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalPPMItems / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  // Event handlers
  const handleAddPPMItem = () => {
    navigate('/dashboard/work/ppm-items/create');
  };

  const handleViewPPMItem = (id: number) => {
    navigate(`/dashboard/work/ppm-items/view/${id}`);
  };

  const handleEditPPMItem = (id: number) => {
    navigate(`/dashboard/work/ppm-items/edit/${id}`);
  };

  const handleDeletePPMItem = (id: number) => {
    setPpmitemToDelete(String(id));
    setDeleteDialogOpen(true);
  };

  const confirmDeletePPMItem = () => {
    if (ppmitemToDelete) {
      deletePPMItemMutation.mutate(ppmitemToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPpmitemToDelete(null);
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

  // Format currency
  const formatCurrency = (price: string) => {
    if (!price) return 'N/A';
    const amount = parseFloat(price);
    if (isNaN(amount)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total price
  const calculateTotalPrice = (qty: number, unitPrice: string) => {
    const price = parseFloat(unitPrice);
    if (isNaN(price)) return 'N/A';
    return formatCurrency((qty * price).toString());
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading PPM items...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading PPM items</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PPM Items Management</h1>
        {canEdit && (
          <Button onClick={handleAddPPMItem} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Add PPM Item
          </Button>
        )}
      </div>

      {/* Search Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by description, unit, or unit price..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setSearchValue('')}
            className="h-10 border-gray-300 hover:bg-gray-50"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* PPM Items Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50 border-green-100">
                <TableHead className="font-semibold text-green-800">ID</TableHead>
                <TableHead className="font-semibold text-green-800">Description</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">Quantity</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">Unit Price</TableHead>
                <TableHead className="font-semibold text-green-800">Unit</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">Total Price</TableHead>
                <TableHead className="font-semibold text-green-800 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-lg font-medium">No PPM items found</div>
                      <div className="text-sm">Try adjusting your search criteria</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((ppmitem) => (
                  <TableRow key={ppmitem.id} className="border-b border-gray-100 hover:bg-green-25">
                    <TableCell className="font-medium text-green-800">
                      {ppmitem.id}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={ppmitem.description}>
                        {ppmitem.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {ppmitem.qty.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(ppmitem.unit_price)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        {ppmitem.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {calculateTotalPrice(ppmitem.qty, ppmitem.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='ppm_item' permission='view'>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewPPMItem(ppmitem.id)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='ppm_item' permission='edit'>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditPPMItem(ppmitem.id)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='ppm_item' permission='edit'>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeletePPMItem(ppmitem.id)}
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
          
          {/* Simple Pagination */}
          {totalPPMItems > 0 && (
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {Math.min((page - 1) * pageSize + 1, totalPPMItems)} to {Math.min(page * pageSize, totalPPMItems)} of {totalPPMItems} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
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
              This action cannot be undone. This will permanently delete the PPM item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePPMItem}
              disabled={deletePPMItemMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePPMItemMutation.isPending ? (
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

export default PpmitemManagement;
