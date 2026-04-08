// src/features/accounts/bankaccounts/BankaccountManagement.tsx
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
import { useBankaccountsQuery, useDeleteBankaccount } from '@/hooks/bankaccount/useBankaccountQueries';
import { Bankaccount } from '@/types/bankaccount';
import { BankaccountQueryParams } from '@/services/bankaccountsApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const BankaccountManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankaccountToDelete, setBankaccountToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {canEdit} = useFeatureAccess('reference')
  
  // Fetch all bankaccounts - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useBankaccountsQuery();

  // Delete bankaccount mutation using our custom hook
  const deleteBankaccountMutation = useDeleteBankaccount();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by bank, account_name, or account_number
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(bankaccount => 
        bankaccount.bank.toLowerCase().includes(searchLower) ||
        bankaccount.account_name.toLowerCase().includes(searchLower) ||
        bankaccount.account_number.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(bankaccount => bankaccount.status === statusFilter);
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
  const totalBankaccounts = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalBankaccounts / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter]);

  // Event handlers
  const handleAddBankaccount = () => {
    navigate('/dashboard/accounts/bank-accounts/create');
  };

  const handleViewBankaccount = (slug: string) => {
    navigate(`/dashboard/accounts/bank-accounts/view/${slug}`);
  };

  const handleEditBankaccount = (slug: string) => {
    navigate(`/dashboard/accounts/bank-accounts/edit/${slug}`);
  };

  const handleDeleteBankaccount = (slug: string) => {
    setBankaccountToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBankaccount = () => {
    if (bankaccountToDelete) {
      deleteBankaccountMutation.mutate(bankaccountToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setBankaccountToDelete(null);
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

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Helper function to get badge styles based on status
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

  // Format currency with symbol
  const formatCurrency = (currency: string) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'NGN': '₦',
      'GBP': '£'
    };
    
    return symbols[currency as keyof typeof symbols] || '';
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading bank accounts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading bank accounts</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Bank Account Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Account Management</h1>
        {/* {canEdit && (
          <Button onClick={handleAddBankaccount} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Add Bank Account
        </Button>
        )} */}
        <PermissionGuard feature='reference' permission='view'>
          <Button onClick={handleAddBankaccount}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Account
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls - Side by side */}
      <div className="mb-6">
        <div className="flex flex-row gap-4">
          <div className="flex-grow">
            <SearchFilter 
              onSearch={handleSearch}
              placeholder="Search by bank, account name, or account number..."
              initialSearchValue={searchValue}
            />
          </div>
          <div className="w-64">
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

      {/* Bank Accounts Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Bank</TableHead>
                <TableHead className="font-medium text-gray-600">Account Name</TableHead>
                <TableHead className="font-medium text-gray-600">Account Number</TableHead>
                <TableHead className="font-medium text-gray-600">Currency</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No bank accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((bankaccount) => (
                  <TableRow key={bankaccount.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {bankaccount.bank}
                    </TableCell>
                    <TableCell>{bankaccount.account_name}</TableCell>
                    <TableCell>{bankaccount.account_number}</TableCell>
                    <TableCell>{formatCurrency(bankaccount.currency)} {bankaccount.currency}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeStyles(bankaccount.status)}>
                        {bankaccount.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='reference' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewBankaccount(String(bankaccount.slug))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditBankaccount(String(bankaccount.slug))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteBankaccount(String(bankaccount.slug))}
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
          {totalBankaccounts > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalBankaccounts}
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
              This action cannot be undone. This will permanently delete the bank account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteBankaccount}
              disabled={deleteBankaccountMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteBankaccountMutation.isPending ? (
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

export default BankaccountManagement;