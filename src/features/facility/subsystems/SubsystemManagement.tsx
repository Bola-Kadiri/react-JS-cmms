// src/features/facility/subsystems/SubsystemManagement.tsx
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
import { useSubsystemsQuery, useDeleteSubsystem } from '@/hooks/subsystem/useSubsystemQueries';
import { Subsystem } from '@/types/subsystem';

type SortField = 'name' | 'building_code' | 'building_name' | 'created_at';
type SortDirection = 'asc' | 'desc';

const SubsystemManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subsystemToDelete, setSubsystemToDelete] = useState<string | null>(null);
  
  // Filter, sorting, and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all subsystems - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useSubsystemsQuery();

  // Delete subsystem mutation using our custom hook
  const deleteSubsystemMutation = useDeleteSubsystem();

  // Extract unique buildings from subsystem data for filter options
  const buildingOptions = useMemo(() => {
    const buildings = new Map();
    
    data.results?.forEach(subsystem => {
      if (subsystem.building_detail) {
        buildings.set(subsystem.building_detail.id, subsystem.building_detail);
      }
    });
    
    return Array.from(buildings.values()).map(building => ({
      value: building.name,
      label: building.name
    }));
  }, [data.results]);

  // Client-side filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(subsystem => {
        const buildingName = subsystem.building_detail?.name?.toLowerCase() || '';
        const buildingCode = subsystem.building_detail?.code?.toLowerCase() || '';
        
        return (
          subsystem.name.toLowerCase().includes(searchLower) ||
          buildingName.includes(searchLower) ||
          buildingCode.includes(searchLower)
        );
      });
    }
    
    // Building filter
    if (buildingFilter) {
      results = results.filter(subsystem => subsystem.building_detail?.name === buildingFilter);
    }
    
    // Sorting
    results.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'building_code':
          aValue = a.building_detail?.code || '';
          bValue = b.building_detail?.code || '';
          break;
        case 'building_name':
          aValue = a.building_detail?.name || '';
          bValue = b.building_detail?.name || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });
    
    return results;
  }, [data.results, searchValue, buildingFilter, sortField, sortDirection]);
  
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
  }, [searchValue, buildingFilter]);

  // Event handlers
  const handleAddSubsystem = () => {
    navigate('/dashboard/facility/subsystems/create');
  };

  const handleViewSubsystem = (id: string) => {
    navigate(`/dashboard/facility/subsystems/view/${id}`);
  };

  const handleEditSubsystem = (id: string) => {
    navigate(`/dashboard/facility/subsystems/edit/${id}`);
  };

  const handleDeleteSubsystem = (id: string) => {
    setSubsystemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSubsystem = () => {
    if (subsystemToDelete) {
      deleteSubsystemMutation.mutate(subsystemToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSubsystemToDelete(null);
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
    if (key === 'building') {
      setBuildingFilter(value);
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
      key: 'building',
      label: 'Building',
      options: buildingOptions
    }
  ];

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading subsystems...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading subsystems</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subsystem Management</h1>
        <Button onClick={handleAddSubsystem}>
          <Plus className="mr-2 h-4 w-4" /> Add Subsystem
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search subsystems..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Subsystems Table */}
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
                    onClick={() => handleSort('building_code')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Building Code {renderSortIcon('building_code')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('building_name')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Building Name {renderSortIcon('building_name')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Created At {renderSortIcon('created_at')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No subsystems found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((subsystem) => (
                  <TableRow key={subsystem.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-600">{subsystem.name}</TableCell>
                    <TableCell>{subsystem.building_detail?.code || 'N/A'}</TableCell>
                    <TableCell>{subsystem.building_detail?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(subsystem.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewSubsystem(String(subsystem.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditSubsystem(String(subsystem.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteSubsystem(String(subsystem.id))}
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
              This action cannot be undone. This will permanently delete the subsystem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSubsystem}
              disabled={deleteSubsystemMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteSubsystemMutation.isPending ? (
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

export default SubsystemManagement;