// src/features/facility/zones/ZoneManagement.tsx
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
import { useZonesQuery, useDeleteZone } from '@/hooks/zone/useZoneQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { Zone } from '@/types/zone';
import { ZoneQueryParams } from '@/services/zonesApi';
import { Facility } from '@/types/facility';

type SortField = 'code' | 'name' | 'facility';
type SortDirection = 'asc' | 'desc';

const ZoneManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  
  // Filter, sorting, and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all zones - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useZonesQuery();
  
  // Get facilities for facility names
  const { 
    data: facilities = []
  } = useList<Facility>('facilities', 'facility/api/api/facilities/');

  // Delete zone mutation using our custom hook
  const deleteZoneMutation = useDeleteZone();

  // Extract unique facilities from zones data for filter options
  const facilityOptions = useMemo(() => {
    const facilityMap = new Map();
    
    data.results?.forEach(zone => {
      if (zone.facility) {
        const facility = facilities.find(f => f.id === zone.facility);
        if (facility) {
          facilityMap.set(facility.id, facility);
        }
      }
    });
    
    return Array.from(facilityMap.values()).map(facility => ({
      value: facility.name,
      label: facility.name
    }));
  }, [data.results, facilities]);

  // Helper function to get facility name
  const getFacilityName = (facilityId?: number) => {
    if (!facilityId) return 'None';
    const facility = facilities.find(f => f.id === facilityId);
    return facility ? facility.name : 'Unknown Facility';
  };

  // Client-side filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(zone => {
        const facilityName = getFacilityName(zone.facility).toLowerCase();
        
        return (
          zone.code.toLowerCase().includes(searchLower) ||
          zone.name.toLowerCase().includes(searchLower) ||
          facilityName.includes(searchLower)
        );
      });
    }
    
    // Facility filter
    if (facilityFilter) {
      results = results.filter(zone => getFacilityName(zone.facility) === facilityFilter);
    }
    
    // Sorting
    results.sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';
      
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
          aValue = getFacilityName(a.facility);
          bValue = getFacilityName(b.facility);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return results;
  }, [data.results, searchValue, facilityFilter, sortField, sortDirection, facilities]);
  
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
  }, [searchValue, facilityFilter]);

  // Event handlers
  const handleAddZone = () => {
    navigate('/dashboard/facility/zones/create');
  };

  const handleViewZone = (id: string) => {
    navigate(`/dashboard/facility/zones/view/${id}`);
  };

  const handleEditZone = (id: string) => {
    navigate(`/dashboard/facility/zones/edit/${id}`);
  };

  const handleDeleteZone = (id: string) => {
    setZoneToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteZone = () => {
    if (zoneToDelete) {
      deleteZoneMutation.mutate(zoneToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setZoneToDelete(null);
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
      key: 'facility',
      label: 'Facility',
      options: facilityOptions
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
          <p className="text-sm text-muted-foreground">Loading zones...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading zones</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zone Management</h1>
        <Button onClick={handleAddZone}>
          <Plus className="mr-2 h-4 w-4" /> Add Zone
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search zones..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Zones Table */}
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
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No zones found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((zone) => (
                  <TableRow key={zone.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-600">{zone.code}</TableCell>
                    <TableCell>{zone.name}</TableCell>
                    <TableCell>{getFacilityName(zone.facility)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewZone(String(zone.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditZone(String(zone.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteZone(String(zone.id))}
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
              This action cannot be undone. This will permanently delete the zone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteZone}
              disabled={deleteZoneMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteZoneMutation.isPending ? (
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

export default ZoneManagement;