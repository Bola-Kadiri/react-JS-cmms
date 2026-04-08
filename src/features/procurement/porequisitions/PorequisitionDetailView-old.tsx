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
  Banknote, 
  User, 
  Users, 
  CheckCircle2, 
  XCircle,
  FileBox,
  CreditCard,
  Receipt,
  DollarSign,
  Paperclip
} from 'lucide-react';
import { usePorequisitionQuery } from '@/hooks/porequisition/usePorequisitionQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

const PorequisitionDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook to fetch PO requisition data
  const {
    data: porequisition,
    isLoading,
    isError,
    error
  } = usePorequisitionQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/procurement/po-requisition');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/procurement/po-requisition/edit/${id}`);
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      case 'Paid':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
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

  // Format currency
  const formatCurrency = (amount: string) => {
    try {
      const numAmount = parseFloat(amount);
      return numAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
    } catch (e) {
      return amount;
    }
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
          <p className="text-sm text-muted-foreground">Loading PO requisition details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading PO requisition details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to PO Requisitions
        </Button>
      </div>
    );
  }

  if (!porequisition) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">PO requisition not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to PO Requisitions
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
            <h1 className="text-2xl font-bold">PO Requisition #{porequisition.id}</h1>
            <p className="text-muted-foreground text-sm">Invoice: {porequisition.invoice_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge(porequisition.status)}
            </div>
            <p className="text-sm text-muted-foreground">Created on {formatShortDate(porequisition.created_at)}</p>
          </div>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit PO Requisition
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="vendor">Vendor</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* PO Requisition Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileBox className="h-5 w-5 text-primary" />
                  Requisition Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requisition ID</p>
                  <p className="text-md font-medium">#{porequisition.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Invoice Number</p>
                  <p className="text-md">{porequisition.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(porequisition.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Withholding Tax</p>
                  <p className="text-md">{porequisition.withholding_tax}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Payment Date</p>
                  <p className="text-md">{formatShortDate(porequisition.expected_payment_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-md">{formatShortDate(porequisition.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-md">{formatShortDate(porequisition.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-lg font-semibold">{porequisition.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approvals</p>
                  <p className="text-lg font-semibold">{porequisition.approvals?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payments</p>
                  <p className="text-lg font-semibold">{porequisition.payments?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Remark */}
          {porequisition.remark && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Remarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{porequisition.remark}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Withholding Tax</p>
                  <p className="text-lg font-semibold">{porequisition.withholding_tax}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Payment Date</p>
                  <p className="text-md">{formatDate(porequisition.expected_payment_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-md">{porequisition.items?.length || 0} item(s)</p>
                </div>
                {porequisition.items && porequisition.items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(
                        porequisition.items.reduce((total, item) => 
                          total + (parseFloat(item.unit_price) * item.quantity), 0
                        ).toString()
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(porequisition.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payments Made</p>
                  <p className="text-lg font-semibold">{porequisition.payments?.length || 0}</p>
                </div>
                {porequisition.payments && porequisition.payments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(
                        porequisition.payments.reduce((total, payment) => 
                          total + parseFloat(payment.amount_paid), 0
                        ).toString()
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vendor Name</p>
                    <p className="text-lg font-medium">{porequisition.vendor_detail?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                    <p className="text-md">{porequisition.vendor_detail?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-md">{porequisition.vendor_detail?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-md">{porequisition.vendor_detail?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                    <p className="text-md">{porequisition.vendor_detail?.registration_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-1">
                      {porequisition.vendor_detail?.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Requisition Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {porequisition.items && porequisition.items.length > 0 ? (
                <div className="space-y-4">
                  {porequisition.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                          <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                          <p className="text-md font-semibold">{formatCurrency(item.unit_price)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total</p>
                          <p className="text-md font-semibold text-green-600">
                            {formatCurrency((parseFloat(item.unit_price) * item.quantity).toString())}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-medium">Total Value:</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(
                          porequisition.items.reduce((total, item) => 
                            total + (parseFloat(item.unit_price) * item.quantity), 0
                          ).toString()
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No items added to this PO requisition</p>
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
              {porequisition.approvals && porequisition.approvals.length > 0 ? (
                <div className="space-y-4">
                  {porequisition.approvals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={approval.approver_detail?.avatar} />
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
                  <p className="text-muted-foreground">No approvals recorded for this PO requisition</p>
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
              {porequisition.comments && porequisition.comments.length > 0 ? (
                <div className="space-y-4">
                  {porequisition.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.user_detail?.avatar} />
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
                  <p className="text-muted-foreground">No comments added to this PO requisition</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Payment Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {porequisition.payments && porequisition.payments.length > 0 ? (
                <div className="space-y-4">
                  {porequisition.payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                          <p className="text-lg font-semibold text-green-600">{formatCurrency(payment.amount_paid)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                          <p className="text-md">{formatShortDate(payment.payment_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                          <p className="text-md font-mono">{payment.reference_number}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Notes</p>
                          <p className="text-md">{payment.notes || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Payment Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-medium">Total Paid:</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(
                          porequisition.payments.reduce((total, payment) => 
                            total + parseFloat(payment.amount_paid), 0
                          ).toString()
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No payments recorded for this PO requisition</p>
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
              {porequisition.attachments && porequisition.attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {porequisition.attachments.map((attachment, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {typeof attachment === 'string' ? attachment.split('/').pop() : `Attachment ${index + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">File attachment</p>
                        </div>
                      </div>
                      {typeof attachment === 'string' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => window.open(attachment, '_blank')}
                        >
                          View File
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No attachments added to this PO requisition</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PorequisitionDetailView;