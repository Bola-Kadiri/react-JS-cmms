// src/features/facility/landlords/LandlordManagement.tsx
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
import { useLandlordsQuery, useDeleteLandlord } from '@/hooks/landlord/useLandlordQueries';
// import { useList } from '@/hooks/crud/useCrudOperations';
import { Landlord } from '@/types/landlord';
import { LandlordQueryParams } from '@/services/landlordsApi';
// import { Facility } from '@/pages/facility/facilities/FacilityManagementPage';

const LandlordManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [landlordToDelete, setLandlordToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // const [facilityFilter, setFacilityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all landlords - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useLandlordsQuery();

  // Delete landlord mutation using our custom hook
  const deleteLandlordMutation = useDeleteLandlord();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(landlord => 
        landlord.name.toLowerCase().includes(searchLower) ||
        landlord.email.toLowerCase().includes(searchLower) ||
        (landlord.phone && landlord.phone.toLowerCase().includes(searchLower))
      );
    }
    
    // Status filter
    if (statusFilter) {
      results = results.filter(landlord => landlord.status === statusFilter);
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
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter]);

  // Event handlers
  const handleAddLandlord = () => {
    navigate('/facility/landlords/create');
  };

  const handleViewLandlord = (id: string) => {
    navigate(`/facility/landlords/view/${id}`);
  };

  const handleEditLandlord = (id: string) => {
    navigate(`/facility/landlords/edit/${id}`);
  };

  const handleDeleteLandlord = (id: string) => {
    setLandlordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteLandlord = () => {
    if (landlordToDelete) {
      deleteLandlordMutation.mutate(landlordToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setLandlordToDelete(null);
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
    } 
    // else if (key === 'facility') {
    //   setFacilityFilter(value);
    // }
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
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
      ]
    },
  ];

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading landlords...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading landlords</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Landlord Management</h1>
        <Button onClick={handleAddLandlord}>
          <Plus className="mr-2 h-4 w-4" /> Add Landlord
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        <SearchFilter 
          onSearch={handleSearch}
          filters={filterConfig}
          onFilter={handleFilter}
          placeholder="Search landlords..."
          initialSearchValue={searchValue}
        />
      </div>

      {/* Buildings Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Name</TableHead>
                <TableHead className="font-medium text-gray-600">Email</TableHead>
                <TableHead className="font-medium text-gray-600">Phone</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No landlords found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((landlord) => (
                  <TableRow key={landlord.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell>{landlord.name}</TableCell>
                    {/* <TableCell>{landlord.name}</TableCell> */}
                    <TableCell>{landlord.email}</TableCell>
                    <TableCell>{landlord.phone}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        landlord.status === 'Active' 
                          ? 'bg-green-100 text-green-800 font-semibold' 
                          : 'bg-red-100 text-red-800 font-semibold'
                      }`}>
                        {landlord.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewLandlord(String(landlord.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditLandlord(String(landlord.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteLandlord(String(landlord.id))}
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
              This action cannot be undone. This will permanently delete the landlord.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteLandlord}
              disabled={deleteLandlordMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteLandlordMutation.isPending ? (
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

export default LandlordManagement;