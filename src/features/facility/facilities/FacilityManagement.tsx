// src/features/facility/facilities/FacilityManagement.tsx
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
import { useFacilitiesQuery, useDeleteFacility } from '@/hooks/facility/useFacilityQueries';
import { Facility } from '@/types/facility';
import { Badge } from '@/components/ui/badge';
import { useList } from '@/hooks/crud/useCrudOperations';
import { User } from '@/types/user';
import { Cluster } from 'cluster';

const clusterEndpoint = 'facility/api/api/clusters/';
const userEndpoint = 'accounts/api/users/';

type SortField = 'name' | 'code' | 'cluster' | 'type';
type SortDirection = 'asc' | 'desc';

const FacilityManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<string | null>(null);
  
  // Filter, sorting, and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all facilities - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useFacilitiesQuery();

  // Delete facility mutation using our custom hook
  const deleteFacilityMutation = useDeleteFacility();

  const { data: clusters = [] } = useList<Cluster>('clusters', clusterEndpoint);
  const { data: users = [] } = useList<User>('users', userEndpoint);

  // Extract unique clusters from facility data for filter options
  const clusterOptions = useMemo(() => {
    const clusters = new Map();
    
    data.results?.forEach(facility => {
      if (facility.cluster_detail) {
        clusters.set(facility.cluster_detail.id, facility.cluster_detail);
      }
    });
    
    return Array.from(clusters.values()).map(cluster => ({
      value: cluster.name,
      label: cluster.name
    }));
  }, [data.results]);

  // Client-side filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(facility => {
        const clusterName = facility.cluster_detail?.name?.toLowerCase() || '';
        
        return (
          facility.name.toLowerCase().includes(searchLower) ||
          facility.code.toLowerCase().includes(searchLower) ||
          clusterName.includes(searchLower) ||
          facility.type.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Cluster filter
    if (clusterFilter) {
      results = results.filter(facility => facility.cluster_detail?.name === clusterFilter);
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
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'cluster':
          aValue = a.cluster_detail?.name || '';
          bValue = b.cluster_detail?.name || '';
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return results;
  }, [data.results, searchValue, clusterFilter, sortField, sortDirection]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, page, pageSize]);
  
  // Calculate total pages
  const totalFacilities = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalFacilities / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, clusterFilter]);

  // Event handlers
  const handleAddFacility = () => {
    navigate('/dashboard/facility/list/create');
  };

  const handleViewFacility = (code: string) => {
    navigate(`/dashboard/facility/list/view/${code}`);
  };

  const handleEditFacility = (code: string) => {
    navigate(`/dashboard/facility/list/edit/${code}`);
  };

  const handleDeleteFacility = (code: string) => {
    setFacilityToDelete(code);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFacility = () => {
    if (facilityToDelete) {
      deleteFacilityMutation.mutate(facilityToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setFacilityToDelete(null);
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
    if (key === 'cluster') {
      setClusterFilter(value);
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
      key: 'cluster',
      label: 'Cluster',
      options: clusterOptions
    }
  ];

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Get badge color based on type
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Commercial':
        return 'bg-blue-100 text-blue-800';
      case 'Residential':
        return 'bg-purple-100 text-purple-800';
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
          <p className="text-sm text-muted-foreground">Loading facilities...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading facilities</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Facility Management</h1>
        <Button onClick={handleAddFacility}>
          <Plus className="mr-2 h-4 w-4" /> Add Facility
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search by name, code, cluster name, or type..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Facilities Table */}
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
                    onClick={() => handleSort('code')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Code {renderSortIcon('code')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('cluster')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Cluster Name {renderSortIcon('cluster')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('type')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Type {renderSortIcon('type')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No facilities found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((facility) => (
                  <TableRow key={facility.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{facility.name}</TableCell>
                    <TableCell>{facility.code}</TableCell>
                    <TableCell>{facility.cluster_detail?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={`${getTypeBadgeClass(facility.type)} px-2 py-1 rounded-full text-xs`}>
                        {facility.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewFacility(String(facility.code))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditFacility(String(facility.code))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteFacility(String(facility.code))}
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
          {totalFacilities > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalFacilities}
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
              This action cannot be undone. This will permanently delete the facility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteFacility}
              disabled={deleteFacilityMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteFacilityMutation.isPending ? (
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

export default FacilityManagement;