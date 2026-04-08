// src/features/procurement/vendorcontracts/VendorcontractManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useVendorContractsQuery, useDeleteVendorContract } from '@/hooks/vendorcontract/useVendorcontractQueries';
import { VendorContract } from '@/types/vendorcontract';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';

const VendorcontractManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorcontractToDelete, setVendorcontractToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all vendor contracts - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useVendorContractsQuery();

  // Delete vendor contract mutation using our custom hook
  const deleteVendorContractMutation = useDeleteVendorContract();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by contract_title and vendor name
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(vendorcontract => 
        vendorcontract.contract_title.toLowerCase().includes(searchLower) ||
        (vendorcontract.vendor_detail?.name && vendorcontract.vendor_detail.name.toLowerCase().includes(searchLower)) ||
        (vendorcontract.reviewer_detail?.email && vendorcontract.reviewer_detail.email.toLowerCase().includes(searchLower))
      );
    }
    
    // Contract type filter
    if (contractTypeFilter && contractTypeFilter !== 'all') {
      results = results.filter(vendorcontract => vendorcontract.contract_type === contractTypeFilter);
    }
    
    return results;
  }, [data.results, searchValue, contractTypeFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalVendorContracts = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalVendorContracts / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, contractTypeFilter]);

  // Event handlers
  const handleAddVendorContract = () => {
    navigate('/dashboard/procurement/vendor-contracts/create');
  };

  const handleViewVendorContract = (id: number) => {
    navigate(`/dashboard/procurement/vendor-contracts/view/${id}`);
  };

  const handleEditVendorContract = (id: number) => {
    navigate(`/dashboard/procurement/vendor-contracts/edit/${id}`);
  };

  const handleDeleteVendorContract = (id: number) => {
    setVendorcontractToDelete(id.toString());
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVendorContract = () => {
    if (vendorcontractToDelete) {
      deleteVendorContractMutation.mutate(vendorcontractToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setVendorcontractToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle contract type filter
  const handleContractTypeFilterChange = (value: string) => {
    setContractTypeFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    try {
      const numAmount = parseFloat(amount);
      return numAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
    } catch (e) {
      return amount;
    }
  };

  // Helper function to get badge styles based on contract type
  const getContractTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'Service':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'Purchase':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Lease':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case 'NDA':
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Check if contract is active
  const isContractActive = (startDate: string, endDate: string) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return now >= start && now <= end;
    } catch (e) {
      return false;
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-600">Loading vendor contracts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading vendor contracts</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Contract Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track vendor contracts</p>
        </div>
        <PermissionGuard feature='vendor_contract' permission='edit'>
          <Button 
            onClick={handleAddVendorContract}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Vendor Contract
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchFilter 
              onSearch={handleSearch}
              placeholder="Search by contract title, vendor, or reviewer..."
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={contractTypeFilter} onValueChange={handleContractTypeFilterChange}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
                <SelectItem value="Lease">Lease</SelectItem>
                <SelectItem value="NDA">NDA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Contract Title</TableHead>
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Start Date</TableHead>
                <TableHead className="font-semibold">End Date</TableHead>
                <TableHead className="font-semibold">Value</TableHead>
                <TableHead className="font-semibold">Review Status</TableHead>
                <TableHead className="font-semibold">Contract Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No vendor contracts found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((vendorcontract) => (
                  <TableRow key={vendorcontract.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {vendorcontract.contract_title}
                    </TableCell>
                    <TableCell>
                      {vendorcontract.vendor_detail?.name || `Vendor #${vendorcontract.vendor}`}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getContractTypeBadgeStyles(vendorcontract.contract_type)}
                      >
                        {vendorcontract.contract_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(vendorcontract.start_date)}</TableCell>
                    <TableCell>{formatDate(vendorcontract.end_date)}</TableCell>
                    <TableCell>{formatCurrency(vendorcontract.proposed_value)}</TableCell>
                    <TableCell>
                      {vendorcontract.review_status && (
                        <Badge 
                          variant={
                            vendorcontract.review_status === 'Approved' ? 'default' : 
                            vendorcontract.review_status === 'Rejected' ? 'destructive' : 
                            'secondary'
                          }
                          className={
                            vendorcontract.review_status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                          }
                        >
                          {vendorcontract.review_status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isContractActive(vendorcontract.start_date, vendorcontract.end_date) ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard feature='vendor_contract' permission='view'>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewVendorContract(vendorcontract.id)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='vendor_contract' permission='edit'>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVendorContract(vendorcontract.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='vendor_contract' permission='edit'>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVendorContract(vendorcontract.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </div>

        {/* Pagination */}
        {paginatedData.length > 0 && (
          <div className="mt-4 px-4 pb-4">
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={totalVendorContracts}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor contract.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVendorContract}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteVendorContractMutation.isPending}
            >
              {deleteVendorContractMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorcontractManagement;

