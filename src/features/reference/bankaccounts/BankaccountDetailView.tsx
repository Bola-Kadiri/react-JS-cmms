import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  Building, 
  Mail, 
  MapPin,
  User, 
  CreditCard,
  Landmark,
  DollarSign,
  Tag, 
  CheckCircle2
} from 'lucide-react';
import { useBankaccountQuery } from '@/hooks/bankaccount/useBankaccountQueries';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';

const BankaccountDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const {
    data: bankaccount,
    isLoading,
    isError,
    error
  } = useBankaccountQuery(slug);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/accounts/bank-accounts');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/accounts/bank-accounts/edit/${slug}`);
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format currency with symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'NGN': '₦',
      'GBP': '£'
    };
    
    return symbols[currency] || currency;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading bank account details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading bank account details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Bank Accounts
        </Button>
      </div>
    );
  }

  if (!bankaccount) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Bank account not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Bank Accounts
        </Button>
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
            onClick={handleBack}
            className="h-10 w-10 rounded-full shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bankaccount.account_name}</h1>
            <div className="flex items-center mt-1 gap-2">
              <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                {bankaccount.bank}
              </Badge>
              {getStatusBadge(bankaccount.status)}
            </div>
          </div>
        </div>
        <PermissionGuard feature='reference' permission='edit'>
        <Button onClick={handleEdit} className="rounded-full shadow-sm bg-green-600 hover:bg-green-700">
          <Edit className="mr-2 h-4 w-4" /> Edit Account
        </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Bank Account Card */}
        <Card className="lg:col-span-3 overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <Landmark className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-bold">{bankaccount.account_name}</h2>
                  <p className="text-green-100 mt-1 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Account Number: {bankaccount.account_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <div className="text-white text-2xl font-bold flex items-center">
                    {getCurrencySymbol(bankaccount.currency)}
                  </div>
                </div>
                {getStatusBadge(bankaccount.status)}
              </div>
            </div>
          </div>
          
          <CardContent className="pt-8 pb-6 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Landmark className="h-5 w-5 text-green-600" />
                    Bank Account Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-4 transition-all duration-200 hover:bg-gray-100 hover:shadow-md">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Account Name</p>
                        <p className="text-lg font-medium">{bankaccount.account_name}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-4 transition-all duration-200 hover:bg-gray-100 hover:shadow-md">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Account Number</p>
                        <p className="text-lg font-mono tracking-wide">{bankaccount.account_number}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-4 transition-all duration-200 hover:bg-gray-100 hover:shadow-md">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Building className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                        <p className="text-lg font-medium">{bankaccount.bank}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Additional Details
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-4 transition-all duration-200 hover:bg-gray-100 hover:shadow-md">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Currency</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">{bankaccount.currency}</span>
                          <span className="text-xl font-bold text-green-600">{getCurrencySymbol(bankaccount.currency)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-4 transition-all duration-200 hover:bg-gray-100 hover:shadow-md">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p className="text-base">{bankaccount.address || 'No address provided'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-5 bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-800">Account Status</h4>
                          {getStatusBadge(bankaccount.status)}
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-800">Active Account</span>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          This bank account is currently active and can be used for transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {bankaccount.details && (
              <div className="mt-10">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-5 w-5 text-green-600" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">
                      {bankaccount.details}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankaccountDetailView;