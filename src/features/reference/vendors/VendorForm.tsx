// src/features/asset/vendors/VendorForm.tsx
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
import { Vendor } from '@/types/vendor';
import { useVendorQuery, useCreateVendor, useUpdateVendor } from '@/hooks/vendor/useVendorQueries';
import { toast } from '@/components/ui/use-toast';

// Form schema definition
const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Individual', 'Company']),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  account_name: z.string().min(1, 'Account name is required'),
  bank: z.string().min(1, 'Bank name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  currency: z.enum(['NGN', 'USD', 'EUR', 'GBP']),
  status: z.enum(['Active', 'Inactive']),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

const VendorForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    banking: true
  });
  
  // Vendor form setup
  const vendorForm = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      type: 'Company',
      phone: '',
      email: '',
      account_name: '',
      bank: '',
      account_number: '',
      currency: 'NGN',
      status: 'Active'
    }
  });

  // Fetch vendor data for edit mode using our custom hook
  const { 
    data: vendorData, 
    isLoading: isLoadingVendor, 
    isError: isVendorError,
    error: vendorError
  } = useVendorQuery(isEditMode ? slug : undefined);

  // Use our custom mutation hooks
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor(slug);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle vendor data loading
  useEffect(() => {
    if (vendorData && isEditMode) {
      // Reset the form with vendor data
      vendorForm.reset({
        name: vendorData.name,
        type: vendorData.type,
        phone: vendorData.phone,
        email: vendorData.email,
        account_name: vendorData.account_name,
        bank: vendorData.bank,
        account_number: vendorData.account_number,
        currency: vendorData.currency,
        status: vendorData.status
      });
    }
  }, [vendorData, isEditMode, vendorForm]);

  const onSubmitVendor = async (data: VendorFormValues) => {
    try {
      if (isEditMode && slug) {
        updateVendorMutation.mutate(
          { slug, vendor: data },
          { onSuccess: () => navigate('/dashboard/accounts/vendors') }
        );
      } else {
        createVendorMutation.mutate(
          data as unknown as Omit<Vendor, 'id'>,
          { onSuccess: () => navigate('/dashboard/accounts/vendors') }
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
    navigate('/dashboard/accounts/vendors');
  };

  if (isEditMode && isLoadingVendor) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading vendor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isVendorError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading vendor details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {vendorError instanceof Error ? vendorError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Vendors
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
            {isEditMode ? 'Edit Vendor' : 'Create New Vendor'}
          </h1>
        </div>
      </div>

      <Form {...vendorForm}>
        <form onSubmit={vendorForm.handleSubmit(onSubmitVendor)} className="space-y-6">
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
                    control={vendorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter vendor name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={vendorForm.control}
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
                              <SelectValue placeholder="Select vendor type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Individual">Individual</SelectItem>
                            <SelectItem value="Company">Company</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={vendorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter email address"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={vendorForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={vendorForm.control}
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
            )}
          </div>
          
          {/* Second Collapsible: Banking Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('banking')}
            >
              <h2 className="text-lg font-medium">Banking Information</h2>
              {openSections.banking ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.banking && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={vendorForm.control}
                    name="account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter account name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={vendorForm.control}
                    name="bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter bank name"
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
                    control={vendorForm.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter account number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={vendorForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

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
              disabled={createVendorMutation.isPending || updateVendorMutation.isPending}
            >
              {(createVendorMutation.isPending || updateVendorMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Vendor' : 'Create Vendor'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default VendorForm;