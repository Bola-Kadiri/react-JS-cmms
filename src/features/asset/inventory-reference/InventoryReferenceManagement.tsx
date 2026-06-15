import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pagination } from '@/components/Pagination';
import { useInventoryReferencesQuery, useDeleteInventoryReference } from '@/hooks/inventoryreference/useInventoryReferenceQueries';
import { InventoryReference } from '@/types/inventoryreference';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

export const InventoryReferenceManagement: React.FC = () => {
  const { t } = useTypedTranslation('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: inventoryReferencesData, isLoading, error } = useInventoryReferencesQuery();
  const deleteMutation = useDeleteInventoryReference();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting inventory reference:', error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const filteredData = inventoryReferencesData?.results.filter((item) =>
    item.category_detail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subcategory_detail.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('inventoryRef.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('inventoryRef.error')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('inventoryRef.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('inventoryRef.management')}</h1>
        <p className="text-gray-600">{t('inventoryRef.managementDesc')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{t('inventoryRef.listTitle')}</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('inventoryRef.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button asChild>
                <Link to="/dashboard/asset/inventory-reference/inventory-references/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('inventoryRef.addButton')}
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('inventoryRef.columns.id')}</TableHead>
                  <TableHead>{t('inventoryRef.columns.inventoryType')}</TableHead>
                  <TableHead>{t('inventoryRef.columns.category')}</TableHead>
                  <TableHead>{t('inventoryRef.columns.subcategory')}</TableHead>
                  <TableHead>{t('inventoryRef.columns.model')}</TableHead>
                  <TableHead>{t('inventoryRef.columns.manufacturer')}</TableHead>
                  <TableHead className="text-right">{t('inventoryRef.columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchTerm ? t('inventoryRef.noItemsFiltered') : t('inventoryRef.noItems')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item: InventoryReference) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.inventory_type}</TableCell>
                      <TableCell>{item.category_detail.name}</TableCell>
                      <TableCell>{item.subcategory_detail.name}</TableCell>
                      <TableCell>{item.model_reference}</TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/asset/inventory-reference/inventory-references/view/${item.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('inventoryRef.rowActions.view')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/asset/inventory-reference/inventory-references/edit/${item.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t('inventoryRef.rowActions.edit')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(item.id.toString())}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('inventoryRef.rowActions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredData.length}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common:confirmation.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('inventoryRef.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('inventoryRef.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
