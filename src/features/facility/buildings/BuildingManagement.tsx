// src/features/facility/buildings/BuildingManagement.tsx
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
import { useBuildingsQuery, useDeleteBuilding } from '@/hooks/building/useBuildingQueries';
import { Building } from '@/types/building';
import { BuildingQueryParams } from '@/services/buildingsApi';

type SortField = 'code' | 'name' | 'facility' | 'zone' | 'status';
type SortDirection = 'asc' | 'desc';

const BuildingManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  
  // Filter, sorting, and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all buildings - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useBuildingsQuery();

  // Delete building mutation using our custom hook
  const deleteBuildingMutation = useDeleteBuilding();

  // Extract unique facilities and zones from building data for filter options
  const filterOptions = useMemo(() => {
    const facilities = new Map();
    const zones = new Map();
    
    data.results?.forEach(building => {
      if (building.facility_detail) {
        facilities.set(building.facility_detail.id, building.facility_detail);
      }
      if (building.zone_detail) {
        zones.set(building.zone_detail.id, building.zone_detail);
      }
    });
    
    return {
      facilities: Array.from(facilities.values()),
      zones: Array.from(zones.values())
    };
  }, [data.results]);

  // Client-side filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(building => {
        const facilityName = building.facility_detail?.name?.toLowerCase() || '';
        const zoneName = building.zone_detail?.name?.toLowerCase() || '';
        
        return (
          building.name.toLowerCase().includes(searchLower) ||
          building.code.toLowerCase().includes(searchLower) ||
          facilityName.includes(searchLower) ||
          zoneName.includes(searchLower)
        );
      });
    }
    
    // Status filter
    if (statusFilter) {
      results = results.filter(building => building.status === statusFilter);
    }
    
    // Facility filter
    if (facilityFilter) {
      results = results.filter(building => building.facility_detail?.name === facilityFilter);
    }
    
    // Zone filter
    if (zoneFilter) {
      results = results.filter(building => building.zone_detail?.name === zoneFilter);
    }
    
    // Sorting
    results.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortField) {
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'facility':
          aValue = a.facility_detail?.name || '';
          bValue = b.facility_detail?.name || '';
          break;
        case 'zone':
          aValue = a.zone_detail?.name || '';
          bValue = b.zone_detail?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
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
  }, [data.results, searchValue, statusFilter, facilityFilter, zoneFilter, sortField, sortDirection]);
  
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
  }, [searchValue, statusFilter, facilityFilter, zoneFilter]);

  // Event handlers
  const handleAddBuilding = () => {
    navigate('/dashboard/facility/buildings/create');
  };

  const handleViewBuilding = (id: string) => {
    navigate(`/dashboard/facility/buildings/view/${id}`);
  };

  const handleEditBuilding = (id: string) => {
    navigate(`/dashboard/facility/buildings/edit/${id}`);
  };

  const handleDeleteBuilding = (id: string) => {
    setBuildingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBuilding = () => {
    if (buildingToDelete) {
      deleteBuildingMutation.mutate(buildingToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setBuildingToDelete(null);
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
    } else if (key === 'facility') {
      setFacilityFilter(value);
    } else if (key === 'zone') {
      setZoneFilter(value);
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

  // Prepare filter options
  const facilityOptions = filterOptions.facilities.map(facility => ({
    value: facility.name,
    label: facility.name
  }));

  const zoneOptions = filterOptions.zones.map(zone => ({
    value: zone.name,
    label: zone.name
  }));

  // Define filter configuration
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'facility',
      label: 'Facility',
      options: facilityOptions
    },
    {
      key: 'zone',
      label: 'Zone',
      options: zoneOptions
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
          <p className="text-sm text-muted-foreground">Loading buildings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading buildings</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Building Management</h1>
        <Button onClick={handleAddBuilding}>
          <Plus className="mr-2 h-4 w-4" /> Add Building
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search buildings..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Buildings Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
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
                    onClick={() => handleSort('facility')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Facility {renderSortIcon('facility')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('zone')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Zone {renderSortIcon('zone')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Status {renderSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No buildings found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((building) => (
                  <TableRow key={building.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-600">{building.code}</TableCell>
                    <TableCell>{building.name}</TableCell>
                    <TableCell>{building.facility_detail?.name || 'Unknown Facility'}</TableCell>
                    <TableCell>{building.zone_detail?.name || 'Unknown Zone'}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        building.status === 'Active' 
                          ? 'bg-green-100 text-green-800 font-semibold' 
                          : 'bg-red-100 text-red-800 font-semibold'
                      }`}>
                        {building.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewBuilding(String(building.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditBuilding(String(building.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteBuilding(String(building.id))}
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
              This action cannot be undone. This will permanently delete the building.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteBuilding}
              disabled={deleteBuildingMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteBuildingMutation.isPending ? (
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

export default BuildingManagement;