// src/features/facility/apartmenttypes/ApartmenttypeManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Filter } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useApartmenttypesQuery, useDeleteApartmenttype } from '@/hooks/apartmenttype/useApartmenttypeQueries';
import { Apartmenttype } from '@/types/apartmenttype';
import { ApartmenttypeQueryParams } from '@/services/apartmenttypesApi';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ApartmenttypeManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apartmenttypeToDelete, setApartmenttypeToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all apartmenttypes - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useApartmenttypesQuery();

  // Delete apartmenttype mutation using our custom hook
  const deleteApartmenttypeMutation = useDeleteApartmenttype();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter (by name)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(apartmenttype => 
        apartmenttype.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter !== 'All') {
      results = results.filter(apartmenttype => apartmenttype.status === statusFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalApartmenttypes = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalApartmenttypes / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter]);

  // Event handlers
  const handleAddApartmenttype = () => {
    navigate('/facility/apartment-type/create');
  };

  const handleViewApartmenttype = (slug: string) => {
    navigate(`/facility/apartment-type/view/${slug}`);
  };

  const handleEditApartmenttype = (slug: string) => {
    navigate(`/facility/apartment-type/edit/${slug}`);
  };

  const handleDeleteApartmenttype = (slug: string) => {
    setApartmenttypeToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApartmenttype = () => {
    if (apartmenttypeToDelete) {
      deleteApartmenttypeMutation.mutate(apartmenttypeToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setApartmenttypeToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle status filter
  const handleStatusFilter = (status: 'All' | 'Active' | 'Inactive') => {
    setStatusFilter(status);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Get badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
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
          <p className="text-sm text-muted-foreground">Loading apartmenttypes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading apartmenttypes</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Apartmenttype Management</h1>
        <Button onClick={handleAddApartmenttype}>
          <Plus className="mr-2 h-4 w-4" /> Add Apartmenttype
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <SearchFilter 
            onSearch={handleSearch}
            placeholder="Search by name..."
            initialSearchValue={searchValue}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status: {statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusFilter('All')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('Active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('Inactive')}>
              Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Apartmenttypes Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Name</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No apartmenttypes found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((apartmenttype) => (
                  <TableRow key={apartmenttype.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{apartmenttype.name}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeClass(apartmenttype.status)} px-2 py-1 rounded-full text-xs`}>
                        {apartmenttype.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewApartmenttype(String(apartmenttype.slug))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditApartmenttype(String(apartmenttype.slug))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteApartmenttype(String(apartmenttype.slug))}
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
          {totalApartmenttypes > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalApartmenttypes}
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
              This action cannot be undone. This will permanently delete the apartmenttype.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteApartmenttype}
              disabled={deleteApartmenttypeMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteApartmenttypeMutation.isPending ? (
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

export default ApartmenttypeManagement;