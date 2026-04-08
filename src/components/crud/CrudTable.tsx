import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Spinner } from '../Spinner';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any) => React.ReactNode;
}

interface CrudTableProps<T, K extends keyof T = keyof T> {
  columns: Column<T>[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (id: T[K]) => void;
  onView?: (item: T) => void;
  idKey: K;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  deletingIds?: string[];
}

export function CrudTable<T, K extends keyof T & string>({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  idKey,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  deletingIds = [],
}: CrudTableProps<T, K>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToDeleteObject, setItemToDeleteObject] = useState<T | null>(null);

  // Avoid passing complex objects to state - store ID as a plain string
  const confirmDelete = (item: T) => {
    try {
      const id = item[idKey];
      if (id === undefined || id === null) {
        console.error("Cannot delete item with undefined ID:", item);
        return;
      }
      
      // Store both the ID string and the whole object
      setItemToDelete(String(id));
      setItemToDeleteObject(item);
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error("Error preparing item for deletion:", error);
    }
  };

  const handleDelete = () => {
    if (itemToDelete && itemToDeleteObject) {
      try {
        // Pass the original object's ID property
        onDelete(itemToDeleteObject[idKey]);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setItemToDeleteObject(null);
      } catch (error) {
        console.error("Error during deletion:", error);
      }
    }
  };

  // Direct action handlers to avoid any conversion issues
  const handleEdit = (item: T) => {
    try {
      console.log("Editing item:", item);
      onEdit(item);
    } catch (error) {
      console.error("Error during edit action:", error);
    }
  };

  const handleView = (item: T) => {
    try {
      if (onView) {
        console.log("Viewing item:", item);
        onView(item);
      }
    } catch (error) {
      console.error("Error during view action:", error);
    }
  };

  // Check if a specific item is being deleted - use string comparison
  const isItemDeleting = (id: any): boolean => {
    try {
      return deletingIds.includes(String(id));
    } catch (error) {
      console.error("Error checking if item is being deleted:", error, id);
      return false;
    }
  };

  // Safely render any value
  const safeRender = (value: any): string => {
    if (value === undefined || value === null) {
      return '';
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Complex Object]';
      }
    }
    
    return String(value);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + 1} 
                  className="text-center h-32"
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <Spinner text="Loading..." />
                    </div>
                  ) : (
                    "No items found"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`${rowIndex}-${colIndex}`}>
                      {column.render
                        ? column.render(item[column.accessor])
                        : safeRender(item[column.accessor])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem 
                            onClick={() => handleView(item)}
                            disabled={isItemDeleting(item[idKey])}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleEdit(item)}
                          disabled={isItemDeleting(item[idKey])}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => confirmDelete(item)}
                          disabled={isItemDeleting(item[idKey])}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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

      {totalPages > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={isLoading ? undefined : () => onPageChange(currentPage - 1)}
                className={`${currentPage === 1 || isLoading ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={isLoading ? undefined : () => onPageChange(page)}
                  isActive={currentPage === page}
                  className={isLoading ? "cursor-not-allowed opacity-50" : ""}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={isLoading ? undefined : () => onPageChange(currentPage + 1)}
                className={`${currentPage === totalPages || isLoading ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!isLoading || !open) {
          setDeleteDialogOpen(open);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading && itemToDelete && isItemDeleting(itemToDelete)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading && itemToDelete && isItemDeleting(itemToDelete)}
            >
              {isLoading && itemToDelete && isItemDeleting(itemToDelete) ? 
                <Spinner text="Deleting..." /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}