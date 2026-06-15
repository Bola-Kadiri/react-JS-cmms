// src/features/accounts/vendors/VendorManagement.tsx
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
import { useVendorsQuery, useDeleteVendor } from '@/hooks/vendor/useVendorQueries';
import { Vendor } from '@/types/vendor';
import { VendorQueryParams } from '@/services/vendorsApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const VendorManagement = () => {
  const { t } = useTypedTranslation('accounts');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { canEdit } = useFeatureAccess('reference')

  const {
    data = { count: 0, results: [] },
    isFetching,
    isError,
    refetch
  } = useVendorsQuery();

  const deleteVendorMutation = useDeleteVendor();

  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(vendor =>
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.email.toLowerCase().includes(searchLower) ||
        vendor.bank.toLowerCase().includes(searchLower) ||
        vendor.account_name.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(vendor => vendor.status === statusFilter);
    }

    if (typeFilter && typeFilter !== 'all') {
      results = results.filter(vendor => vendor.type === typeFilter);
    }

    return results;
  }, [data.results, searchValue, statusFilter, typeFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);

  const totalVendors = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalVendors / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, typeFilter]);

  const handleAddVendor = () => navigate('/dashboard/accounts/vendors/create');
  const handleViewVendor = (slug: string) => navigate(`/dashboard/accounts/vendors/view/${slug}`);
  const handleEditVendor = (slug: string) => navigate(`/dashboard/accounts/vendors/edit/${slug}`);

  const handleDeleteVendor = (slug: string) => {
    setVendorToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVendor = () => {
    if (vendorToDelete) {
      deleteVendorMutation.mutate(vendorToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setVendorToDelete(null);
        }
      });
    }
  };

  const handleSearch = (value: string) => setSearchValue(value);
  const handleStatusFilterChange = (value: string) => setStatusFilter(value);
  const handleTypeFilterChange = (value: string) => setTypeFilter(value);
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newPageSize: number) => { setPageSize(newPageSize); setPage(1); };

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'Corporate': return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Individual': return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Active': return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Inactive': return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('vendor.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('vendor.error')}</div>
        <Button onClick={() => refetch()} variant="outline">
          {t('common:actions.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('vendor.management')}</h1>
        <PermissionGuard feature='reference' permission='view'>
          <Button onClick={handleAddVendor}>
            <Plus className="mr-2 h-4 w-4" />
            {t('vendor.add')}
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchFilter
              onSearch={handleSearch}
              placeholder={t('vendor.searchPlaceholder')}
              initialSearchValue={searchValue}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('vendor.filters.byStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('vendor.filters.allStatuses')}</SelectItem>
              <SelectItem value="Active">{t('vendor.status.active')}</SelectItem>
              <SelectItem value="Inactive">{t('vendor.status.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('vendor.filters.byType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('vendor.filters.allTypes')}</SelectItem>
              <SelectItem value="Company">{t('vendor.types.company')}</SelectItem>
              <SelectItem value="Individual">{t('vendor.types.individual')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendors Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">{t('vendor.columns.name')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('vendor.columns.email')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('vendor.columns.bank')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('vendor.columns.accountName')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('vendor.columns.type')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('vendor.columns.status')}</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">{t('vendor.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {t('vendor.noItems')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((vendor) => (
                  <TableRow key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {vendor.name}
                    </TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.bank}</TableCell>
                    <TableCell>{vendor.account_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeBadgeStyles(vendor.type)}>
                        {vendor.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeStyles(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='reference' permission='view'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewVendor(String(vendor.slug))}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditVendor(String(vendor.slug))}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVendor(String(vendor.slug))}
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

          {totalVendors > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalVendors}
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
            <AlertDialogTitle>{t('common:confirmation.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('vendor.deleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVendor}
              disabled={deleteVendorMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteVendorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common:status.deleting')}
                </>
              ) : (
                t('common:actions.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorManagement;
