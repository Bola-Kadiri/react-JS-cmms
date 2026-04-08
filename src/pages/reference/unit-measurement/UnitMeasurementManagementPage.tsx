import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { CrudTable } from '@/components/crud/CrudTable';
import { CrudForm, FormField } from '@/components/crud/CrudForm';
import { useList, useCreate, useUpdate, useDelete } from '@/hooks/crud/useCrudOperations';
import { z } from 'zod';
import { toast } from 'sonner';

export interface UnitMeasurement {
    id: number;
    code: string;
    description: string;
    symbol: string;
    type: 'Area' | 'Packing' | 'Piece' | 'Time' | 'Volume' | 'Weight' | 'Other';
    status: 'Active' | 'Inactive';
  }

const endpoint = 'accounts/api/units/'

export default function UnitMeasurementManagementPage() {
  // State for form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnitMeasurement, setEditingUnitMeasurement] = useState<UnitMeasurement | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Use the CRUD hooks
  const {
    data: UnitMeasurements,
    isLoading: isLoadingUnitMeasurements,
    currentPage,
    totalPages,
    handlePageChange,
    refetch
  } = useList<UnitMeasurement>('UnitMeasurements', endpoint, { pageSize: 10 });

  const createMutation = useCreate<UnitMeasurement>('unitMeasurement', endpoint);
  const updateMutation = useUpdate<UnitMeasurement, 'code'>('unitMeasurement', endpoint, 'code');
  const deleteMutation = useDelete('unitMeasurement', endpoint, 'code');

  // Handler for creating or updating a store
  const handleSubmit = (data: any) => {
    if (editingUnitMeasurement) {
      updateMutation.mutate(
        { identifier: editingUnitMeasurement.code, data },
        {
          onSuccess: () => {
            // Close form on success
            setIsFormOpen(false);
            setEditingUnitMeasurement(null);
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

  // Handler for opening the form to edit an unitMeasurement
  const handleEdit = (unitMeasurement: UnitMeasurement) => {
    setEditingUnitMeasurement(unitMeasurement);
    setIsFormOpen(true);
  };

  // Handler for opening the form to create a new unitMeasurement
  const handleCreate = () => {
    setEditingUnitMeasurement(null);
    setIsFormOpen(true);
  };

  // Handler for deleting a unitMeasurement
  const handleDelete = (code: string) => {
    // Track which unitMeasurement is being deleted
    setDeletingIds(prev => [...prev, code]);
    
    deleteMutation.mutate(
      code,
      {
        onSuccess: () => {
          // Remove from deletingIds when complete
          setDeletingIds(prev => prev.filter(id => id !== code));
          refetch();
        },
        onError: () => {
          // Remove from deletingIds when error occurs
          setDeletingIds(prev => prev.filter(id => id !== code));
        }
      }
    );
  };

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'code',
      label: 'Code',
      type: 'text',
      validation: z.string()
    //   .min(1, 'Code must be at least 1 character'),
    },
    {
        name: 'description',
        label: 'Description',
        type: 'text',
        validation: z.string()
      //   .min(1, 'Code must be at least 1 character'),
      },
      {
        name: 'symbol',
        label: 'Symbol',
        type: 'text',
        validation: z.string()
      //   .min(1, 'Code must be at least 1 character'),
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        options: [
          { label: 'Area', value: 'Area' },
          { label: 'Packing', value: 'Packing' },
          { label: 'Piece', value: 'Piece' },
          { label: 'Time', value: 'Time' },
          { label: 'Volume', value: 'Volume' },
          { label: 'Weight', value: 'Weight' },
          { label: 'Other', value: 'Other' },
        ],
        validation: z.string(),
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
    { header: 'Code', accessor: 'code' as keyof UnitMeasurement },
    { header: 'Symbol', accessor: 'symbol' as keyof UnitMeasurement },
    { header: 'Type', accessor: 'type' as keyof UnitMeasurement },
    { 
      header: 'Status', 
      accessor: 'status' as keyof UnitMeasurement,
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
        <h1 className="text-2xl font-bold">Unit Measurement Management</h1>
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Unit Measurement
        </Button>
      </div>

      {isLoadingUnitMeasurements && UnitMeasurements.length === 0 ? (
        <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading unit measurements...</p>
        </div>
      </div>
      ) : (
        <CrudTable
          columns={columns}
          data={UnitMeasurements}
          idKey='code'
          isLoading={isLoadingUnitMeasurements}
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
        defaultValues={editingUnitMeasurement}
        isOpen={isFormOpen}
        isLoading={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        onClose={() => setIsFormOpen(false)}
        title={editingUnitMeasurement ? 'Edit' : 'Add'}
      />
    </div>
  );
}