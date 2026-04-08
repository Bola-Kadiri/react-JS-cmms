import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Package, 
  Calendar, 
  User, 
  Building2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  Tag,
  MapPin
} from 'lucide-react';
import { useTransferQuery } from '@/hooks/transfer/useTransferQueries';
import { useToast } from '@/components/ui/use-toast';
import { PermissionGuard } from '@/components/PermissionGuard';

const TransferDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Using our custom hook instead of inventory query
  const { 
    data: transfer, 
    isLoading, 
    isError,
    error 
  } = useTransferQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/asset/transfers');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/asset/transfers/edit/${id}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'return':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'PPP'); // Format: 'April 29, 2025'
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'PPP p'); // Format: 'April 29, 2025 at 10:30 AM'
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading transfer details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading transfer details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Transfers
        </Button>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Transfer not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Transfers
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> 
              Transfer Details
            </h1>
            <p className="text-sm text-muted-foreground">
              ID: {transfer.id} • Created: {formatDateTime(transfer.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge 
            className={`px-3 py-1 text-xs ${getTypeColor(transfer.type)}`}
          >
            {transfer.type.toUpperCase()}
          </Badge>
          <PermissionGuard feature='transfer_form' permission='edit'>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Transfer
          </Button>
          </PermissionGuard>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Transfer Flow Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" /> 
                Transfer Flow
              </CardTitle>
              <CardDescription>
                Transfer from {transfer.request_from_detail?.name} to {transfer.transfer_to_detail?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex flex-col items-center text-center">
                  <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                  <div>
                    <h3 className="font-semibold text-blue-800">From</h3>
                    <p className="text-sm font-medium">{transfer.request_from_detail?.name}</p>
                    <p className="text-xs text-gray-500">{transfer.request_from_detail?.location}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <Badge className={getTypeColor(transfer.type)}>
                    {transfer.type}
                  </Badge>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <Building2 className="h-8 w-8 text-green-600 mb-2" />
                  <div>
                    <h3 className="font-semibold text-green-800">To</h3>
                    <p className="text-sm font-medium">{transfer.transfer_to_detail?.name}</p>
                    <p className="text-xs text-gray-500">{transfer.transfer_to_detail?.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Request Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> 
                  Request Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                  <div className="mt-1">
                    <p className="text-base font-medium">
                      {transfer.requested_by_detail?.first_name} {transfer.requested_by_detail?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{transfer.requested_by_detail?.roles}</p>
                    <p className="text-sm text-muted-foreground">{transfer.requested_by_detail?.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Required Date
                  </p>
                  <p className="text-base font-medium mt-1">{formatDate(transfer.required_date)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> 
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-base">{formatDateTime(transfer.created_at)}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-base">{formatDateTime(transfer.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> 
                Items to Transfer
              </CardTitle>
              <CardDescription>
                {transfer.items_detail?.length || 0} item(s) selected for this transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transfer.items_detail && transfer.items_detail.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transfer.items_detail.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{item.description || 'No description'}</p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items selected for this transfer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> 
                Confirmation Required From
              </CardTitle>
              <CardDescription>
                {transfer.confirmation_required_from_detail?.length || 0} user(s) required for confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transfer.confirmation_required_from_detail && transfer.confirmation_required_from_detail.length > 0 ? (
                <div className="space-y-4">
                  {transfer.confirmation_required_from_detail.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">{user.roles}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No confirmations required for this transfer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> 
                  Asset Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-medium">{transfer.category_detail?.code}</Badge>
                    <p className="text-base font-medium">{transfer.category_detail?.name}</p>
                  </div>
                  {transfer.category_detail?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {transfer.category_detail.description}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-base">{transfer.category_detail?.type || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Useful Life</p>
                  <p className="text-base">{transfer.category_detail?.useful_life_year || 'N/A'} years</p>
                </div>
              </CardContent>
            </Card>

            {/* Subcategory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> 
                  Asset Subcategory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                  <p className="text-base font-medium">{transfer.subcategory_detail?.name}</p>
                  {transfer.subcategory_detail?.description && (
                    <p className="text-sm text-muted-foreground">
                      {transfer.subcategory_detail.description}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subcategory Status</p>
                  <Badge className={`mt-1 ${
                    transfer.subcategory_detail?.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  }`}>
                    {transfer.subcategory_detail?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subcategory Type</p>
                  <Badge variant="outline" className="mt-1">
                    {transfer.subcategory_detail?.type || 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransferDetailView;