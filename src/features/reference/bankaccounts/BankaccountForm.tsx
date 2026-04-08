// src/features/asset/bankaccounts/BankaccountForm.tsx
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
import { Bankaccount } from '@/types/bankaccount';
import { useBankaccountQuery, useCreateBankaccount, useUpdateBankaccount } from '@/hooks/bankaccount/useBankaccountQueries';
import { toast } from '@/components/ui/use-toast';

// Form schema definition
const bankaccountSchema = z.object({
  bank: z.string(),
  account_name: z.string(),
  account_number: z.string(),
  currency: z.enum(['NGN', 'USD', 'EUR', 'GBP']),
  address: z.string().optional().default(""),
  details: z.string().optional().default(""),
  status: z.enum(['Active', 'Inactive']),
});

type BankaccountFormValues = z.infer<typeof bankaccountSchema>;

const BankaccountForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    additional: false
  });
  
  // Bankaccount form setup
  const bankaccountForm = useForm<BankaccountFormValues>({
    resolver: zodResolver(bankaccountSchema),
    defaultValues: {
      bank: '',
      account_name: '',
      account_number: '',
      currency: 'NGN',
      address: '',
      details: '',
      status: 'Active',
    }
  });

  // Fetch bankaccount data for edit mode using our custom hook
  const { 
    data: bankaccountData, 
    isLoading: isLoadingBankaccount, 
    isError: isBankaccountError,
    error: bankaccountError
  } = useBankaccountQuery(isEditMode ? slug : undefined);

  // Use our custom mutation hooks
  const createBankaccountMutation = useCreateBankaccount();
  const updateBankaccountMutation = useUpdateBankaccount(slug);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle bankaccount data loading
  useEffect(() => {
    if (bankaccountData && isEditMode) {
      // Reset the form with bankaccount data
      bankaccountForm.reset({
        bank: bankaccountData.bank,
        account_name: bankaccountData.account_name,
        account_number: bankaccountData.account_number,
        currency: bankaccountData.currency,
        address: bankaccountData.address || '',
        details: bankaccountData.details || '',
        status: bankaccountData.status,
      });
    }
  }, [bankaccountData, isEditMode, bankaccountForm]);

  const onSubmitBankaccount = async (data: BankaccountFormValues) => {
    try {
      if (isEditMode && slug) {
        updateBankaccountMutation.mutate(
          { slug, bankaccount: data },
          { onSuccess: () => navigate('/dashboard/accounts/bank-accounts') }
        );
      } else {
        createBankaccountMutation.mutate(
          data as unknown as Omit<Bankaccount, 'id'>,
          { onSuccess: () => navigate('/dashboard/accounts/bank-accounts') }
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
    navigate('/dashboard/accounts/bank-accounts');
  };

  if (isEditMode && isLoadingBankaccount) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading bank account details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isBankaccountError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading bank account details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {bankaccountError instanceof Error ? bankaccountError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Bank Accounts
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
            {isEditMode ? 'Edit Bank Account' : 'Create New Bank Account'}
          </h1>
        </div>
      </div>

      <Form {...bankaccountForm}>
        <form onSubmit={bankaccountForm.handleSubmit(onSubmitBankaccount)} className="space-y-6">
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
                    control={bankaccountForm.control}
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
                  
                  <FormField
                    control={bankaccountForm.control}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={bankaccountForm.control}
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
                    control={bankaccountForm.control}
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
                </div>
                
                <FormField
                  control={bankaccountForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
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
                
                <FormField
                  control={bankaccountForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter bank address"
                          {...field}
                          className="min-h-[100px] resize-y"
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
          <div className="rounded-md border overflow-hidden">
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
                <FormField
                  control={bankaccountForm.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter additional details or notes about this account"
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
              disabled={createBankaccountMutation.isPending || updateBankaccountMutation.isPending}
            >
              {(createBankaccountMutation.isPending || updateBankaccountMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Bank Account' : 'Create Bank Account'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default BankaccountForm;