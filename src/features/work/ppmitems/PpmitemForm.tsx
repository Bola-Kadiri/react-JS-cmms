// src/features/work/ppmitems/PpmitemForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PPMItem } from '@/types/ppmitem';
import { 
  usePPMItemQuery, 
  useCreatePPMItem, 
  useUpdatePPMItem 
} from '@/hooks/ppmitem/usePpmitemQueries';
import { toast } from '@/components/ui/use-toast';

// Form schema definition (excluding id and total_price)
const ppmitemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  qty: z.number().positive("Quantity must be positive"),
  unit_price: z.string().min(1, "Unit price is required"),
  unit: z.string().min(1, "Unit is required")
});

type PPMItemFormValues = z.infer<typeof ppmitemSchema>;

const PpmitemForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // PPM Item form setup
  const ppmitemForm = useForm<PPMItemFormValues>({
    resolver: zodResolver(ppmitemSchema),
    defaultValues: {
      description: '',
      qty: 1,
      unit_price: '',
      unit: ''
    }
  });

  // Fetch PPM Item data for edit mode
  const { 
    data: ppmitemData, 
    isLoading: isLoadingPPMItem, 
    isError: isPPMItemError,
    error: ppmitemError
  } = usePPMItemQuery(isEditMode ? id : undefined);

  // Mutation hooks
  const createPPMItemMutation = useCreatePPMItem();
  const updatePPMItemMutation = useUpdatePPMItem(id);

  // Load PPM Item data for edit mode
  useEffect(() => {
    if (ppmitemData && isEditMode) {
      // Reset the form with PPM Item data
      ppmitemForm.reset({
        description: ppmitemData.description,
        qty: ppmitemData.qty,
        unit_price: ppmitemData.unit_price,
        unit: ppmitemData.unit
      });
    }
  }, [ppmitemData, isEditMode, ppmitemForm]);

  // Form submission handler
  const onSubmitPPMItem = async (data: PPMItemFormValues) => {
    try {
      if (isEditMode && id) {
        updatePPMItemMutation.mutate(
          { id, ppmitem: data },
          { 
            onSuccess: () => {
              toast({
                title: "Success",
                description: "PPM Item updated successfully",
                variant: "default",
              });
              navigate('/dashboard/work/ppm-items');
            },
            onError: (error) => {
              console.error('Error updating PPM Item:', error);
              toast({
                title: "Error",
                description: "Failed to update PPM Item. Please try again.",
                variant: "destructive",
              });
            }
          }
        );
      } else {
        createPPMItemMutation.mutate(
          data,
          { 
            onSuccess: () => {
              toast({
                title: "Success",
                description: "PPM Item created successfully",
                variant: "default",
              });
              navigate('/dashboard/work/ppm-items');
            },
            onError: (error) => {
              console.error('Error creating PPM Item:', error);
              toast({
                title: "Error",
                description: "Failed to create PPM Item. Please try again.",
                variant: "destructive",
              });
            }
          }
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
    navigate('/dashboard/work/ppm-items');
  };

  // Loading state
  if (isEditMode && isLoadingPPMItem) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading PPM Item details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isEditMode && isPPMItemError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading PPM Item details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {ppmitemError instanceof Error ? ppmitemError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to PPM Items
          </Button>
        </div>
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
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit PPM Item' : 'Create New PPM Item'}
          </h1>
        </div>
      </div>

      <Form {...ppmitemForm}>
        <form onSubmit={ppmitemForm.handleSubmit(onSubmitPPMItem)} className="space-y-6">
          <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
            <div className="p-6 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-800">PPM Item Details</h2>
              <p className="text-sm text-green-600 mt-1">Enter the details for the PPM item</p>
            </div>
            
            <div className="p-6 space-y-6 bg-white">
              {/* Description */}
              <FormField
                control={ppmitemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter PPM item description"
                        {...field}
                        className="min-h-[120px] resize-y border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity and Unit Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={ppmitemForm.control}
                  name="qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Quantity <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Enter quantity"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ppmitemForm.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Unit Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="Enter unit price (e.g., 100.00)"
                          {...field}
                          className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Unit */}
              <FormField
                control={ppmitemForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Unit <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="Enter unit (e.g., pcs, kg, liters)"
                        {...field}
                        className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createPPMItemMutation.isPending || updatePPMItemMutation.isPending}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {(createPPMItemMutation.isPending || updatePPMItemMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update PPM Item' : 'Create PPM Item'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PpmitemForm;
