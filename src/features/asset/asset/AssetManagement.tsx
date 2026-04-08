// src/features/facility/assets/AssetManagement.tsx
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
import { useAssetsQuery, useDeleteAsset } from '@/hooks/asset/useAssetQueries';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { Asset } from '@/types/asset';
import { AssetQueryParams } from '@/services/assetsApi';
// import { Facility } from '@/pages/facility/facilities/FacilityManagementPage';

// Import translation and formatting hooks
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { useFormatters } from '@/utils/formatters';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const AssetManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const {canEdit} = useFeatureAccess('asset_register')
  
  // Translation and formatter hooks
  const { t } = useTypedTranslation(['assets', 'common', 'tables']);
  const { formatCurrency } = useFormatters();
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  // const [facilityFilter, setFacilityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all assets - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useAssetsQuery();

  // Fetch asset categories and subcategories for filtering and display
  const { data: assetCategoriesResponse } = useAssetCategoriesQuery();
  const { data: assetSubcategoriesResponse } = useAssetSubcategoriesQuery();
  
  const assetCategories = assetCategoriesResponse?.results || [];
  const assetSubcategories = assetSubcategoriesResponse?.results || [];
  
  // Get facilities for filter dropdown
  // const { 
  //   data: facilities = []
  // } = useList<Facility>('facilities', 'facility/api/api/facilities/');

  // Delete asset mutation using our custom hook
  const deleteAssetMutation = useDeleteAsset();

  // Helper functions to get category and subcategory names
  const getCategoryName = (categoryId: number) => {
    const category = assetCategories.find(cat => cat.id === categoryId);
    return category?.name || `Category ${categoryId}`;
  };

  const getSubcategoryName = (subcategoryId: number) => {
    const subcategory = assetSubcategories.find(sub => sub.id === subcategoryId);
    return subcategory?.name || `Subcategory ${subcategoryId}`;
  };

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(asset => 
        asset.asset_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Condition filter (using statusFilter variable for condition)
    if (statusFilter) {
      results = results.filter(asset => asset.condition === statusFilter);
    }
    
    // Asset Type filter
    if (typeFilter) {
      results = results.filter(asset => asset.asset_type === typeFilter);
    }

    // Asset Category filter
    if (categoryFilter) {
      results = results.filter(asset => asset.category.toString() === categoryFilter);
    }

    // Asset Subcategory filter
    if (subcategoryFilter) {
      results = results.filter(asset => asset.subcategory.toString() === subcategoryFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, typeFilter, categoryFilter, subcategoryFilter]);
  
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
  }, [searchValue, statusFilter, typeFilter, categoryFilter, subcategoryFilter]);

  // Event handlers
  const handleAddAsset = () => {
    navigate('/dashboard/asset/assets/create');
  };

  const handleViewAsset = (id: string) => {
    navigate(`/dashboard/asset/assets/view/${id}`);
  };

  const handleEditAsset = (id: string) => {
    navigate(`/dashboard/asset/assets/edit/${id}`);
  };

  const handleDeleteAsset = (id: string) => {
    setAssetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAsset = () => {
    if (assetToDelete) {
      deleteAssetMutation.mutate(assetToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setAssetToDelete(null);
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
    } else if (key === 'type') {
      setTypeFilter(value);
    } else if (key === 'category') {
      setCategoryFilter(value);
    } else if (key === 'subcategory') {
      setSubcategoryFilter(value);
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
      label: 'Condition',
      options: [
        { value: 'Used', label: 'Used' },
        { value: 'Brand New', label: 'Brand New' }
      ]
    },
    {
      key: 'type',
      label: 'Asset Type',
      options: [
        { value: 'Asset', label: 'Asset' },
        { value: 'Consumable', label: 'Consumable' }
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
      key: 'subcategory',
      label: 'Asset Subcategory',
      options: assetSubcategories.map(subcategory => ({
        value: subcategory.id.toString(),
        label: subcategory.name
      }))
    }
  ];

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading assets</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Asset Management</h1>
       {/* To this: */}
<PermissionGuard feature='asset_register' permission='view'>
  <Button onClick={handleAddAsset}>
    <Plus className="mr-2 h-4 w-4" />
    Add Asset
  </Button>
</PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search by asset name..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Assets Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Asset Name</TableHead>
                <TableHead className="font-medium text-gray-600">Facility</TableHead>
                <TableHead className="font-medium text-gray-600">Asset Type</TableHead>
                <TableHead className="font-medium text-gray-600">Category</TableHead>
                <TableHead className="font-medium text-gray-600">Subcategory</TableHead>
                <TableHead className="font-medium text-gray-600">Condition</TableHead>
                <TableHead className="font-medium text-gray-600">Purchased Amount</TableHead>
                <TableHead className="font-medium text-gray-600">Purchase Date</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No assets found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((asset) => (
                  <TableRow key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{asset.asset_name}</TableCell>
                    <TableCell className="font-medium">{asset?.facility_detail?.name}({asset?.facility_detail?.address_gps})</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        asset.asset_type === 'Asset' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {asset.asset_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{getCategoryName(asset.category)}</TableCell>
                    <TableCell className="text-sm">{getSubcategoryName(asset.subcategory)}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        asset.condition === 'Brand New' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {asset.condition}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(asset.purchased_amount, 'NGN')}</TableCell>
                    <TableCell>{new Date(asset.purchase_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <PermissionGuard feature='asset_register' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewAsset(String(asset.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='asset_register' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditAsset(String(asset.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='asset_register' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteAsset(String(asset.id))}
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
            <AlertDialogTitle>{t('common:confirmation.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common:confirmation.deleteDescription', { item: t('assets:types.asset') })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:confirmation.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAsset}
              disabled={deleteAssetMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteAssetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common:status.deleting')}
                </>
              ) : (
                t('common:actions.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetManagement;