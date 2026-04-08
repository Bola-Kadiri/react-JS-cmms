// src/features/facility/clusters/ClusterManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useClustersQuery, useDeleteCluster } from '@/hooks/cluster/useClusterQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { User } from '@/types/user';

type SortField = 'name' | 'region' | 'manager';
type SortDirection = 'asc' | 'desc';

const ClusterManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState<string | null>(null);
  
  // Filter, sorting, and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all clusters - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useClustersQuery();
  
  // Get users for manager names
  const { 
    data: users = []
  } = useList<User>('users', 'accounts/api/users/');

  // Delete cluster mutation using our custom hook
  const deleteClusterMutation = useDeleteCluster();

  // Extract unique regions from cluster data for filter options
  const regionOptions = useMemo(() => {
    const regions = new Map();
    
    data.results?.forEach(cluster => {
      if (cluster.region_detail) {
        regions.set(cluster.region_detail.id, cluster.region_detail);
      }
    });
    
    return Array.from(regions.values()).map(region => ({
      value: region.name,
      label: region.name
    }));
  }, [data.results]);

  // Helper function to get manager name
  const getManagerName = (managerId: number) => {
    const manager = users.find(user => user.id === managerId);
    return manager ? `${manager.first_name} ${manager.last_name}` : 'Unknown Manager';
  };

  // Client-side filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(cluster => {
        const managerName = getManagerName(cluster.select_manager).toLowerCase();
        const regionName = cluster.region_detail?.name?.toLowerCase() || '';
        
        return (
          cluster.name.toLowerCase().includes(searchLower) ||
          regionName.includes(searchLower) ||
          managerName.includes(searchLower)
        );
      });
    }
    
    // Region filter
    if (regionFilter) {
      results = results.filter(cluster => cluster.region_detail?.name === regionFilter);
    }
    
    // Sorting
    results.sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'region':
          aValue = a.region_detail?.name || '';
          bValue = b.region_detail?.name || '';
          break;
        case 'manager':
          aValue = getManagerName(a.select_manager);
          bValue = getManagerName(b.select_manager);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return results;
  }, [data.results, searchValue, regionFilter, sortField, sortDirection, users]);
  
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
  }, [searchValue, regionFilter]);

  // Event handlers
  const handleAddCluster = () => {
    navigate('/dashboard/facility/clusters/create');
  };

  const handleViewCluster = (id: string) => {
    navigate(`/dashboard/facility/clusters/view/${id}`);
  };

  const handleEditCluster = (id: string) => {
    navigate(`/dashboard/facility/clusters/edit/${id}`);
  };

  const handleDeleteCluster = (id: string) => {
    setClusterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCluster = () => {
    if (clusterToDelete) {
      deleteClusterMutation.mutate(clusterToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setClusterToDelete(null);
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
    if (key === 'region') {
      setRegionFilter(value);
    }
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

  // Define filter configuration
  const filterConfig = [
    {
      key: 'region',
      label: 'Region',
      options: regionOptions
    }
  ];

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
          <p className="text-sm text-muted-foreground">Loading clusters...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading clusters</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cluster Management</h1>
        <Button onClick={handleAddCluster}>
          <Plus className="mr-2 h-4 w-4" /> Add Cluster
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search clusters..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Clusters Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
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
                    onClick={() => handleSort('region')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Region {renderSortIcon('region')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('manager')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Manager {renderSortIcon('manager')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No clusters found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((cluster) => (
                  <TableRow key={cluster.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-600">{cluster.name}</TableCell>
                    <TableCell>{cluster.region_detail?.name || 'Unknown Region'}</TableCell>
                    <TableCell>{getManagerName(cluster.select_manager)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewCluster(String(cluster.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditCluster(String(cluster.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteCluster(String(cluster.id))}
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
              This action cannot be undone. This will permanently delete the cluster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCluster}
              disabled={deleteClusterMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteClusterMutation.isPending ? (
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

export default ClusterManagement;