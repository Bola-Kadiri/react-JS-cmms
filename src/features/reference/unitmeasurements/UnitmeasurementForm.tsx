// src/features/asset/unitmeasurements/UnitmeasurementForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Unitmeasurement } from '@/types/unitmeasurement';
import { useUnitmeasurementQuery, useCreateUnitmeasurement, useUpdateUnitmeasurement } from '@/hooks/unitmeasurement/useUnitmeasurementQueries';
import { toast } from '@/components/ui/use-toast';

// Form schema definition
const unitmeasurementSchema = z.object({
  code: z.string(),
  description: z.string().optional().default(""),
  symbol: z.string(),
  type: z.enum(['Area', 'Packing', 'Piece', 'Time', 'Volume', 'Weight', 'Other']),
  status: z.enum(['Active', 'Inactive']),
});

type UnitmeasurementFormValues = z.infer<typeof unitmeasurementSchema>;

const UnitmeasurementForm = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isEditMode = !!code;
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    additional: false
  });
  
  // Unitmeasurement form setup
  const unitmeasurementForm = useForm<UnitmeasurementFormValues>({
    resolver: zodResolver(unitmeasurementSchema),
    defaultValues: {
      code: '',
      description: '',
      symbol: '',
      type: 'Other',
      status: 'Active',
    }
  });

  // Fetch unitmeasurement data for edit mode using our custom hook
  const { 
    data: unitmeasurementData, 
    isLoading: isLoadingUnitmeasurement, 
    isError: isUnitmeasurementError,
    error: unitmeasurementError
  } = useUnitmeasurementQuery(isEditMode ? code : undefined);

  // Use our custom mutation hooks
  const createUnitmeasurementMutation = useCreateUnitmeasurement();
  const updateUnitmeasurementMutation = useUpdateUnitmeasurement(code);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle unitmeasurement data loading
  useEffect(() => {
    if (unitmeasurementData && isEditMode) {
      // Reset the form with unitmeasurement data
      unitmeasurementForm.reset({
        code: unitmeasurementData.code,
        description: unitmeasurementData.description || '',
        symbol: unitmeasurementData.symbol,
        type: unitmeasurementData.type,
        status: unitmeasurementData.status
      });
    }
  }, [unitmeasurementData, isEditMode, unitmeasurementForm]);

  const onSubmitUnitmeasurement = async (data: UnitmeasurementFormValues) => {
    try {
      if (isEditMode && code) {
        updateUnitmeasurementMutation.mutate(
          { code, unitmeasurement: data },
          { onSuccess: () => navigate('/dashboard/accounts/unit-measurements') }
        );
      } else {
        createUnitmeasurementMutation.mutate(
          data as unknown as Omit<Unitmeasurement, 'id'>,
          { onSuccess: () => navigate('/dashboard/accounts/unit-measurements') }
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
    navigate('/dashboard/accounts/unit-measurements');
  };

  if (isEditMode && isLoadingUnitmeasurement) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading unit measurement details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isUnitmeasurementError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading unit measurement details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {unitmeasurementError instanceof Error ? unitmeasurementError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Unit Measurements
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
            {isEditMode ? 'Edit Unit Measurement' : 'Create New Unit Measurement'}
          </h1>
        </div>
      </div>

      <Form {...unitmeasurementForm}>
        <form onSubmit={unitmeasurementForm.handleSubmit(onSubmitUnitmeasurement)} className="space-y-6">
          {/* First Collapsible: Basic Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('basic')}
            >
              <h2 className="text-lg font-medium">Basic Information</h2>
              {openSections.basic ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.basic && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={unitmeasurementForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter unit measurement code"
                            {...field}
                            disabled={isEditMode} // Code cannot be changed in edit mode
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={unitmeasurementForm.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter symbol"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={unitmeasurementForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Area">Area</SelectItem>
                            <SelectItem value="Packing">Packing</SelectItem>
                            <SelectItem value="Piece">Piece</SelectItem>
                            <SelectItem value="Time">Time</SelectItem>
                            <SelectItem value="Volume">Volume</SelectItem>
                            <SelectItem value="Weight">Weight</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={unitmeasurementForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={unitmeasurementForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter unit measurement description"
                          {...field}
                          className="min-h-[120px] resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Additional Information Collapsible */}
          {/* <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('additional')}
            >
              <h2 className="text-lg font-medium">Additional Information</h2>
              {openSections.additional ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.additional && (
              <div className="p-6 space-y-6 bg-white">
                <p className="text-sm text-muted-foreground">
                  Unit measurements are used across the system to standardize how quantities are measured and displayed.
                  Common examples include kg (Weight), m² (Area), L (Volume), etc.
                </p>
                <p className="text-sm text-muted-foreground">
                  The code should be unique and preferably short. The symbol is what will be displayed next to quantity values.
                </p>
              </div>
            )}
          </div> */}

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createUnitmeasurementMutation.isPending || updateUnitmeasurementMutation.isPending}
            >
              {(createUnitmeasurementMutation.isPending || updateUnitmeasurementMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Unit Measurement' : 'Create Unit Measurement'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default UnitmeasurementForm;