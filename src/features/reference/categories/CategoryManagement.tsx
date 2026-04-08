// src/features/accounts/categories/CategoryManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { useCategoriesQuery, useDeleteCategory } from '@/hooks/category/useCategoryQueries';
import { Category } from '@/types/category';
import { CategoryQueryParams } from '@/services/categoriesApi';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const CategoryManagement = () => {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
 
 // Filter and pagination state
 const [searchValue, setSearchValue] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [workRequestFilter, setWorkRequestFilter] = useState('');
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);

 const {canEdit} = useFeatureAccess('reference')
 
 // Fetch all categories - we'll filter client-side
 const { 
   data = { count: 0, results: [] }, 
   isFetching, 
   isError, 
   refetch 
 } = useCategoriesQuery();

 // Delete category mutation using our custom hook
 const deleteCategoryMutation = useDeleteCategory();

 // Client-side filtering logic
 const filteredData = useMemo(() => {
   let results = [...(data.results || [])];
   
   // Search filter
   if (searchValue) {
     const searchLower = searchValue.toLowerCase();
     results = results.filter(category => 
       category.code.toLowerCase().includes(searchLower) ||
       category.title.toLowerCase().includes(searchLower) ||
       category.problem_type.toLowerCase().includes(searchLower)
     );
   }
   
   // Status filter
   if (statusFilter) {
     results = results.filter(category => category.status === statusFilter);
   }

   // Work Request filter
   if (workRequestFilter) {
    results = results.filter(category => category.work_request_approved === workRequestFilter);
  }
   
   return results;
 }, [data.results, searchValue, statusFilter, workRequestFilter]);
 
 // Client-side pagination
 const paginatedData = useMemo(() => {
   const startIndex = (page - 1) * pageSize;
   const endIndex = startIndex + pageSize;
   return filteredData.slice(startIndex, endIndex);
 }, [filteredData, page, pageSize]);
 
 // Calculate total pages
 const totalItems = filteredData.length;
 const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
 
 // Reset to page 1 when filters change
 useEffect(() => {
   setPage(1);
 }, [searchValue, statusFilter]);

 // Event handlers
 const handleAddCategory = () => {
   navigate('/dashboard/accounts/categories/create');
 };

 const handleViewCategory = (id: string) => {
   navigate(`/dashboard/accounts/categories/view/${id}`);
 };

 const handleEditCategory = (id: string) => {
   navigate(`/dashboard/accounts/categories/edit/${id}`);
 };

 const handleDeleteCategory = (id: string) => {
   setCategoryToDelete(id);
   setDeleteDialogOpen(true);
 };

 const confirmDeleteCategory = () => {
   if (categoryToDelete) {
     deleteCategoryMutation.mutate(categoryToDelete, {
       onSuccess: () => {
         setDeleteDialogOpen(false);
         setCategoryToDelete(null);
       }
     });
   }
 };

 // Handle search
 const handleSearch = (value: string) => {
   setSearchValue(value);
 };

 // Handle filter
 const handleFilter = (key: string, value: string) => {
  if (key === 'status') {
    setStatusFilter(value);
  } 
  else if (key === 'work_request_approved') {
    setWorkRequestFilter(value);
  }
};

 // Handle pagination
 const handlePageChange = (newPage: number) => {
   setPage(newPage);
 };

 const handlePageSizeChange = (newPageSize: number) => {
   setPageSize(newPageSize);
   setPage(1); // Reset to first page when changing page size
 };

 // Loading state
 if (isFetching) {
   return (
     <div className="flex justify-center items-center h-64">
       <div className="flex flex-col items-center gap-2">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="text-sm text-muted-foreground">Loading categories...</p>
       </div>
     </div>
   );
 }

 // Error state
 if (isError) {
   return (
     <div className="flex flex-col items-center justify-center h-64 gap-4">
       <div className="text-red-500 text-xl">Error loading categories</div>
       <Button onClick={() => refetch()} variant="outline">
         Try Again
       </Button>
     </div>
   );
 }

 // Define filter configuration
 const filterConfig = [
   {
     key: 'status',
     label: 'Status',
     options: [
       { value: 'Active', label: 'Active' },
       { value: 'Inactive', label: 'Inactive' }
     ]
   },
   {
    key: 'work_request_approved',
    label: 'Work Request',
    options: [
      { value: 'Create work order', label: 'Create work order' },
      { value: 'Close work request', label: 'Close work request' }
    ]
  },
 ];

 return (
   <div className="py-8">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Category Management</h1>
       {/* {canEdit && (
        <Button onClick={handleAddCategory}>
         <Plus className="mr-2 h-4 w-4" /> Add Category
       </Button>
       )} */}
         <PermissionGuard feature='reference' permission='view'>
                 <Button onClick={handleAddCategory}>
                   <Plus className="mr-2 h-4 w-4" />
                   Add Category
                 </Button>
               </PermissionGuard>
     </div>

     {/* Search and Filter Controls */}
     <div className="mb-6">
       <SearchFilter 
         onSearch={handleSearch}
         filters={filterConfig}
         onFilter={handleFilter}
         placeholder="Search categories..."
         initialSearchValue={searchValue}
       />
     </div>

     {/* Buildings Table */}
     <Card className="w-full shadow-sm">
       <div className="bg-white rounded-lg overflow-hidden">
         <Table>
           <TableHeader>
             <TableRow className="bg-gray-50">
               <TableHead className="font-medium text-gray-600">Code</TableHead>
               <TableHead className="font-medium text-gray-600">Title</TableHead>
               <TableHead className="font-medium text-gray-600">Work Request Approved</TableHead>
               <TableHead className="font-medium text-gray-600">Status</TableHead>
               <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {paginatedData.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="h-24 text-center">
                   No categories found.
                 </TableCell>
               </TableRow>
             ) : (
               paginatedData.map((category) => (
                 <TableRow key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                   <TableCell className="font-bold">{category.code}</TableCell>
                   {/* <TableCell>{category.name}</TableCell> */}
                   <TableCell>{category.title}</TableCell>
                   <TableCell className="font-semibold">{category.work_request_approved}</TableCell>
                   <TableCell>
                     <span className={`px-3 py-1 rounded-full text-xs ${
                       category.status === 'Active' 
                         ? 'bg-green-100 text-green-800 font-semibold' 
                          : 'bg-red-100 text-red-800 font-semibold'
                     }`}>
                       {category.status}
                     </span>
                   </TableCell>
                   <TableCell className="text-right">
                     <div className="flex justify-end">
                      <PermissionGuard feature='reference' permission='view'>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleViewCategory(String(category.id))}
                         className="h-8 w-8"
                       >
                         <Eye className="h-4 w-4" />
                       </Button>
                       </PermissionGuard>
                       <PermissionGuard feature='reference' permission='edit'>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleEditCategory(String(category.id))}
                         className="h-8 w-8"
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                       </PermissionGuard>
                       <PermissionGuard feature='reference' permission='edit'>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDeleteCategory(String(category.id))}
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

     {/* Delete Confirmation Dialog */}
     <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
       <AlertDialogContent>
         <AlertDialogHeader>
           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
           <AlertDialogDescription>
             This action cannot be undone. This will permanently delete the category.
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
           <AlertDialogCancel>Cancel</AlertDialogCancel>
           <AlertDialogAction 
             onClick={confirmDeleteCategory}
             disabled={deleteCategoryMutation.isPending}
             className="bg-red-500 hover:bg-red-600"
           >
             {deleteCategoryMutation.isPending ? (
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

export default CategoryManagement;