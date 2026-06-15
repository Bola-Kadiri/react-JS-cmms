import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useModels, useDeleteModel } from '@/hooks/model/useModelQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useManufacturers } from '@/hooks/manufacturer/useManufacturerQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { Model } from '@/types/model';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Filter
} from 'lucide-react';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

type SortField = 'code' | 'name' | 'subcategory' | 'manufacturer';
type SortOrder = 'asc' | 'desc';

interface SortState {
  field: SortField | null;
  order: SortOrder;
}

interface FilterState {
  subcategory: string;
  manufacturer: string;
}

export const ModelManagement: React.FC = () => {
  const { t } = useTypedTranslation('assets');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<SortState>({ field: null, order: 'asc' });
  const [filters, setFilters] = useState<FilterState>({ subcategory: '', manufacturer: '' });
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const deleteModel = useDeleteModel();

  const { data: response, isLoading, error } = useModels();
  const { data: subcategoriesResponse } = useAssetSubcategoriesQuery();
  const { data: manufacturersResponse } = useManufacturers();

  const subcategories = subcategoriesResponse?.results || [];
  const manufacturers = manufacturersResponse?.results || [];

  const getSubcategoryName = (subcategoryId: number) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory?.name || 'Unknown';
  };

  const getManufacturerName = (manufacturerId: number) => {
    const manufacturer = manufacturers.find(m => m.id === manufacturerId);
    return manufacturer?.name || 'Unknown';
  };

  const filteredAndSortedModels = useMemo(() => {
    if (!response?.results) return [];

    let filtered = response.results;

    if (debouncedSearchTerm) {
      filtered = filtered.filter((model) =>
        model.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        model.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (filters.subcategory) {
      filtered = filtered.filter((model) =>
        model.subcategory.toString() === filters.subcategory
      );
    }

    if (filters.manufacturer) {
      filtered = filtered.filter((model) =>
        model.manufacturer.toString() === filters.manufacturer
      );
    }

    if (sort.field) {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sort.field) {
          case 'code':
            aValue = a.code;
            bValue = b.code;
            break;
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'subcategory':
            aValue = getSubcategoryName(a.subcategory);
            bValue = getSubcategoryName(b.subcategory);
            break;
          case 'manufacturer':
            aValue = getManufacturerName(a.manufacturer);
            bValue = getManufacturerName(b.manufacturer);
            break;
          default:
            return 0;
        }

        if (sort.order === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [response?.results, debouncedSearchTerm, filters, sort, subcategories, manufacturers]);

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sort.order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleDelete = async (model: Model) => {
    try {
      await deleteModel.mutateAsync(model.id.toString());
      setModelToDelete(null);
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ subcategory: '', manufacturer: '' });
    setSearchTerm('');
    setSort({ field: null, order: 'asc' });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading models. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('model.management')}</h1>
        <Button onClick={() => navigate('/dashboard/asset/inventory-reference/models/create')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('model.addButton')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {t('model.searchTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('model.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            {/* Subcategory Filter */}
            <Select
              value={filters.subcategory}
              onValueChange={(value) => handleFilterChange('subcategory', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('model.filterBySubcategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('model.allSubcategories')}</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Manufacturer Filter */}
            <Select
              value={filters.manufacturer}
              onValueChange={(value) => handleFilterChange('manufacturer', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('model.filterByManufacturer')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('model.allManufacturers')}</SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!searchTerm && !filters.subcategory && !filters.manufacturer && !sort.field}
            >
              {t('model.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('model.columns.id')}</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('code')}
                    className="h-auto p-0 font-semibold"
                  >
                    {t('model.columns.code')}
                    {getSortIcon('code')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-semibold"
                  >
                    {t('model.columns.name')}
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('subcategory')}
                    className="h-auto p-0 font-semibold"
                  >
                    {t('model.columns.subcategory')}
                    {getSortIcon('subcategory')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('manufacturer')}
                    className="h-auto p-0 font-semibold"
                  >
                    {t('model.columns.manufacturer')}
                    {getSortIcon('manufacturer')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">{t('model.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">{t('model.loading')}</p>
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">{t('model.noItems')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>{model.id}</TableCell>
                    <TableCell className="font-medium">{model.code}</TableCell>
                    <TableCell>{model.name}</TableCell>
                    <TableCell>{getSubcategoryName(model.subcategory)}</TableCell>
                    <TableCell>{getManufacturerName(model.manufacturer)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/asset/inventory-reference/models/${model.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/asset/inventory-reference/models/${model.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModelToDelete(model)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('model.delete.description', { name: model.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(model)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {t('model.delete.confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Display total count */}
      {response && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">
              Showing {filteredAndSortedModels.length} of {response.count} models
              {(debouncedSearchTerm || filters.subcategory || filters.manufacturer) && ' (filtered)'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
