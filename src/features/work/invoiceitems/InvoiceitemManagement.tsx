import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  XCircle
} from 'lucide-react';
import { 
  useInvoiceItemsQuery, 
  useDeleteInvoiceItemMutation
} from '@/hooks/invoiceitem/useInvoiceitemQueries';
import { InvoiceItem } from '@/types/invoiceitem';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const InvoiceitemManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [deleteItem, setDeleteItem] = useState<InvoiceItem | null>(null);
  
  const pageSize = 10;

  // Check if user can edit/delete (SUPER ADMIN, ADMIN, REQUESTER)
  const canEdit = user?.role === 'SUPER ADMIN' || user?.role === 'ADMIN' || user?.role === 'REQUESTER';

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all data without server-side filtering
  const { data: rawData, isLoading, error } = useInvoiceItemsQuery();
  const deleteMutation = useDeleteInvoiceItemMutation();

  // Client-side filtering and pagination
  const filteredAndPaginatedData = useMemo(() => {
    if (!rawData?.results) {
      return {
        results: [],
        count: 0,
        totalPages: 0,
        startItem: 0,
        endItem: 0
      };
    }

    let filteredResults = [...rawData.results];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filteredResults = filteredResults.filter((invoiceItem) => {
        const searchableFields = [
          invoiceItem.invoice_number,
          invoiceItem.total_amount,
          invoiceItem.currency,
          invoiceItem.status,
          invoiceItem.notes || '',
          `II-${invoiceItem.id}`,
          invoiceItem.work_order ? `WO-${invoiceItem.work_order}` : '',
          invoiceItem.work_completion ? `WOC-${invoiceItem.work_completion}` : '',
        ];
        
        return searchableFields.some(field => 
          field.toString().toLowerCase().includes(query)
        );
      });
    }

    // Calculate pagination
    const totalCount = filteredResults.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    const startItem = totalCount > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(endIndex, totalCount);

    return {
      results: paginatedResults,
      count: totalCount,
      totalPages,
      startItem,
      endItem
    };
  }, [rawData?.results, debouncedSearchQuery, currentPage, pageSize]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= filteredAndPaginatedData.totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle delete
  const handleDelete = async (invoiceItem: InvoiceItem) => {
    try {
      // Use slug if available, otherwise use id
      const slug = invoiceItem.slug || invoiceItem.id;
      await deleteMutation.mutateAsync(slug);
      setDeleteItem(null);
    } catch (error) {
      console.error('Failed to delete invoice item:', error);
    }
  };

  // Format currency amount
  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load invoice items</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Invoice Items</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track work order invoice items
          </p>
        </div>
        {canEdit && (
          <Button 
            onClick={() => navigate('/dashboard/work/invoice-items/new')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice Item
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoice items..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery !== debouncedSearchQuery && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                )}
                {searchQuery && searchQuery === debouncedSearchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-700">ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Invoice Number</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Total Amount</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Currency</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Invoice Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-700">Due Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-700 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAndPaginatedData.results?.length ? (
              filteredAndPaginatedData.results.map((invoiceItem) => (
                <TableRow key={invoiceItem.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm font-medium text-gray-900">
                    II-{invoiceItem.id}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 font-medium">
                    {invoiceItem.invoice_number}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                      {formatAmount(invoiceItem.total_amount)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <span className="font-medium">{invoiceItem.currency}</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <Badge 
                      variant="outline"
                      className={
                        invoiceItem.status === 'Draft' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                        invoiceItem.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                        invoiceItem.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-300' :
                        invoiceItem.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                        'bg-blue-100 text-blue-700 border-blue-300'
                      }
                    >
                      {invoiceItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {invoiceItem.invoice_date ? formatDate(invoiceItem.invoice_date) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {invoiceItem.due_date ? formatDate(invoiceItem.due_date) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/dashboard/work/invoice-items/${invoiceItem.slug || invoiceItem.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => navigate(`/dashboard/work/invoice-items/${invoiceItem.slug || invoiceItem.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteItem(invoiceItem)}
                              className="text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                  {debouncedSearchQuery ? (
                    <div>
                      <p>No invoice items match your search criteria</p>
                      <p className="text-sm mt-1">
                        Try adjusting your search terms
                      </p>
                    </div>
                  ) : (
                    "No invoice items found"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredAndPaginatedData.count > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {filteredAndPaginatedData.startItem} to {filteredAndPaginatedData.endItem} of {filteredAndPaginatedData.count} results
              {debouncedSearchQuery && rawData?.results && (
                <span className="text-gray-500 ml-1">
                  (filtered from {rawData.results.length} total)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {filteredAndPaginatedData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === filteredAndPaginatedData.totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice item "{deleteItem?.invoice_number}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && handleDelete(deleteItem)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoiceitemManagement; 