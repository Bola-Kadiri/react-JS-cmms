// src/features/work/apartments/ApartmentManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
// import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useApartmentsQuery, useDeleteApartment } from '@/hooks/apartment/useApartmentQueries';
import { Apartment } from '@/types/apartment';
import { ApartmentQueryParams } from '@/services/apartmentsApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ApartmentManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownershipTypeFilter, setOwnershipTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all apartments - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useApartmentsQuery();

  // Delete apartment mutation using our custom hook
  const deleteApartmentMutation = useDeleteApartment();

  // Mock data for building and landlord lookup
  const getBuildingName = (buildingId: number) => {
    const buildings = {
      1: "Tower A",
      2: "Tower B",
      3: "Garden Villa",
      4: "Seaside Complex",
      5: "Business Park",
    };
    return buildings[buildingId as keyof typeof buildings] || `Building #${buildingId}`;
  };

  const getLandlordName = (landlordId: number) => {
    const landlords = {
      1: "John Smith",
      2: "Emma Johnson",
      3: "Michael Brown",
      4: "Sarah Williams",
      5: "Robert Davis",
    };
    return landlords[landlordId as keyof typeof landlords] || `Landlord #${landlordId}`;
  };

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by type, building, or landlord
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(apartment => 
        apartment.type.toLowerCase().includes(searchLower) ||
        apartment.landlord_detail?.name.toLowerCase().includes(searchLower) ||
        apartment.building_detail?.code.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(apartment => apartment.status === statusFilter);
    }
    
    // Ownership type filter
    if (ownershipTypeFilter && ownershipTypeFilter !== 'all') {
      results = results.filter(apartment => apartment.ownership_type === ownershipTypeFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, ownershipTypeFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalApartments = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalApartments / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, ownershipTypeFilter]);

  // Event handlers
  const handleAddApartment = () => {
    navigate('/facility/apartments/create');
  };

  const handleViewApartment = (id: string) => {
    navigate(`/facility/apartments/view/${id}`);
  };

  const handleEditApartment = (id: string) => {
    navigate(`/facility/apartments/edit/${id}`);
  };

  const handleDeleteApartment = (id: string) => {
    setApartmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApartment = () => {
    if (apartmentToDelete) {
      deleteApartmentMutation.mutate(apartmentToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setApartmentToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle status filter
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle ownership type filter
  const handleOwnershipTypeFilterChange = (value: string) => {
    setOwnershipTypeFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Helper functions for badge styling
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Inactive':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getOwnershipTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'Freehold':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'Leasehold':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case 'Freehold (Leased Out)':
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading apartments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading apartments</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Apartment Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Apartment Management</h1>
        <Button onClick={handleAddApartment}>
          <Plus className="mr-2 h-4 w-4" /> Add Apartment
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchFilter 
            onSearch={handleSearch}
            placeholder="Search by type, building, or landlord..."
            initialSearchValue={searchValue}
          />
        </div>
        
        <div className="w-full md:w-64">
          <Select value={ownershipTypeFilter} onValueChange={handleOwnershipTypeFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by ownership type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ownership Types</SelectItem>
              <SelectItem value="Freehold">Freehold</SelectItem>
              <SelectItem value="Leasehold">Leasehold</SelectItem>
              <SelectItem value="Freehold (Leased Out)">Freehold (Leased Out)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-52">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Apartments Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">No.</TableHead>
                <TableHead className="font-medium text-gray-600">Type</TableHead>
                <TableHead className="font-medium text-gray-600">Building</TableHead>
                <TableHead className="font-medium text-gray-600">Size (sqm)</TableHead>
                <TableHead className="font-medium text-gray-600">Ownership Type</TableHead>
                <TableHead className="font-medium text-gray-600">Landlord</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No apartments found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((apartment) => (
                  <TableRow key={apartment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{apartment.no}</TableCell>
                    <TableCell>{apartment.type}</TableCell>
                    <TableCell>{apartment.building_detail.code}</TableCell>
                    <TableCell>{apartment.no_of_sqm}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getOwnershipTypeBadgeStyles(apartment.ownership_type)}>
                        {apartment.ownership_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{apartment.landlord_detail.name}</TableCell>
                    <TableCell>
                      <Badge variant={apartment.status === 'Active' ? 'default' : 'outline'} 
                        className={getStatusBadgeStyles(apartment.status)}>
                        {apartment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewApartment(String(apartment.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditApartment(String(apartment.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteApartment(String(apartment.id))}
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
          {totalApartments > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalApartments}
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
              This action cannot be undone. This will permanently delete the apartment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteApartment}
              disabled={deleteApartmentMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteApartmentMutation.isPending ? (
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

export default ApartmentManagement;