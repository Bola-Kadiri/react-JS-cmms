// src/features/accounts/users/UserManagement.tsx
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
import { useUsersQuery, useDeleteUser } from '@/hooks/user/useUserQueries';
import { User } from '@/types/user';
import { UserQueryParams } from '@/services/usersApi';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

const UserManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [rolesFilter, setRolesFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {canEdit} = useFeatureAccess('reference')
  
  // Fetch all users - we'll filter client-side
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useUsersQuery();

  // Delete user mutation using our custom hook
  const deleteUserMutation = useDeleteUser();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(data.results || [])];
    
    // Search filter - search by first name, last name, and email
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(user => 
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      results = results.filter(user => user.status === statusFilter);
    }
    
    // Gender filter
    if (genderFilter && genderFilter !== 'all') {
      results = results.filter(user => user.gender === genderFilter);
    }
    
    // Roles filter
    if (rolesFilter && rolesFilter !== 'all') {
      results = results.filter(user => user.roles === rolesFilter);
    }
    
    return results;
  }, [data.results, searchValue, statusFilter, genderFilter, rolesFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalUsers = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, genderFilter, rolesFilter]);

  // Event handlers
  const handleAddUser = () => {
    navigate('/dashboard/accounts/users/create');
  };

  const handleViewUser = (slug: string) => {
    navigate(`/dashboard/accounts/users/view/${slug}`);
  };

  const handleEditUser = (slug: string) => {
    navigate(`/dashboard/accounts/users/edit/${slug}`);
  };

  const handleDeleteUser = (slug: string) => {
    setUserToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
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

  // Handle gender filter
  const handleGenderFilterChange = (value: string) => {
    setGenderFilter(value);
  };

  // Handle roles filter
  const handleRolesFilterChange = (value: string) => {
    setRolesFilter(value);
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

  const getRolesBadgeStyles = (role: string) => {
    switch (role) {
      case 'SUPER ADMIN':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case 'Facility Admin':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Facility Procurement':
      case 'Facility Manager':
        return "bg-teal-100 text-teal-800 hover:bg-teal-100";
      case 'Facility Officer':
      case 'Facility Auditor':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Facility Account':
      case 'Facility Store':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'Facility View':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading users</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>User Management</title>
      </Helmet> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {/* {canEdit && (
          <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
        )} */}
        <PermissionGuard feature='reference' permission='view'>
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchFilter 
              onSearch={handleSearch}
              placeholder="Search by name or email..."
              initialSearchValue={searchValue}
            />
          </div>
        {/* </div> */}
        
        <div>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"> */}
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
          
          {/* <Select value={genderFilter} onValueChange={handleGenderFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select> */}
          
          <div>
          <Select value={rolesFilter} onValueChange={handleRolesFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="SUPER ADMIN">Super Admin</SelectItem>
              <SelectItem value="Facility Admin">Facility Admin</SelectItem>
              <SelectItem value="Facility Procurement">Facility Procurement</SelectItem>
              <SelectItem value="Facility Manager">Facility Manager</SelectItem>
              <SelectItem value="Facility Officer">Facility Officer</SelectItem>
              <SelectItem value="Facility Auditor">Facility Auditor</SelectItem>
              <SelectItem value="Facility Account">Facility Account</SelectItem>
              <SelectItem value="Facility Store">Facility Store</SelectItem>
              <SelectItem value="Facility View">Facility View</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">First Name</TableHead>
                <TableHead className="font-medium text-gray-600">Last Name</TableHead>
                <TableHead className="font-medium text-gray-600">Email</TableHead>
                {/* <TableHead className="font-medium text-gray-600">Phone</TableHead> */}
                {/* <TableHead className="font-medium text-gray-600">Gender</TableHead> */}
                <TableHead className="font-medium text-gray-600">Role</TableHead>
                {/* <TableHead className="font-medium text-gray-600">Supervisor</TableHead> */}
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((user) => (
                  <TableRow key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {user.first_name}
                    </TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{user.email}</TableCell>
                    {/* <TableCell>{user.phone}</TableCell> */}
                    {/* <TableCell>{user.gender}</TableCell> */}
                    <TableCell>
                      <Badge variant="outline" className={getRolesBadgeStyles(user.roles)}>
                        {user.roles}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      {user.supervisor_detail ? `${user.supervisor_detail.first_name} ${user.supervisor_detail.last_name}` : '-'}
                    </TableCell> */}
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeStyles(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='reference' permission='view'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewUser(String(user.slug))}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditUser(String(user.slug))}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteUser(String(user.slug))}
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
          {totalUsers > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalUsers}
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
              This action cannot be undone. This will permanently delete the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteUserMutation.isPending ? (
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

export default UserManagement;