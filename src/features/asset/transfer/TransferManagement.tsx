// src/features/facility/transfers/TransferManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useTransfersQuery, useDeleteTransfer } from '@/hooks/transfer/useTransferQueries';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';
import { format, parseISO } from 'date-fns';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const TransferManagement = () => {
  const { t } = useTypedTranslation('assets');
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { canEdit } = useFeatureAccess('transfer_form');

  const {
    data = { count: 0, results: [] },
    isFetching,
    isError,
    refetch
  } = useTransfersQuery();

  const deleteTransferMutation = useDeleteTransfer();

  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(transfer =>
        transfer.request_from_detail?.name.toLowerCase().includes(searchLower) ||
        transfer.transfer_to_detail?.name.toLowerCase().includes(searchLower) ||
        `${transfer.requested_by_detail?.first_name} ${transfer.requested_by_detail?.last_name}`.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter) {
      results = results.filter(transfer => transfer.type === typeFilter);
    }

    return results;
  }, [data.results, searchValue, typeFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchValue, typeFilter]);

  const formatDate = (dateString: string) => {
    if (!dateString) return t('transfer.notSet');
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const handleAddTransfer = () => {
    navigate('/dashboard/asset/transfers/create');
  };

  const handleViewTransfer = (id: string) => {
    navigate(`/dashboard/asset/transfers/view/${id}`);
  };

  const handleEditTransfer = (id: string) => {
    navigate(`/dashboard/asset/transfers/edit/${id}`);
  };

  const handleDeleteTransfer = (id: string) => {
    setTransferToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTransfer = () => {
    if (transferToDelete) {
      deleteTransferMutation.mutate(transferToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTransferToDelete(null);
        }
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleFilter = (key: string, value: string) => {
    if (key === 'type') {
      setTypeFilter(value);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const filterConfig = [
    {
      key: 'type',
      label: t('transfer.filterType'),
      options: [
        { value: 'transfer', label: t('transfer.filterOptions.transfer') },
        { value: 'return', label: t('transfer.filterOptions.return') },
      ]
    }
  ];

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('transfer.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('transfer.error')}</div>
        <Button onClick={() => refetch()} variant="outline">
          {t('transfer.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('transfer.management')}</h1>
        {canEdit && (
          <Button onClick={handleAddTransfer}>
            <Plus className="mr-2 h-4 w-4" /> {t('transfer.addButton')}
          </Button>
        )}
      </div>

      <div className="mb-6">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterConfig}
          placeholder={t('transfer.searchPlaceholder')}
          initialSearchValue={searchValue}
        />
      </div>

      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">{t('transfer.columns.type')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('transfer.columns.requestFrom')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('transfer.columns.requestedBy')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('transfer.columns.transferTo')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('transfer.columns.requiredDate')}</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">{t('transfer.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t('transfer.noItems')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((transfer) => (
                  <TableRow key={transfer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-semibold">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        transfer.type === 'transfer'
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : transfer.type === 'return'
                          ? 'bg-green-100 text-green-800 font-bold'
                          : 'bg-gray-100 text-gray-800 font-bold'
                      }`}>
                        {transfer.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{transfer.request_from_detail?.name || t('common:na')}</span>
                        <span className="text-sm text-gray-500">{transfer.request_from_detail?.location || ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transfer.requested_by_detail?.first_name} {transfer.requested_by_detail?.last_name}
                        </span>
                        <span className="text-sm text-gray-500">{transfer.requested_by_detail?.roles}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{transfer.transfer_to_detail?.name || t('common:na')}</span>
                        <span className="text-sm text-gray-500">{transfer.transfer_to_detail?.location || ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatDate(transfer.required_date)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='transfer_form' permission='view'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewTransfer(String(transfer.id))}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='transfer_form' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTransfer(String(transfer.id))}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='transfer_form' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransfer(String(transfer.id))}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('transfer.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('transfer.delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('transfer.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTransfer}
              disabled={deleteTransferMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteTransferMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('transfer.delete.deleting')}
                </>
              ) : (
                t('transfer.delete.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransferManagement;
