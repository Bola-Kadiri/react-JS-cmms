// src/features/facility/inventories/InventoryManagement.tsx
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
import { useInventoriesQuery, useDeleteInventory } from '@/hooks/inventory/useInventoryQueries';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useInventoryTypesQuery } from '@/hooks/inventorytype/useInventoryTypeQueries';
import { useModels } from '@/hooks/model/useModelQueries';
import { Inventory } from '@/types/inventory';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {canEdit} = useFeatureAccess('inventory_register')
  
  // Fetch all inventories - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useInventoriesQuery();

  // Fetch data for filtering and display
  const { data: inventoryTypesResponse } = useInventoryTypesQuery();
  const { data: modelsResponse } = useModels();
  const { data: assetCategoriesResponse } = useAssetCategoriesQuery();
  const { data: vendorsResponse } = useVendorsQuery();
  
  const inventoryTypes = inventoryTypesResponse?.results || [];
  const models = modelsResponse?.results || [];
  const assetCategories = assetCategoriesResponse?.results || [];
  const vendors = vendorsResponse?.results || [];

  // Delete inventory mutation using our custom hook
  const deleteInventoryMutation = useDeleteInventory();

  // Helper functions to get names from IDs
  const getTypeName = (typeId: number) => {
    const type = inventoryTypes.find(t => t.id === typeId);
    return type ? `${type.type} (${type.code})` : `Type ${typeId}`;
  };

  const getModelName = (modelId: number) => {
    const model = models.find(m => m.id === modelId);
    return model ? `${model.name} (${model.code})` : `Model ${modelId}`;
  };

  const getCategoryName = (categoryId: number) => {
    const category = assetCategories.find(cat => cat.id === categoryId);
    return category?.name || `Category ${categoryId}`;
  };

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || `Vendor ${vendorId}`;
  };

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(inventory => 
        inventory.serial_number.toLowerCase().includes(searchLower) ||
        getModelName(inventory.model).toLowerCase().includes(searchLower) ||
        inventory.part_no.toLowerCase().includes(searchLower) ||
        inventory.tag.toLowerCase().includes(searchLower) ||
        getTypeName(inventory.type).toLowerCase().includes(searchLower) ||
        getCategoryName(inventory.category).toLowerCase().includes(searchLower) ||
        getVendorName(inventory.vendor).toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter) {
      results = results.filter(inventory => inventory.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      results = results.filter(inventory => inventory.category.toString() === categoryFilter);
    }

    // Vendor filter
    if (vendorFilter) {
      results = results.filter(inventory => inventory.vendor.toString() === vendorFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, categoryFilter, vendorFilter, inventoryTypes, models, assetCategories, vendors]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, categoryFilter, vendorFilter]);

  const formatCurrency = (amount: string | number) => {
    if (!amount) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Event handlers
  const handleAddInventory = () => {
    navigate('/dashboard/asset/inventories/create');
  };

  const handleViewInventory = (id: string) => {
    navigate(`/dashboard/asset/inventories/view/${id}`);
  };

  const handleEditInventory = (id: string) => {
    navigate(`/dashboard/asset/inventories/edit/${id}`);
  };

  const handleDeleteInventory = (id: string) => {
    setInventoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteInventory = () => {
    if (inventoryToDelete) {
      deleteInventoryMutation.mutate(inventoryToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setInventoryToDelete(null);
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
    if (key === 'status') {
      setStatusFilter(value);
    } else if (key === 'category') {
      setCategoryFilter(value);
    } else if (key === 'vendor') {
      setVendorFilter(value);
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
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Available', label: 'Available' },
        { value: 'Low Stock', label: 'Low Stock' },
        { value: 'Out of Stock', label: 'Out of Stock' },
        { value: 'Discontinued', label: 'Discontinued' }
      ]
    },
    {
      key: 'category',
      label: 'Asset Category',
      options: assetCategories.map(category => ({
        value: category.id.toString(),
        label: category.name
      }))
    },
    {
      key: 'vendor',
      label: 'Vendor',
      options: vendors.map(vendor => ({
        value: vendor.id.toString(),
        label: vendor.name
      }))
    }
  ];

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading inventories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading inventories</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        {canEdit && (
          <Button onClick={handleAddInventory}>
          <Plus className="mr-2 h-4 w-4" /> Add Inventory
        </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search by serial number, model, part number, tag..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Inventories Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Type</TableHead>
                <TableHead className="font-medium text-gray-600">Category</TableHead>
                <TableHead className="font-medium text-gray-600">Subcategory</TableHead>
                <TableHead className="font-medium text-gray-600">Vendor</TableHead>
                <TableHead className="font-medium text-gray-600">Model</TableHead>
                <TableHead className="font-medium text-gray-600">Unit Price</TableHead>
                {/* <TableHead className="font-medium text-gray-600">Purchase Date</TableHead>
                <TableHead className="font-medium text-gray-600">Manufacture Date</TableHead> */}
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No inventories found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((inventory) => (
                  <TableRow key={inventory.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{getTypeName(inventory.type)}</TableCell>
                    <TableCell className="text-sm">{getCategoryName(inventory.category)}</TableCell>
                    <TableCell className="text-sm">
                      {inventory.subcategory_detail?.name || `Subcategory ${inventory.subcategory}`}
                    </TableCell>
                    <TableCell className="text-sm">{getVendorName(inventory.vendor)}</TableCell>
                    <TableCell className="font-medium">{getModelName(inventory.model)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(inventory.unit_price)}</TableCell>
                    {/* <TableCell>{formatDate(inventory.purchase_date)}</TableCell>
                    <TableCell>{formatDate(inventory.manufacture_date)}</TableCell> */}
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        inventory.status === 'Available' 
                          ? 'bg-green-100 text-green-800'
                          : inventory.status === 'Low Stock' 
                          ? 'bg-orange-100 text-orange-800'
                          : inventory.status === 'Discontinued' 
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inventory.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <PermissionGuard feature='inventory_register' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewInventory(String(inventory.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='inventory_register' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditInventory(String(inventory.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='inventory_register' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteInventory(String(inventory.id))}
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
          {totalItems > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
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
              This action cannot be undone. This will permanently delete the inventory item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteInventory}
              disabled={deleteInventoryMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteInventoryMutation.isPending ? (
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

export default InventoryManagement;