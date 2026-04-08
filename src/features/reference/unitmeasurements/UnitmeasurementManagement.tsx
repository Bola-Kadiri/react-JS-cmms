// src/features/accounts/unitmeasurements/UnitmeasurementManagement.tsx
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
import { useUnitmeasurementsQuery, useDeleteUnitmeasurement } from '@/hooks/unitmeasurement/useUnitmeasurementQueries';
import { Unitmeasurement } from '@/types/unitmeasurement';
import { UnitmeasurementQueryParams } from '@/services/unitmeasurementsApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const UnitmeasurementManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitmeasurementToDelete, setUnitmeasurementToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {canEdit} = useFeatureAccess('reference')
  
  // Fetch all unitmeasurements - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useUnitmeasurementsQuery();

  // Delete unitmeasurement mutation using our custom hook
  const deleteUnitmeasurementMutation = useDeleteUnitmeasurement();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by code
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(unitmeasurement => 
        unitmeasurement.code.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(unitmeasurement => unitmeasurement.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter && typeFilter !== 'all') {
      results = results.filter(unitmeasurement => unitmeasurement.type === typeFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, typeFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalUnitmeasurements = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalUnitmeasurements / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, typeFilter]);

  // Event handlers
  const handleAddUnitmeasurement = () => {
    navigate('/dashboard/accounts/unit-measurements/create');
  };

  const handleViewUnitmeasurement = (code: string) => {
    navigate(`/dashboard/accounts/unit-measurements/view/${code}`);
  };

  const handleEditUnitmeasurement = (code: string) => {
    navigate(`/dashboard/accounts/unit-measurements/edit/${code}`);
  };

  const handleDeleteUnitmeasurement = (code: string) => {
    setUnitmeasurementToDelete(code);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUnitmeasurement = () => {
    if (unitmeasurementToDelete) {
      deleteUnitmeasurementMutation.mutate(unitmeasurementToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUnitmeasurementToDelete(null);
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

  // Handle type filter
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Helper function to get badge styles based on status/type
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

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'Area':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Packing':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case 'Piece':
        return "bg-pink-100 text-pink-800 hover:bg-pink-100";
      case 'Time':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'Volume':
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case 'Weight':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Other':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
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
          <p className="text-sm text-muted-foreground">Loading unit measurements...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading unit measurements</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Unit Measurement Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Unit Measurement Management</h1>
        {/* {canEdit && (
          <Button onClick={handleAddUnitmeasurement}>
          <Plus className="mr-2 h-4 w-4" /> Add Unit Measurement
        </Button>
        )} */}
         <PermissionGuard feature='reference' permission='view'>
          <Button onClick={handleAddUnitmeasurement}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit Measurement
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-row gap-4">
          <div className="flex-grow">
            <SearchFilter 
              onSearch={handleSearch}
              placeholder="Search by code..."
              initialSearchValue={searchValue}
            />
          </div>
          
          <div className="w-48">
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Area">Area</SelectItem>
                <SelectItem value="Packing">Packing</SelectItem>
                <SelectItem value="Piece">Piece</SelectItem>
                <SelectItem value="Time">Time</SelectItem>
                <SelectItem value="Volume">Volume</SelectItem>
                <SelectItem value="Weight">Weight</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-48">
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
      </div>

      {/* Unit Measurements Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Code</TableHead>
                <TableHead className="font-medium text-gray-600">Symbol</TableHead>
                <TableHead className="font-medium text-gray-600">Type</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No unit measurements found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((unitmeasurement) => (
                  <TableRow key={unitmeasurement.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {unitmeasurement.code}
                    </TableCell>
                    <TableCell>{unitmeasurement.symbol}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeBadgeStyles(unitmeasurement.type)}>
                        {unitmeasurement.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeStyles(unitmeasurement.status)}>
                        {unitmeasurement.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='reference' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewUnitmeasurement(String(unitmeasurement.code))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditUnitmeasurement(String(unitmeasurement.code))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteUnitmeasurement(String(unitmeasurement.code))}
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
          {totalUnitmeasurements > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalUnitmeasurements}
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
              This action cannot be undone. This will permanently delete the unit measurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUnitmeasurement}
              disabled={deleteUnitmeasurementMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteUnitmeasurementMutation.isPending ? (
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

export default UnitmeasurementManagement;