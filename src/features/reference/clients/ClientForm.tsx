// src/features/clients/ClientForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/apiClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Edit, X, Check, Loader2 } from 'lucide-react';
import { Client, Contact } from '@/types/client'; // Import from types file
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

// API functions
const getClient = async (slug: string): Promise<Client> => {
  const response = await api.get(`/accounts/api/clients/${slug}/`);
  return response.data;
};

const createClient = async (client: Omit<Client, 'id' | 'slug'>): Promise<Client> => {
  const response = await api.post('/accounts/api/clients/', client);
  return response.data;
};

const updateClient = async ({ slug, client }: { slug: string; client: Partial<Client> }): Promise<Client> => {
  const response = await api.put(`/accounts/api/clients/${slug}/`, client);
  return response.data;
};

const ClientForm = () => {
  const { t } = useTypedTranslation('accounts');
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!slug;

  // Schemas defined inside component so validation messages can use t()
  const contactSchema = z.object({
    id: z.number().optional(),
    first_name: z.string().min(1, t('client.form.validation.contactFirstNameRequired')),
    last_name: z.string().min(1, t('client.form.validation.contactLastNameRequired')),
    email: z.string().email(t('client.form.validation.contactInvalidEmail')),
    phone: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).default('Active'),
  });

  const clientSchema = z.object({
    type: z.enum(['Individual', 'Company']),
    code: z.string().min(1, t('client.form.validation.codeRequired')),
    name: z.string().min(1, t('client.form.validation.nameRequired')),
    email: z.string().email(t('client.form.validation.invalidEmail')),
    phone: z.string().optional(),
    group: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).default('Active'),
  });

  type ClientFormValues = z.infer<typeof clientSchema>;
  type ContactFormValues = z.infer<typeof contactSchema>;

  // Form state for contacts
  const [contacts, setContacts] = useState<ContactFormValues[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactBeingEdited, setContactBeingEdited] = useState<number | null>(null);

  // Client form setup
  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: 'Individual',
      code: '',
      name: '',
      email: '',
      phone: '',
      group: '',
      address: '',
      status: 'Active',
    }
  });

  // Contact form setup
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      status: 'Active',
    },
  });

  // Fetch client data for edit mode - using TanStack Query v5 syntax
  const {
    data: clientData,
    isLoading: isLoadingClient,
    isError: isClientError,
    error: clientError
  } = useQuery({
    queryKey: ['client', slug],
    queryFn: () => getClient(slug as string),
    enabled: isEditMode
  });

  // Handle client data loading
  useEffect(() => {
    if (clientData && isEditMode) {
      // Reset the form with client data
      clientForm.reset({
        type: clientData.type,
        code: clientData.code,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone || '',
        group: clientData.group || '',
        address: clientData.address || '',
        status: clientData.status,
      }, { keepDefaultValues: false });

      // Combine contacts from both sources
      const contactsFromMain = clientData.contacts || [];
      const contactsFromData = clientData.contacts_data || [];

      // Combine both arrays
      const allContacts = [...contactsFromMain];

      // Add contacts from contacts_data that aren't already in contacts
      for (const contactData of contactsFromData) {
        const alreadyExists = allContacts.some(contact =>
          (contact.id && contactData.id && contact.id === contactData.id) ||
          (contact.email && contactData.email && contact.email === contactData.email)
        );

        if (!alreadyExists) {
          allContacts.push(contactData);
        }
      }

      setContacts(allContacts);

      // Log the loaded data for debugging
      console.log('Client data loaded:', clientData);
      console.log('Form values after reset:', clientForm.getValues());
    }
  }, [clientData, isEditMode, clientForm]);

  // Handle error with useEffect
  useEffect(() => {
    if (isClientError && clientError) {
      toast.error(t('client.form.toast.loadError'), {
        duration: 5000,
        icon: <X className="h-4 w-4 text-red-500" />,
      });
      console.error('Get client error:', clientError);
    }
  }, [isClientError, clientError]);

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(t('client.form.toast.createSuccess'), {
        duration: 3000,
        icon: <Check className="h-4 w-4 text-green-500" />,
      });
      navigate('/dashboard/accounts/client'); // Navigate back to the client list
    },
    onError: (error) => {
      toast.error(t('client.form.toast.createError'), {
        duration: 5000,
        icon: <X className="h-4 w-4 text-red-500" />,
      });
      console.error('Create client error:', error);
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', slug] });
      toast.success(t('client.form.toast.updateSuccess'), {
        duration: 3000,
        icon: <Check className="h-4 w-4 text-green-500" />,
      });
      navigate('/dashboard/accounts/client'); // Navigate back to the client list
    },
    onError: (error) => {
      toast.error(t('client.form.toast.updateError'), {
        duration: 5000,
        icon: <X className="h-4 w-4 text-red-500" />,
      });
      console.error('Update client error:', error);
    },
  });

  const handleAddContact = () => {
    const result = contactSchema.safeParse(contactForm.getValues());
    if (!result.success) {
      // Show validation errors
      Object.entries(result.error.formErrors.fieldErrors).forEach(([field, errors]) => {
        if (errors && errors.length > 0) {
          toast.error(`${field}: ${errors[0]}`, {
            duration: 3000,
          });
        }
      });
      return;
    }

    if (contactBeingEdited !== null) {
      // Update existing contact
      const updatedContacts = contacts.map((contact, index) =>
        index === contactBeingEdited ? contactForm.getValues() : contact
      );
      setContacts(updatedContacts);
      setContactBeingEdited(null);
    } else {
      // Add new contact
      setContacts([...contacts, contactForm.getValues()]);
    }

    contactForm.reset({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      status: 'Active',
    });
    setIsAddingContact(false);
  };

  const handleEditContact = (index: number) => {
    const contact = contacts[index];
    contactForm.reset(contact);
    setContactBeingEdited(index);
    setIsAddingContact(true);
  };

  const handleDeleteContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const onSubmitClient = (data: ClientFormValues) => {
    // Include contacts in the submission
    // Since contacts_data is now of type Contact[], we'll use the same contacts array
    const clientData = {
      ...data,
      contacts: contacts,
      contacts_data: contacts // Use the same contacts array for contacts_data
    };

    if (isEditMode && slug) {
      updateClientMutation.mutate({
        slug,
        client: clientData,
      });
    } else {
      createClientMutation.mutate(clientData);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/accounts/client'); // Navigate back to the client list
  };

  if (isEditMode && isLoadingClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('client.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isClientError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('client.form.error')}</div>
        <Button onClick={handleCancel} variant="outline">
          {t('client.form.backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? t('client.form.editTitle') : t('client.form.createPageTitle')}
          </h1>
        </div>
      </div>

      <Form {...clientForm}>
        <form onSubmit={clientForm.handleSubmit(onSubmitClient)} className="space-y-6">
          <div className="space-y-4">
            {/* Client Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('client.form.sections.clientDetails')}</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  {t('client.form.toggle')}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={clientForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client.form.fields.type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('client.form.placeholders.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Individual">{t('client.types.individual')}</SelectItem>
                            <SelectItem value="Company">{t('client.types.company')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client.form.fields.code')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('client.form.placeholders.code')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client.form.fields.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('client.form.placeholders.name')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={clientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client.form.fields.email')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('client.form.placeholders.email')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client.form.fields.phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('client.form.placeholders.phone')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client.form.fields.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('client.form.placeholders.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('client.status.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('client.status.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={clientForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('client.form.fields.address')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('client.form.placeholders.address')}
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Contact Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('client.form.sections.contactDetails')}</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-700 hover:text-white px-3">
                  {t('client.form.toggle')}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                {/* Contacts UI with Add button and table */}
                {!isAddingContact ? (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={() => setIsAddingContact(true)}
                      className="flex items-center"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" /> {t('client.form.contact.add')}
                    </Button>

                    {/* Contacts Table */}
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[180px]">{t('client.form.contact.columns.firstName')}</TableHead>
                            <TableHead className="w-[180px]">{t('client.form.contact.columns.lastName')}</TableHead>
                            <TableHead className="w-[200px]">{t('client.form.contact.columns.email')}</TableHead>
                            <TableHead className="w-[150px]">{t('client.form.contact.columns.phone')}</TableHead>
                            <TableHead className="w-[100px]">{t('client.form.contact.columns.status')}</TableHead>
                            <TableHead className="w-[100px] text-right">{t('client.form.contact.columns.action')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                                {t('client.form.contact.noItems')}
                              </TableCell>
                            </TableRow>
                          ) : (
                            contacts.map((contact, index) => (
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
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditContact(index)}
                                      className="h-8 w-8"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteContact(index)}
                                      className="h-8 w-8 text-red-500 hover:text-red-700"
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
                    </div>
                  </div>
                ) : (
                  /* Contact Form */
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <h3 className="text-base font-medium mb-4">
                      {contactBeingEdited !== null ? t('client.form.contact.editTitle') : t('client.form.contact.addTitle')}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem>
                          <FormLabel>{t('client.form.contact.fields.firstName')}</FormLabel>
                          <Input
                            {...contactForm.register('first_name')}
                            placeholder={t('client.form.contact.placeholders.firstName')}
                          />
                          {contactForm.formState.errors.first_name && (
                            <p className="text-sm text-red-500">{contactForm.formState.errors.first_name.message}</p>
                          )}
                        </FormItem>

                        <FormItem>
                          <FormLabel>{t('client.form.contact.fields.lastName')}</FormLabel>
                          <Input
                            {...contactForm.register('last_name')}
                            placeholder={t('client.form.contact.placeholders.lastName')}
                          />
                          {contactForm.formState.errors.last_name && (
                            <p className="text-sm text-red-500">{contactForm.formState.errors.last_name.message}</p>
                          )}
                        </FormItem>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem>
                          <FormLabel>{t('client.form.contact.fields.email')}</FormLabel>
                          <Input
                            {...contactForm.register('email')}
                            placeholder={t('client.form.contact.placeholders.email')}
                          />
                          {contactForm.formState.errors.email && (
                            <p className="text-sm text-red-500">{contactForm.formState.errors.email.message}</p>
                          )}
                        </FormItem>

                        <FormItem>
                          <FormLabel>{t('client.form.contact.fields.phone')}</FormLabel>
                          <Input
                            {...contactForm.register('phone')}
                            placeholder={t('client.form.contact.placeholders.phone')}
                          />
                        </FormItem>
                      </div>

                      <FormItem>
                        <FormLabel>{t('client.form.contact.fields.status')}</FormLabel>
                        <Select
                          onValueChange={(value) => contactForm.setValue('status', value as 'Active' | 'Inactive')}
                          defaultValue={contactForm.getValues('status')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('client.form.contact.placeholders.selectStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">{t('client.status.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('client.status.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>

                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAddingContact(false);
                            setContactBeingEdited(null);
                            contactForm.reset();
                          }}
                        >
                          {t('common:actions.cancel')}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddContact}
                          disabled={contactForm.formState.isSubmitting}
                        >
                          {contactForm.formState.isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {contactBeingEdited !== null ? t('client.form.contact.update') : t('client.form.contact.save')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Form submit buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              {t('common:actions.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createClientMutation.isPending || updateClientMutation.isPending}
            >
              {(createClientMutation.isPending || updateClientMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('client.form.update') : t('client.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClientForm;
