// src/pages/reference/clients/ClientManagement.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/apiClient';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/PermissionGuard';

// Types
interface Contact {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

interface Client {
  id: number;
  slug: string;
  type: 'Individual' | 'Company';
  code: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  address: string;
  status: 'Active' | 'Inactive';
  contacts: Contact[];
  contacts_data: string;
}

// API functions
const fetchClients = async (): Promise<Client[]> => {
  const response = await api.get('/accounts/api/clients/');
  return response.data;
};

const deleteClient = async (slug: string): Promise<void> => {
  await api.delete(`/accounts/api/clients/${slug}/`);
};

const ClientManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const { canEdit } = useFeatureAccess('reference')

  // Fetch clients
  const { data: clients = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully', {
        duration: 3000,
        icon: <Check className="h-4 w-4 text-green-500" />,
      });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete client', {
        duration: 5000,
        icon: <X className="h-4 w-4 text-red-500" />,
      });
      console.error('Delete client error:', error);
      setDeleteDialogOpen(false);
    },
  });

  // Event handlers
  const handleAddClient = () => {
    navigate('/dashboard/accounts/client/create');
  };

  const handleViewClient = (slug: string) => {
    navigate(`/dashboard/accounts/client/view/${slug}`);
  };

  const handleEditClient = (slug: string) => {
    navigate(`/dashboard/accounts/client/edit/${slug}`);
  };

  const handleDeleteClient = (slug: string) => {
    setClientToDelete(slug);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading clients</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* <Helmet>
        <title>Client Management | Admin Dashboard</title>
      </Helmet> */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Management</h1>
        {/* {canEdit && (
          <Button onClick={handleAddClient}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
        )} */}
        <PermissionGuard feature='reference' permission='view'>
          <Button onClick={handleAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </PermissionGuard>
      </div>

      {/* Client Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">Code</TableHead>
                <TableHead className="font-medium text-gray-600">Name</TableHead>
                <TableHead className="font-medium text-gray-600">Email</TableHead>
                <TableHead className="font-medium text-gray-600">Phone</TableHead>
                <TableHead className="font-medium text-gray-600">Status</TableHead>
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No clients found. Click "Add Client" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium text-green-600">{client.code}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs ${client.status === 'Active'
                          ? 'bg-green-100 text-green-800 font-semibold'
                          : 'bg-red-100 text-red-800 font-semibold'
                        }`}>
                        {client.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <PermissionGuard feature='reference' permission='view'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewClient(client.slug)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClient(client.slug)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard feature='reference' permission='edit'>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClient(client.slug)}
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
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client and all associated contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              disabled={deleteClientMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteClientMutation.isPending ? (
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

export default ClientManagement;