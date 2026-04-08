// src/features/work/ppms/PpmManagement.tsx
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
import { usePpmsQuery, useDeletePpm, usePendingPpmsForReviewerQuery } from '@/hooks/ppm/usePpmQueries';
import { useAuth } from '@/contexts/AuthContext';
import { Ppm } from '@/types/ppm';
import { PpmQueryParams } from '@/services/ppmsApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PermissionGuard } from '@/components/PermissionGuard';

const PpmManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ppmToDelete, setPpmToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { isAuthenticated, user } = useAuth();

  // Fetch all ppms - we'll filter client-side
  const {
    data: allPpms = { count: 0, results: [] },
    isFetching: isFetchingAll,
    isError: isErrorAll,
    refetch: refetchAll
  } = usePpmsQuery();

  // Fetch pending review ppms for reviewers
  const {
    data: pendingPpms = { count: 0, results: [] },
    isFetching: isFetchingPending,
    isError: isErrorPending,
    refetch: refetchPending
  } = usePendingPpmsForReviewerQuery();

  const isReviewer = (user?.role || '').toUpperCase() === 'REVIEWER';

  const data = isReviewer ? pendingPpms : allPpms;
  const isFetching = isReviewer ? isFetchingPending : isFetchingAll;
  const isError = isReviewer ? isErrorPending : isErrorAll;
  const refetch = isReviewer ? refetchPending : refetchAll;

  // Delete ppm mutation using our custom hook
  const deletePpmMutation = useDeletePpm();

  // Mock data for owner, category, subcategory lookup
  const getOwnerName = (ownerId: number) => {
    const owners = {
      1: "John Doe",
      2: "Jane Smith",
      3: "Alex Johnson",
    };
    return owners[ownerId as keyof typeof owners] || `Owner #${ownerId}`;
  };

  const getCategoryName = (categoryId: number) => {
    const categories = {
      1: "HVAC",
      2: "Electrical",
      3: "Plumbing",
    };
    return categories[categoryId as keyof typeof categories] || `Category #${categoryId}`;
  };

  const getSubcategoryName = (subcategoryId: number) => {
    const subcategories = {
      1: "Maintenance",
      2: "Repair",
      3: "Installation",
    };
    return subcategories[subcategoryId as keyof typeof subcategories] || `Subcategory #${subcategoryId}`;
  };

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by category, subcategory, and owner
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(ppm => 
        getOwnerName(ppm.owner).toLowerCase().includes(searchLower) ||
        getCategoryName(ppm.category).toLowerCase().includes(searchLower) ||
        getSubcategoryName(ppm.subcategory).toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(ppm => ppm.status === statusFilter);
    }
    
    // Currency filter
    if (currencyFilter && currencyFilter !== 'all') {
      results = results.filter(ppm => ppm.currency === currencyFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, currencyFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalPpms = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalPpms / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, currencyFilter]);

  // Event handlers
  const handleAddPpm = () => {
    navigate('/dashboard/calendar/ppms/create');
  };

  const handleViewPpm = (id: string) => {
    navigate(`/dashboard/calendar/ppms/view/${id}`);
  };

  const handleEditPpm = (id: string) => {
    navigate(`/dashboard/calendar/ppms/edit/${id}`);
  };

  const handleDeletePpm = (id: string) => {
    setPpmToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePpm = () => {
    if (ppmToDelete) {
      deletePpmMutation.mutate(ppmToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPpmToDelete(null);
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

  // Handle currency filter
  const handleCurrencyFilterChange = (value: string) => {
    setCurrencyFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading ppms...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading ppms</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ppm Management</h1>
        <Button onClick={handleAddPpm}>
          <Plus className="mr-2 h-4 w-4" /> Add Ppm
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchFilter 
            onSearch={handleSearch}
            placeholder="Search by owner, category, or subcategory..."
            initialSearchValue={searchValue}
          />
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
        
        <div className="w-full md:w-52">
          <Select value={currencyFilter} onValueChange={handleCurrencyFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="NGN">Naira (NGN)</SelectItem>
              <SelectItem value="USD">US Dollar (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ppms Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">S/N</TableHead>
                <TableHead className="font-medium text-gray-600">Location</TableHead>
                <TableHead className="font-medium text-gray-600">Category</TableHead>
                <TableHead className="font-medium text-gray-600">Description</TableHead>
                <TableHead className="font-medium text-gray-600">Start Date</TableHead>
                <TableHead className="font-medium text-gray-600">End Date</TableHead>
                <TableHead className="font-medium text-gray-600">Frequency</TableHead>
                {/* <TableHead className="font-medium text-gray-600">Total Amount</TableHead> */}
                <TableHead className="font-medium text-gray-600">Review Status</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No ppms found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((ppm, index) => (
                  <TableRow key={ppm.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{ppm.facilities_detail[0]?.address_gps || 'N/A'}</TableCell>
                    <TableCell>{ppm.category_detail?.title}</TableCell>
                    <TableCell>{ppm?.description}</TableCell>
                    <TableCell>
                      {ppm.start_date ? new Date(ppm.start_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {ppm.end_date ? new Date(ppm.end_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {ppm.frequency} {ppm.frequency_unit}
                    </TableCell>
                    {/* <TableCell>
                      <span className="font-medium">{ppm.currency} {ppm.total_amount || '0.00'}</span>
                    </TableCell> */}
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          ppm.review_status === 'Reviewed' 
                            ? 'bg-green-50 text-green-700 hover:bg-green-50'
                            : ppm.review_status === 'Pending'
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                            : 'bg-red-50 text-red-700 hover:bg-red-50'
                        }
                      >
                        {ppm.review_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          ppm.status === 'Active' 
                            ? 'bg-green-50 text-green-700 hover:bg-green-50'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-50'
                        }
                      >
                        {ppm.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='ppm_setting' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewPpm(String(ppm.id))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='ppm_setting' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditPpm(String(ppm.id))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='ppm_setting' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePpm(String(ppm.id))}
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
          {totalPpms > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPpms}
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
              This action cannot be undone. This will permanently delete the ppm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePpm}
              disabled={deletePpmMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePpmMutation.isPending ? (
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

export default PpmManagement;