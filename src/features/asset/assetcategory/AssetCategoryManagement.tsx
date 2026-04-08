import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useAssetCategoriesQuery, useDeleteAssetCategory } from '@/hooks/assetcategory/useAssetCategoryQueries';

type SortField = 'type' | 'code' | 'name' | 'salvage_value_percent' | 'useful_life_year';
type SortDirection = 'asc' | 'desc';

const AssetCategoryManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetCategoryToDelete, setAssetCategoryToDelete] = useState<string | null>(null);
  
  // Filter, sorting, and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all asset categories - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useAssetCategoriesQuery();

  // Delete asset category mutation using our custom hook
  const deleteAssetCategoryMutation = useDeleteAssetCategory();

  // Client-side filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter (by name or code)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(assetCategory => 
        assetCategory.name.toLowerCase().includes(searchLower) ||
        assetCategory.code.toLowerCase().includes(searchLower)
      );
    }
    
    // Sorting
    results.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortField) {
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'salvage_value_percent':
          aValue = a.salvage_value_percent;
          bValue = b.salvage_value_percent;
          break;
        case 'useful_life_year':
          aValue = a.useful_life_year;
          bValue = b.useful_life_year;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      // Handle numeric sorting for useful_life_year
      if (sortField === 'useful_life_year') {
        const comparison = (aValue as number) - (bValue as number);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      // Handle string sorting for other fields
      const comparison = (aValue as string).localeCompare(bValue as string);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return results;
  }, [data.results, searchValue, sortField, sortDirection]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, page, pageSize]);
  
  // Calculate total pages
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  // Event handlers
  const handleAddAssetCategory = () => {
    navigate('/dashboard/asset/inventory-reference/asset-categories/create');
  };

  const handleViewAssetCategory = (id: string) => {
    navigate(`/dashboard/asset/inventory-reference/asset-categories/view/${id}`);
  };

  const handleEditAssetCategory = (id: string) => {
    navigate(`/dashboard/asset/inventory-reference/asset-categories/edit/${id}`);
  };

  const handleDeleteAssetCategory = (id: string) => {
    setAssetCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAssetCategory = () => {
    if (assetCategoryToDelete) {
      deleteAssetCategoryMutation.mutate(assetCategoryToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setAssetCategoryToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading asset categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading asset categories</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asset Category Management</h1>
        <Button onClick={handleAddAssetCategory}>
          <Plus className="mr-2 h-4 w-4" /> Add Asset Category
        </Button>
      </div>

      {/* Search Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          placeholder="Search by name or code..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Asset Categories Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('type')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Type {renderSortIcon('type')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('code')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Code {renderSortIcon('code')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Name {renderSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('salvage_value_percent')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Salvage Value % {renderSortIcon('salvage_value_percent')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('useful_life_year')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Useful Life (Years) {renderSortIcon('useful_life_year')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No asset categories found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((assetCategory) => (
                  <TableRow key={assetCategory.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{assetCategory.type}</TableCell>
                    <TableCell className="font-medium text-green-600">{assetCategory.code}</TableCell>
                    <TableCell>{assetCategory.name}</TableCell>
                    <TableCell>{assetCategory.salvage_value_percent}%</TableCell>
                    <TableCell>{assetCategory.useful_life_year} years</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewAssetCategory(String(assetCategory.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditAssetCategory(String(assetCategory.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteAssetCategory(String(assetCategory.id))}
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
              This action cannot be undone. This will permanently delete the asset category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAssetCategory}
              disabled={deleteAssetCategoryMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteAssetCategoryMutation.isPending ? (
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

export default AssetCategoryManagement; 