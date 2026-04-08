// src/features/asset/warehouses/WarehouseManagement.tsx
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
import { useWarehousesQuery, useDeleteWarehouse } from '@/hooks/warehouse/useWarehouseQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { Warehouse } from '@/types/warehouse';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const WarehouseManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { canEdit } = useFeatureAccess('asset_register');
  
  // Fetch all warehouses - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useWarehousesQuery();

  // Fetch facilities for filtering
  const { data: facilitiesResponse } = useFacilitiesQuery();
  const facilities = facilitiesResponse?.results || [];

  // Delete warehouse mutation using our custom hook
  const deleteWarehouseMutation = useDeleteWarehouse();

  // Helper function to get facility name
  const getFacilityName = (facilityId: number) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility?.name || `Facility ${facilityId}`;
  };

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(warehouse => 
        warehouse.code.toLowerCase().includes(searchLower) ||
        warehouse.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Facility filter
    if (facilityFilter) {
      results = results.filter(warehouse => warehouse.facility.toString() === facilityFilter);
    }

    // Active status filter
    if (isActiveFilter) {
      const isActive = isActiveFilter === 'true';
      results = results.filter(warehouse => warehouse.is_active === isActive);
    }
    
    return results;
  }, [data.results, searchValue, facilityFilter, isActiveFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalWarehouses = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalWarehouses / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, facilityFilter, isActiveFilter]);

  // Event handlers
  const handleAddWarehouse = () => {
    navigate('/dashboard/asset/warehouses/create');
  };

  const handleViewWarehouse = (id: string) => {
    navigate(`/dashboard/asset/warehouses/view/${id}`);
  };

  const handleEditWarehouse = (id: string) => {
    navigate(`/dashboard/asset/warehouses/edit/${id}`);
  };

  const handleDeleteWarehouse = (id: string) => {
    setWarehouseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteWarehouse = () => {
    if (warehouseToDelete) {
      deleteWarehouseMutation.mutate(warehouseToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setWarehouseToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle filter
  const handleFilter = (key: string, value: string) => {
    if (key === 'facility') {
      setFacilityFilter(value);
    } else if (key === 'is_active') {
      setIsActiveFilter(value);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Define filter configuration
  const filterConfig = [
    {
      key: 'facility',
      label: 'Facility',
      options: facilities.map(facility => ({
        value: facility.id.toString(),
        label: facility.name
      }))
    },
    {
      key: 'is_active',
      label: 'Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading warehouses</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Warehouse Management</h1>
        {canEdit && (
          <Button onClick={handleAddWarehouse}>
            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
          </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search by code or name..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Warehouses Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Code</TableHead>
                <TableHead className="font-medium text-gray-600">Name</TableHead>
                <TableHead className="font-medium text-gray-600">Capacity</TableHead>
                <TableHead className="font-medium text-gray-600">Facility</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No warehouses found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((warehouse) => (
                  <TableRow key={warehouse.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-mono font-medium">{warehouse.code}</TableCell>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell className="text-sm">
                      {isNaN(Number(warehouse.capacity)) ? warehouse.capacity : Number(warehouse.capacity).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {warehouse.facility_detail?.name || getFacilityName(warehouse.facility)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        warehouse.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {warehouse.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <PermissionGuard feature='asset_register' permission='view'>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewWarehouse(String(warehouse.id))}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='asset_register' permission='edit'>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditWarehouse(String(warehouse.id))}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='asset_register' permission='edit'>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteWarehouse(String(warehouse.id))}
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
          {totalWarehouses > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalWarehouses}
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
              This action cannot be undone. This will permanently delete the warehouse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteWarehouse}
              disabled={deleteWarehouseMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteWarehouseMutation.isPending ? (
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

export default WarehouseManagement;