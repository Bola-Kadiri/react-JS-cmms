// src/features/facility/personnels/PersonnelManagement.tsx
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
import { usePersonnelsQuery, useDeletePersonnel } from '@/hooks/personnel/usePersonnelQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { Personnel } from '@/types/personnel';
import { PersonnelQueryParams } from '@/services/personnelsApi';
import { Facility } from '@/types/facility';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const PersonnelManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<string | null>(null);

  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { canEdit } = useFeatureAccess('reference')

  // Fetch all personnels - we'll filter client-side
  const {
    data = { count: 0, results: [] },
    isLoading,
    isFetching,
    isError,
    refetch
  } = usePersonnelsQuery();

  // Get facilities for filter dropdown
  const {
    data: facilities = []
  } = useList<Facility>('facilities', 'facility/api/api/facilities/');

  // Delete personnel mutation using our custom hook
  const deletePersonnelMutation = useDeletePersonnel();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];

    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(personnel =>
        (personnel.first_name && personnel.first_name.toLowerCase().includes(searchLower)) ||
        (personnel.last_name && personnel.last_name.toLowerCase().includes(searchLower)) ||
        (personnel.email && personnel.email.toLowerCase().includes(searchLower)) ||
        (personnel.staff_number && personnel.staff_number.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter) {
      results = results.filter(personnel => personnel.status === statusFilter);
    }

    // Facility filter
    if (facilityFilter) {
      results = results.filter(personnel => personnel.facility_detail?.name === facilityFilter);
    }

    return results;
  }, [data.results, searchValue, statusFilter, facilityFilter]);

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
  }, [searchValue, statusFilter, facilityFilter]);

  // Event handlers
  const handleAddPersonnel = () => {
    navigate('/dashboard/accounts/personnels/create');
  };

  const handleViewPersonnel = (slug: string) => {
    navigate(`/dashboard/accounts/personnels/view/${slug}`);
  };

  const handleEditPersonnel = (slug: string) => {
    navigate(`/dashboard/accounts/personnels/edit/${slug}`);
  };

  const handleDeletePersonnel = (slug: string) => {
    setPersonnelToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePersonnel = () => {
    if (personnelToDelete) {
      deletePersonnelMutation.mutate(personnelToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPersonnelToDelete(null);
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

  // Prepare filter options for facilities
  const facilityOptions = facilities?.map(facility => ({
    value: facility.name,
    label: facility.name
  })) || [];

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
    }
  ];

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading personnels...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading personnels</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personnel Management</h1>
        {/* {canEdit && (
          <Button onClick={handleAddPersonnel}>
          <Plus className="mr-2 h-4 w-4" /> Add Personnel
        </Button>
        )} */}
        <PermissionGuard feature='reference' permission='view'>
          <Button onClick={handleAddPersonnel}>
            <Plus className="mr-2 h-4 w-4" />
            Add Personnel
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder="Search personnels..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Personnels Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Staff Number</TableHead>
                <TableHead className="font-medium text-gray-600">First Name</TableHead>
                <TableHead className="font-medium text-gray-600">Last Name</TableHead>
                <TableHead className="font-medium text-gray-600">Email</TableHead>
                <TableHead className="font-medium text-gray-600">Phone</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No personnels found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((personnel) => (
                  <TableRow key={personnel.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-green-600">
                      {personnel.staff_number || '-'}
                    </TableCell>
                    <TableCell>
                      {personnel.first_name || '-'}
                    </TableCell>
                    <TableCell>
                      {personnel.last_name || '-'}
                    </TableCell>
                    <TableCell>
                      {personnel.email || '-'}
                    </TableCell>
                    <TableCell>
                      {personnel.phone_number || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs ${personnel.status === 'Active'
                          ? 'bg-green-100 text-green-800 font-semibold'
                          : 'bg-red-100 text-red-800 font-semibold'
                        }`}>
                        {personnel.status || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='reference' permission='view'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPersonnel(String(personnel.slug))}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPersonnel(String(personnel.slug))}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePersonnel(String(personnel.slug))}
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
              This action cannot be undone. This will permanently delete the personnel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePersonnel}
              disabled={deletePersonnelMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePersonnelMutation.isPending ? (
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

export default PersonnelManagement;