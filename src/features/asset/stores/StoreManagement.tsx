// src/features/asset/stores/StoreManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Filter } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useStoresQuery, useDeleteStore } from '@/hooks/store/useStoreQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useWarehousesQuery } from '@/hooks/warehouse/useWarehouseQueries';
import { Store } from '@/types/store';
import { StoreQueryParams } from '@/services/storesApi';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const StoreManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [facilityFilter, setFacilityFilter] = useState<'All' | number>('All');
  const [warehouseFilter, setWarehouseFilter] = useState<'All' | number>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all stores - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useStoresQuery();

  // Fetch facilities and warehouses for filtering
  const { data: facilitiesData } = useFacilitiesQuery();
  const { data: warehousesData } = useWarehousesQuery();

  // Delete store mutation using our custom hook
  const deleteStoreMutation = useDeleteStore();

  // Helper functions to get names
  const getFacilityName = (facilityId: number) => {
    const facility = facilitiesData?.results?.find(f => f.id === facilityId);
    return facility ? facility.name : `Facility ${facilityId}`;
  };

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehousesData?.results?.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : `Warehouse ${warehouseId}`;
  };

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter (by name or code)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(store => 
        store.name.toLowerCase().includes(searchLower) ||
        store.code.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter !== 'All') {
      results = results.filter(store => store.status === statusFilter);
    }

    // Facility filter
    if (facilityFilter !== 'All') {
      results = results.filter(store => store.facility === facilityFilter);
    }

    // Warehouse filter
    if (warehouseFilter !== 'All') {
      results = results.filter(store => store.warehouse === warehouseFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, facilityFilter, warehouseFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalStores = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalStores / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, facilityFilter, warehouseFilter]);

  // Event handlers
  const handleAddStore = () => {
    navigate('/dashboard/asset/stores/create');
  };

  const handleViewStore = (id: string) => {
    navigate(`/dashboard/asset/stores/view/${id}`);
  };

  const handleEditStore = (id: string) => {
    navigate(`/dashboard/asset/stores/edit/${id}`);
  };

  const handleDeleteStore = (id: string) => {
    setStoreToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStore = () => {
    if (storeToDelete) {
      deleteStoreMutation.mutate(storeToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setStoreToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle status filter
  const handleStatusFilter = (status: 'All' | 'Active' | 'Inactive') => {
    setStatusFilter(status);
  };

  // Handle facility filter
  const handleFacilityFilter = (facilityId: 'All' | number) => {
    setFacilityFilter(facilityId);
  };

  // Handle warehouse filter
  const handleWarehouseFilter = (warehouseId: 'All' | number) => {
    setWarehouseFilter(warehouseId);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Get badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading stores...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading stores</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Store Management</h1>
        <Button onClick={handleAddStore}>
          <Plus className="mr-2 h-4 w-4" /> Add Store
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <SearchFilter 
            onSearch={handleSearch}
            placeholder="Search by name or code..."
            initialSearchValue={searchValue}
          />
        </div>
        
        {/* Facility Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Facility: {facilityFilter === 'All' ? 'All' : getFacilityName(facilityFilter as number)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleFacilityFilter('All')}>
              All Facilities
            </DropdownMenuItem>
            {facilitiesData?.results?.map((facility) => (
              <DropdownMenuItem key={facility.id} onClick={() => handleFacilityFilter(facility.id)}>
                {facility.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Warehouse Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Warehouse: {warehouseFilter === 'All' ? 'All' : getWarehouseName(warehouseFilter as number)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleWarehouseFilter('All')}>
              All Warehouses
            </DropdownMenuItem>
            {warehousesData?.results?.map((warehouse) => (
              <DropdownMenuItem key={warehouse.id} onClick={() => handleWarehouseFilter(warehouse.id)}>
                {warehouse.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status: {statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusFilter('All')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('Active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('Inactive')}>
              Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stores Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Name</TableHead>
                <TableHead className="font-medium text-gray-600">Code</TableHead>
                <TableHead className="font-medium text-gray-600">Capacity</TableHead>
                <TableHead className="font-medium text-gray-600">Facility</TableHead>
                <TableHead className="font-medium text-gray-600">Warehouse</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No stores found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((store) => (
                  <TableRow key={store.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.code}</TableCell>
                    <TableCell>{store.capacity.toLocaleString()}</TableCell>
                    <TableCell>{getFacilityName(store.facility)}</TableCell>
                    <TableCell>{getWarehouseName(store.warehouse)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeClass(store.status)} px-2 py-1 rounded-full text-xs`}>
                        {store.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewStore(String(store.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditStore(String(store.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteStore(String(store.id))}
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
          {totalStores > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalStores}
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
              This action cannot be undone. This will permanently delete the store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStore}
              disabled={deleteStoreMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteStoreMutation.isPending ? (
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

export default StoreManagement;