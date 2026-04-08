// src/features/clients/ClientDetailView.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Client, Contact } from '@/types/client'; 
import { PermissionGuard } from '@/components/PermissionGuard';

// API function to get a client
const getClient = async (slug: string): Promise<Client> => {
  const response = await api.get(`/accounts/api/clients/${slug}/`);
  return response.data;
};

const ClientDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // State for all contacts (combining contacts array and contacts_data)
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  
  // Using TanStack Query v5 syntax
  const { 
    data: client, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['client', slug],
    queryFn: () => getClient(slug as string),
    enabled: !!slug,
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  // Process client data when it changes
  useEffect(() => {
    if (client) {
      // Combine contacts from both sources without duplicates
      // Since contacts_data is now Contact[], we can simply merge and deduplicate
      const contactsFromMain = client.contacts || [];
      const contactsFromData = client.contacts_data || [];
      
      // Combine both arrays
      const combinedContacts = [...contactsFromMain];
      
      // Add contacts from contacts_data that aren't already in contacts
      for (const contactData of contactsFromData) {
        const alreadyExists = combinedContacts.some(contact => 
          (contact.id && contactData.id && contact.id === contactData.id) || 
          (contact.email && contactData.email && contact.email === contactData.email)
        );
        
        if (!alreadyExists) {
          combinedContacts.push(contactData);
        }
      }
      
      setAllContacts(combinedContacts);
    }
  }, [client]);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/accounts/client');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/accounts/client/edit/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading client details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Clients
        </Button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Client not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Client Details</h1>
        </div>
        <PermissionGuard feature='reference' permission='edit'>
        <Button onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit Client
        </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Code</p>
                  <p className="text-lg font-medium">{client.code}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{client.name}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-lg">{client.type}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    client.status === 'Active' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{client.email}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg">{client.phone || 'Not provided'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Group</p>
                  <p className="text-lg">{client.group || 'Not assigned'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-lg whitespace-pre-line">{client.address || 'No address provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client ID</p>
                <p className="text-lg font-medium">{client.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-lg font-medium">{allContacts.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                <p className="text-lg font-medium">
                  {allContacts.filter(contact => contact.status === 'Active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[180px]">First Name</TableHead>
                  <TableHead className="w-[180px]">Last Name</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[150px]">Phone</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                      No contacts available for this client
                    </TableCell>
                  </TableRow>
                ) : (
                  allContacts.map((contact, index) => (
                    <TableRow key={index}>
                      <TableCell>{contact.first_name}</TableCell>
                      <TableCell>{contact.last_name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          contact.status === 'Active' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {contact.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetailView;