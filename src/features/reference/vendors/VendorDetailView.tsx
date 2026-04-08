import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  Building, 
  Mail, 
  Phone, 
  User, 
  CreditCard,
  Briefcase,
  Building2,
  DollarSign,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useVendorQuery } from '@/hooks/vendor/useVendorQueries';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';

const VendorDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const {
    data: vendor,
    isLoading,
    isError,
    error
  } = useVendorQuery(slug);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/accounts/vendors');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/accounts/vendors/edit/${slug}`);
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

  // Get vendor type badge styles
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Company':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{type}</Badge>;
      case 'Individual':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading vendor details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Vendors
        </Button>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Vendor not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Vendors
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
          <div>
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            <p className="text-muted-foreground text-sm">
              Vendor {getTypeBadge(vendor.type)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge(vendor.status)}
            </div>
          </div>
          <PermissionGuard feature='reference' permission='edit'>
          <Button onClick={handleEdit} className="bg-green-600 hover:bg-green-700">
            <Edit className="mr-2 h-4 w-4" /> Edit Vendor
          </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">{vendor.name}</h2>
                  {getStatusBadge(vendor.status)}
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Tag className="h-4 w-4" />
                  <span>{vendor.type}</span>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${vendor.email}`} className="text-green-600 hover:underline">
                      {vendor.email || 'No email provided'}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${vendor.phone}`} className="text-green-600 hover:underline">
                      {vendor.phone || 'No phone provided'}
                    </a>
                  </div>
                </div>
              </div>

              {/* <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </Button>
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Banking & Financial Info */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Banking Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Name</h3>
                <p className="text-lg font-medium">{vendor.account_name || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bank</h3>
                <p className="text-lg">{vendor.bank || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Number</h3>
                <p className="text-lg font-mono">
                  {vendor.account_number ? 
                    <span className="bg-gray-100 px-2 py-1 rounded">{vendor.account_number}</span> : 
                    'Not provided'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Currency</h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-lg">{vendor.currency || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Verified Account</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This vendor has verified banking information and is ready to receive payments.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Vendor Activity
            </CardTitle>
            <CardDescription>
              Recent transactions and activities with this vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-500 font-medium mb-1">No Recent Activity</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                This vendor doesn't have any recent activity or transactions in the system.
              </p>
              {/* <Button variant="outline" className="mt-4">
                Create New Transaction
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDetailView;