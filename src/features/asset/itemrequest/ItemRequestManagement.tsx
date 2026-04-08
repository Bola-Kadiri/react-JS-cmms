import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useItemRequestsQuery, useDeleteItemRequest } from '@/hooks/itemrequest/useItemRequestQueries';
import { useStoresQuery } from '@/hooks/store/useStoreQueries';
import { useFormatters } from '@/utils/formatters';

type SortField = 'name' | 'type' | 'request_from_detail' | 'requested_by_detail' | 'required_date';
type SortDirection = 'asc' | 'desc';

const ItemRequestManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { formatDate } = useFormatters();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemRequestToDelete, setItemRequestToDelete] = useState<string | null>(null);
  
  // Filter, sorting, and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch all item requests
  const { 
    data = { count: 0, results: [] }, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useItemRequestsQuery();

  // Fetch stores for filter dropdown
  const { data: storesData } = useStoresQuery();

  // Delete item request mutation
  const deleteItemRequestMutation = useDeleteItemRequest();

  // Client-side filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(itemRequest => 
        itemRequest.name.toLowerCase().includes(searchLower) ||
        itemRequest.description.toLowerCase().includes(searchLower) ||
        (itemRequest.request_from_detail?.name || '').toLowerCase().includes(searchLower) ||
        (itemRequest.requested_by_detail?.first_name || '').toLowerCase().includes(searchLower) ||
        (itemRequest.requested_by_detail?.last_name || '').toLowerCase().includes(searchLower) ||
        (itemRequest.requested_by_detail?.email || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      results = results.filter(itemRequest => itemRequest.type === typeFilter);
    }
    
    // Store filter
    if (storeFilter !== 'all') {
      results = results.filter(itemRequest => 
        (itemRequest.request_from_detail?.id || itemRequest.request_from) === Number(storeFilter)
      );
    }
    
    // Sorting
    results.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'request_from_detail':
          aValue = a.request_from_detail?.name || `Store ID: ${a.request_from}`;
          bValue = b.request_from_detail?.name || `Store ID: ${b.request_from}`;
          break;
        case 'requested_by_detail':
          aValue = a.requested_by_detail 
            ? `${a.requested_by_detail.first_name} ${a.requested_by_detail.last_name}`
            : `User ID: ${a.requested_by}`;
          bValue = b.requested_by_detail 
            ? `${b.requested_by_detail.first_name} ${b.requested_by_detail.last_name}`
            : `User ID: ${b.requested_by}`;
          break;
        case 'required_date':
          aValue = new Date(a.required_date).getTime();
          bValue = new Date(b.required_date).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortField === 'required_date') {
        return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
      
      const comparison = (aValue as string).localeCompare(bValue as string);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return results;
  }, [data.results, searchValue, typeFilter, storeFilter, sortField, sortDirection]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, page, pageSize]);
  
  // Calculate total pages
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, typeFilter, storeFilter]);

  // Event handlers
  const handleAddItemRequest = () => {
    navigate('/dashboard/asset/item-requests/create');
  };

  const handleViewItemRequest = (id: string) => {
    navigate(`/dashboard/asset/item-requests/view/${id}`);
  };

  const handleEditItemRequest = (id: string) => {
    navigate(`/dashboard/asset/item-requests/edit/${id}`);
  };

  const handleDeleteItemRequest = (id: string) => {
    setItemRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteItemRequest = () => {
    if (itemRequestToDelete) {
      deleteItemRequestMutation.mutate(itemRequestToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setItemRequestToDelete(null);
        }
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Get type badge styling
  const getTypeBadge = (type: string) => {
    return type === 'for_use' 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">For Use</Badge>
      : <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">For Store</Badge>;
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading item requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-lg font-medium">Error loading item requests</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Item Requests</h2>
          <p className="text-muted-foreground">
            Manage item requests and track their status
          </p>
        </div>
        <Button onClick={handleAddItemRequest} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Add Item Request
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-green-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SearchFilter
                placeholder="Search by name, description, store, or requester..."
                initialSearchValue={searchValue}
                onSearch={handleSearch}
              />
            </div>
            
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="for_use">For Use</SelectItem>
                  <SelectItem value="for_store">For Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {storesData?.results?.map((store) => (
                    <SelectItem key={store.id} value={String(store.id)}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Name
                  {renderSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  {renderSortIcon('type')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('request_from_detail')}
              >
                <div className="flex items-center gap-2">
                  Request From
                  {renderSortIcon('request_from_detail')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('requested_by_detail')}
              >
                <div className="flex items-center gap-2">
                  Requested By
                  {renderSortIcon('requested_by_detail')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('required_date')}
              >
                <div className="flex items-center gap-2">
                  Required Date
                  {renderSortIcon('required_date')}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchValue || typeFilter !== 'all' || storeFilter !== 'all' 
                    ? 'No item requests found matching your criteria.' 
                    : 'No item requests available.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((itemRequest) => (
                <TableRow key={itemRequest.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-green-700">{itemRequest.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-48">
                        {itemRequest.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(itemRequest.type)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {itemRequest.request_from_detail?.name || `Store ID: ${itemRequest.request_from}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {itemRequest.request_from_detail?.location || 'No location'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {itemRequest.requested_by_detail 
                          ? `${itemRequest.requested_by_detail.first_name} ${itemRequest.requested_by_detail.last_name}`
                          : `User ID: ${itemRequest.requested_by}`
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {itemRequest.requested_by_detail?.roles || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatDate(itemRequest.required_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewItemRequest(itemRequest.id.toString())}
                        className="hover:bg-green-50 hover:border-green-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItemRequest(itemRequest.id.toString())}
                        className="hover:bg-green-50 hover:border-green-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItemRequest(itemRequest.id.toString())}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
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
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item request and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItemRequest}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteItemRequestMutation.isPending}
            >
              {deleteItemRequestMutation.isPending ? (
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

export default ItemRequestManagement; 