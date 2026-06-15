// src/features/asset/paymentrequisitions/PaymentrequisitionManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { usePaymentrequisitionsQuery, useDeletePaymentrequisition } from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { useAuth } from '@/contexts/AuthContext';

const PaymentrequisitionManagement = () => {
  const { t } = useTypedTranslation('work');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentrequisitionToDelete, setPaymentrequisitionToDelete] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { canEdit } = useFeatureAccess('requisition');

  const {
    data = { count: 0, results: [] },
    isFetching,
    isError,
    refetch
  } = usePaymentrequisitionsQuery();

  const deletePaymentrequisitionMutation = useDeletePaymentrequisition();

  // Role-based user isolation — mirrors WCC pattern
  const userIsolatedResults = useMemo(() => {
    if (!data?.results) return [];
    if (!user) return data.results;
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper === 'SUPER ADMIN' || roleUpper === 'ADMIN') return data.results;
    const userId = Number(user.id);
    return data.results.filter((pr) => {
      switch (roleUpper) {
        case 'REQUESTER':  return pr.owner === userId;
        case 'REVIEWER':   return pr.request_to?.includes(userId);
        case 'APPROVER':   return pr.request_to?.includes(userId);
        default:           return true;
      }
    });
  }, [data.results, user]);

  const filteredData = useMemo(() => {
    let results = [...userIsolatedResults];

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(pr =>
        (pr.remark && pr.remark.toLowerCase().includes(searchLower)) ||
        (pr.comment && pr.comment.toLowerCase().includes(searchLower)) ||
        pr.expected_payment_amount.toString().includes(searchLower)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(pr => pr.status === statusFilter);
    }

    if (approvalStatusFilter && approvalStatusFilter !== 'all') {
      results = results.filter(pr => pr.approval_status === approvalStatusFilter);
    }

    return results;
  }, [userIsolatedResults, searchValue, statusFilter, approvalStatusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPaymentrequisitions = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalPaymentrequisitions / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, approvalStatusFilter]);

  const handleAddPaymentrequisition = () => navigate('/dashboard/work/payment-requisitions/create');
  const handleViewPaymentrequisition = (id: string) => navigate(`/dashboard/work/payment-requisitions/view/${id}`);
  const handleEditPaymentrequisition = (id: string) => navigate(`/dashboard/work/payment-requisitions/edit/${id}`);

  const handleDeletePaymentrequisition = (id: string) => {
    setPaymentrequisitionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePaymentrequisition = () => {
    if (paymentrequisitionToDelete) {
      deletePaymentrequisitionMutation.mutate(paymentrequisitionToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPaymentrequisitionToDelete(null);
        }
      });
    }
  };

  const handleSearch = (value: string) => setSearchValue(value);
  const handleStatusFilterChange = (value: string) => setStatusFilter(value);
  const handleApprovalStatusFilterChange = (value: string) => setApprovalStatusFilter(value);
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newPageSize: number) => { setPageSize(newPageSize); setPage(1); };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(numAmount);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':   return t('paymentRequisition.statusLabels.active');
      case 'Inactive': return t('paymentRequisition.statusLabels.inactive');
      default:         return status;
    }
  };

  const getApprovalStatusLabel = (status: string) => {
    switch (status) {
      case 'request': return t('paymentRequisition.approvalStatusLabels.request');
      case 'approve': return t('paymentRequisition.approvalStatusLabels.approve');
      default:        return status;
    }
  };

  const getApprovalStatusBadgeStyles = (status: string) => {
    if (status === 'approve')  return 'bg-green-100 text-green-800 hover:bg-green-100';
    if (status === 'request')  return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    return '';
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('paymentRequisition.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('paymentRequisition.error')}</div>
        <Button onClick={() => refetch()} variant="outline">
          {t('common:actions.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('paymentRequisition.management')}</h1>
        {canEdit && (
          <Button onClick={handleAddPaymentrequisition}>
            <Plus className="mr-2 h-4 w-4" /> {t('paymentRequisition.add')}
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchFilter
            onSearch={handleSearch}
            placeholder={t('paymentRequisition.searchPlaceholder')}
            initialSearchValue={searchValue}
          />
        </div>

        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('common:filter.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filter.allStatuses')}</SelectItem>
              <SelectItem value="Active">{t('paymentRequisition.statusOptions.active')}</SelectItem>
              <SelectItem value="Inactive">{t('paymentRequisition.statusOptions.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-64">
          <Select value={approvalStatusFilter} onValueChange={handleApprovalStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('common:filter.filterByApproval')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common:filter.allApprovalStatuses')}</SelectItem>
              <SelectItem value="request">{t('paymentRequisition.approvalStatusLabels.request')}</SelectItem>
              <SelectItem value="approve">{t('paymentRequisition.approvalStatusLabels.approve')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">{t('paymentRequisition.columns.payTo')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('paymentRequisition.columns.expectedAmount')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('paymentRequisition.columns.expectedPaymentDate')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('paymentRequisition.columns.status')}</TableHead>
                <TableHead className="font-medium text-gray-600">{t('paymentRequisition.columns.approvalStatus')}</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">{t('paymentRequisition.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t('paymentRequisition.noItems')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((pr) => (
                  <TableRow key={pr.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-semibold">
                      {pr.pay_to_detail?.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(pr.expected_payment_amount)}
                    </TableCell>
                    <TableCell>
                      {formatDate(pr.expected_payment_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        pr.status === 'Active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      }>
                        {getStatusLabel(pr.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getApprovalStatusBadgeStyles(pr.approval_status)}>
                        {getApprovalStatusLabel(pr.approval_status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='requisition' permission='view'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPaymentrequisition(String(pr.id))}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='requisition' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPaymentrequisition(String(pr.id))}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='requisition' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePaymentrequisition(String(pr.id))}
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

          {totalPaymentrequisitions > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPaymentrequisitions}
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
            <AlertDialogTitle>{t('common:confirmation.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('paymentRequisition.deleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePaymentrequisition}
              disabled={deletePaymentrequisitionMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePaymentrequisitionMutation.isPending ? (
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

export default PaymentrequisitionManagement;
