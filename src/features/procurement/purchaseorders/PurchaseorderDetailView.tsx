import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  CalendarDays, 
  Building, 
  FileText, 
  Package, 
  Tag, 
  User, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  XCircle,
  FileBox,
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Paperclip
} from 'lucide-react';
import { usePurchaseorderQuery } from '@/hooks/purchaseorder/usePurchaseorderQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

const PurchaseorderDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook to fetch purchase order data
  const {
    data: purchaseorder,
    isLoading,
    isError,
    error
  } = usePurchaseorderQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/procurement/purchase-order');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/procurement/purchase-order/edit/${id}`);
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
      case 'Sent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
      case 'Delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get approval status badge styles
  const getApprovalStatusBadge = (approved: boolean) => {
    return approved ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
    ) : (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    );
  };

  // Get date formatted
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get short date formatted
  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading purchase order details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading purchase order details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Purchase Orders
        </Button>
      </div>
    );
  }

  if (!purchaseorder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Purchase order not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Purchase Orders
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
            <h1 className="text-2xl font-bold">Purchase Order #{purchaseorder.id}</h1>
            <p className="text-muted-foreground text-sm">Created on {formatDate(purchaseorder.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge(purchaseorder.status)}
            </div>
            <p className="text-sm text-muted-foreground">Type: {purchaseorder.type}</p>
          </div>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Purchase Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Details</TabsTrigger>
          <TabsTrigger value="vendor">Vendor & Organization</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Purchase Order Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileBox className="h-5 w-5 text-primary" />
                  Purchase Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchase Order ID</p>
                  <p className="text-md font-medium">#{purchaseorder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-md">{purchaseorder.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(purchaseorder.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                  <p className="text-md">{purchaseorder.contact_person || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Date Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requested Date</p>
                  <p className="text-md">{formatShortDate(purchaseorder.requested_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Delivery</p>
                  <p className="text-md">{formatShortDate(purchaseorder.expected_delivery_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-md">{formatShortDate(purchaseorder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-md">{formatShortDate(purchaseorder.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ship To</p>
                  <p className="text-md">{purchaseorder.ship_to || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Date</p>
                  <p className="text-md">{formatShortDate(purchaseorder.expected_delivery_date)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terms and Conditions */}
          {purchaseorder.terms_and_conditions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Terms and Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{purchaseorder.terms_and_conditions}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ship To Address</p>
                    <p className="text-md">{purchaseorder.ship_to || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                    <p className="text-md">{purchaseorder.contact_person || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expected Delivery Date</p>
                    <p className="text-md">{formatDate(purchaseorder.expected_delivery_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requested Date</p>
                    <p className="text-md">{formatDate(purchaseorder.requested_date)}</p>
                  </div>
                </div>
              </div>
              {purchaseorder.terms_and_conditions && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Terms and Conditions</p>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm whitespace-pre-line">{purchaseorder.terms_and_conditions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vendor Name</p>
                    <p className="text-lg font-medium">{purchaseorder.vendor_detail?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                    <p className="text-md">{purchaseorder.vendor_detail?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-md">{purchaseorder.vendor_detail?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-md">{purchaseorder.vendor_detail?.email || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Facility</p>
                    <p className="text-md">{purchaseorder.facility_detail?.name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{purchaseorder.facility_detail?.address_gps || purchaseorder.facility_detail?.type || ''}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p className="text-md">{purchaseorder.department_detail?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        {purchaseorder.requested_by_detail?.first_name} {purchaseorder.requested_by_detail?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{purchaseorder.requested_by_detail?.email}</p>
                      {purchaseorder.requested_by_detail?.roles && (
                        <p className="text-xs text-muted-foreground mt-1">Role: {purchaseorder.requested_by_detail.roles}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Purchase Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseorder.items && purchaseorder.items.length > 0 ? (
                <div className="space-y-4">
                  {purchaseorder.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Description</p>
                          <p className="text-md">{item.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                          <p className="text-md">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Unit</p>
                          <p className="text-md">{item.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Specification</p>
                          <p className="text-md">{item.specification || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No items added to this purchase order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Approval History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseorder.approvals && purchaseorder.approvals.length > 0 ? (
                <div className="space-y-4">
                  {purchaseorder.approvals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {approval.approver_detail?.first_name?.charAt(0)}{approval.approver_detail?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {approval.approver_detail?.first_name} {approval.approver_detail?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{approval.approver_detail?.email}</p>
                            {approval.decision_date && (
                              <p className="text-xs text-muted-foreground">{formatDate(approval.decision_date)}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getApprovalStatusBadge(approval.approved)}
                        </div>
                      </div>
                      {approval.comment && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm">{approval.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No approvals recorded for this purchase order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseorder.comments && purchaseorder.comments.length > 0 ? (
                <div className="space-y-4">
                  {purchaseorder.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {comment.user_detail?.first_name?.charAt(0)}{comment.user_detail?.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {comment.user_detail?.first_name} {comment.user_detail?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No comments added to this purchase order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-primary" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseorder.attachments_data && purchaseorder.attachments_data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {purchaseorder.attachments_data.map((attachment, index) => (
                    <div key={attachment.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attachment.file_url ? attachment.file_url.split('/').pop() : `Attachment ${index + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">File attachment</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => window.open(attachment.file_url, '_blank')}
                      >
                        View File
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No attachments added to this purchase order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseorderDetailView;