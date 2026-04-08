// src/features/asset/departments/DepartmentForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Building } from 'lucide-react';
import { Department } from '@/types/department';
import { useDepartmentQuery, useCreateDepartment, useUpdateDepartment } from '@/hooks/department/useDepartmentQueries';
import { toast } from '@/components/ui/use-toast';

// Form schema definition matching Department interface
const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const DepartmentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Department form setup
  const departmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
    }
  });

  // Fetch department data for edit mode using our custom hook
  const { 
    data: departmentData, 
    isLoading: isLoadingDepartment, 
    isError: isDepartmentError,
    error: departmentError
  } = useDepartmentQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment(id);

  // Handle department data loading
  useEffect(() => {
    if (departmentData && isEditMode) {
      // Reset the form with department data
      departmentForm.reset({
        name: departmentData.name,
      });
    }
  }, [departmentData, isEditMode, departmentForm]);

  const onSubmitDepartment = async (data: DepartmentFormValues) => {
    try {
      if (isEditMode && id) {
        updateDepartmentMutation.mutate(
          { id, department: data },
          { onSuccess: () => navigate('/dashboard/accounts/departments') }
        );
      } else {
        createDepartmentMutation.mutate(
          data as Omit<Department, 'id'>,
          { onSuccess: () => navigate('/dashboard/accounts/departments') }
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/accounts/departments');
  };

  if (isEditMode && isLoadingDepartment) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading department details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isDepartmentError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading department details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {departmentError instanceof Error ? departmentError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Department' : 'Create New Department'}
          </h1>
        </div>
      </div>

      <Form {...departmentForm}>
        <form onSubmit={departmentForm.handleSubmit(onSubmitDepartment)} className="space-y-8 w-full">
          {/* Department Information */}
          <div className="rounded-md border overflow-hidden shadow-sm">
            <div className="bg-green-50 p-4 flex items-center gap-2 border-b border-green-100">
              <Building className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-medium text-gray-800">Department Information</h2>
            </div>
            
            <div className="p-8 space-y-8 bg-white">
              <div className="max-w-md">
                <FormField
                  control={departmentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Department Name<span className="text-red-500 ml-1">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Enter department name"
                            className="pl-10 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="px-6 h-11"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
              className="bg-green-600 hover:bg-green-700 px-6 h-11"
            >
              {(createDepartmentMutation.isPending || updateDepartmentMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DepartmentForm;