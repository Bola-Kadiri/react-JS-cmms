import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { CrudTable } from '@/components/crud/CrudTable';
import { CrudForm, FormField } from '@/components/crud/CrudForm';
import { useList, useCreate, useUpdate, useDelete } from '@/hooks/crud/useCrudOperations';
import { z } from 'zod';
import { toast } from 'sonner';

export interface BankAccount {
  id: string;
  slug: string;
  bank: string;
  account_name: string;
  account_number: string;
  currency: string;
  address: string;
  details: string;
  status: 'Active' | 'Inactive';
}

const endpoint = 'accounts/api/bank-accounts/'

export default function BankAccountManagementPage() {
  // State for form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Use the CRUD hooks
  const {
    data: bankAccounts,
    isLoading: isLoadingBankAccounts,
    currentPage,
    totalPages,
    handlePageChange,
    refetch
  } = useList<BankAccount>('bankAccounts', endpoint, { pageSize: 10 });

  const createMutation = useCreate<BankAccount>('bankAccount', endpoint);
  const updateMutation = useUpdate<BankAccount, 'slug'>('bankAccount', endpoint, 'slug');
  const deleteMutation = useDelete('bankAccount', endpoint, 'slug');

  // Handler for creating or updating a store
  const handleSubmit = (data: any) => {
    if (editingBankAccount) {
      updateMutation.mutate(
        { identifier: editingBankAccount.slug, data },
        {
          onSuccess: () => {
            // Close form on success
            setIsFormOpen(false);
            setEditingBankAccount(null);
            refetch();
          }
        }
      );
    } else {
      createMutation.mutate(
        data,
        {
          onSuccess: () => {
            // Close form on success
            setIsFormOpen(false);
            refetch();
          }
        }
      );
    }
  };

  // Handler for opening the form to edit an bankAccount
  const handleEdit = (bankAccount: BankAccount) => {
    setEditingBankAccount(bankAccount);
    setIsFormOpen(true);
  };

  // Handler for opening the form to create a new bankAccount
  const handleCreate = () => {
    setEditingBankAccount(null);
    setIsFormOpen(true);
  };

  // Handler for deleting a bankAccount
  const handleDelete = (slug: string) => {
    // Track which bankAccount is being deleted
    setDeletingIds(prev => [...prev, slug]);
    
    deleteMutation.mutate(
      slug,
      {
        onSuccess: () => {
          // Remove from deletingIds when complete
          setDeletingIds(prev => prev.filter(id => id !== slug));
          refetch();
        },
        onError: () => {
          // Remove from deletingIds when error occurs
          setDeletingIds(prev => prev.filter(id => id !== slug));
        }
      }
    );
  };

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'bank',
      label: 'Bank',
      type: 'text',
      validation: z.string()
    //   .min(1, 'Code must be at least 1 character'),
    },
    {
        name: 'account_name',
        label: 'Account Name',
        type: 'text',
        validation: z.string()
      //   .min(1, 'Code must be at least 1 character'),
      },
      {
        name: 'account_number',
        label: 'Accout Number',
        type: 'text',
        validation: z.string()
      //   .min(1, 'Code must be at least 1 character'),
      },
      {
        name: 'currency',
        label: 'Currency',
        type: 'select',
        options: [
          { label: 'NGN', value: 'NGN' },
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
        ],
        validation: z.string(),
      },
      {
        name: 'address',
        label: 'Address',
        type: 'text',
        validation: z.string()
      //   .min(1, 'Code must be at least 1 character'),
      },
      {
        name: 'details',
        label: 'Details',
        type: 'text',
        validation: z.string()
      //   .min(1, 'Code must be at least 1 character'),
      },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
      validation: z.string(),
    }
  ];

  // Table columns configuration
  const columns = [
    { header: 'Bank', accessor: 'bank' as keyof BankAccount },
    { header: 'Account Name', accessor: 'account_name' as keyof BankAccount },
    { header: 'Account Number', accessor: 'account_number' as keyof BankAccount },
    { header: 'Currency', accessor: 'currency' as keyof BankAccount },
    { 
      header: 'Status', 
      accessor: 'status' as keyof BankAccount,
      render: (value: string) => {
        const statusStyles = 'text-white px-2 py-1 rounded-full inline-flex items-center justify-center';
        return (
            <span className={value === 'Active' ? `${statusStyles} bg-green-600` : `${statusStyles} bg-red-600`}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
        )
      }
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bank Account Management</h1>
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bank Account
        </Button>
      </div>

      {isLoadingBankAccounts && bankAccounts.length === 0 ? (
        <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading bank accounts...</p>
        </div>
      </div>
      ) : (
        <CrudTable
          columns={columns}
          data={bankAccounts}
          idKey='slug'
          isLoading={isLoadingBankAccounts}
          deletingIds={deletingIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <CrudForm
        fields={formFields}
        onSubmit={handleSubmit}
        defaultValues={editingBankAccount}
        isOpen={isFormOpen}
        isLoading={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        onClose={() => setIsFormOpen(false)}
        title={editingBankAccount ? 'Edit' : 'Add'}
      />
    </div>
  );
}