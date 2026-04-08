import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  FileText,
  Building,
  User,
  Loader2,
  Download,
  Eye,
  Image,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  useInvoiceItemQuery,
  useApproveByReviewerMutation,
  useRejectByReviewerMutation,
  useApproveByApproverMutation,
  useRejectByApproverMutation
} from '@/hooks/invoiceitem/useInvoiceitemQueries';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/formatters';
import InvoiceitemPrintView from './InvoiceitemPrintView';

const InvoiceitemDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve-reviewer' | 'reject-reviewer' | 'approve-approver' | 'reject-approver' | null;
    title: string;
    description: string;
  }>({
    open: false,
    type: null,
    title: '',
    description: '',
  });

  const { data: invoiceItem, isLoading, error } = useInvoiceItemQuery(
    id || ''
  );

  // Mutations
  const approveByReviewerMutation = useApproveByReviewerMutation();
  const rejectByReviewerMutation = useRejectByReviewerMutation();
  const approveByApproverMutation = useApproveByApproverMutation();
  const rejectByApproverMutation = useRejectByApproverMutation();

  // Check if current user is reviewer or approver
  const userId = user?.id ? parseInt(user.id, 10) : 0;
  const isReviewer = invoiceItem?.reviewers?.includes(userId);
  const isApprover = invoiceItem?.approver === userId;
  const isReviewed = invoiceItem?.is_reviewed || false;

  // Check if user can edit (SUPER ADMIN, ADMIN, REQUESTER)
  const canEdit = user?.role === 'SUPER ADMIN' || user?.role === 'ADMIN' || user?.role === 'REQUESTER';

  // Open confirmation dialog
  const openConfirmDialog = (
    type: 'approve-reviewer' | 'reject-reviewer' | 'approve-approver' | 'reject-approver',
    title: string,
    description: string
  ) => {
    setConfirmDialog({ open: true, type, title, description });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, type: null, title: '', description: '' });
  };

  // Handle confirmation action
  const handleConfirmAction = async () => {
    const slug = invoiceItem?.slug || invoiceItem?.id;
    if (!slug) return;

    try {
      switch (confirmDialog.type) {
        case 'approve-reviewer':
          await approveByReviewerMutation.mutateAsync(slug);
          break;
        case 'reject-reviewer':
          await rejectByReviewerMutation.mutateAsync(slug);
          break;
        case 'approve-approver':
          await approveByApproverMutation.mutateAsync(slug);
          break;
        case 'reject-approver':
          await rejectByApproverMutation.mutateAsync(slug);
          break;
      }
      closeConfirmDialog();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  // Format currency amount
  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  // Get file icon based on URL
  const getFileIcon = (fileUrl: string) => {
    const fileName = getFileName(fileUrl);
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-red-500" />;
  };

  // Get file type description
  const getFileType = (fileUrl: string) => {
    const fileName = getFileName(fileUrl);
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'jpg':
      case 'jpeg':
        return 'JPEG Image';
      case 'png':
        return 'PNG Image';
      case 'gif':
        return 'GIF Image';
      case 'webp':
        return 'WebP Image';
      default:
        return 'File';
    }
  };

  // Get file name from URL
  const getFileName = (fileUrl: string) => {
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      return pathname.split('/').pop() || 'download';
    } catch (error) {
      return 'download';
    }
  };

  // View file in new tab
  const handleViewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  // Download file
  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-sm text-gray-600">Loading invoice item...</span>
        </div>
      </div>
    );
  }

  if (error || !invoiceItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load invoice item</p>
          <Button 
            onClick={() => navigate('/dashboard/work/invoice-items')} 
            variant="outline" 
            size="sm"
          >
            Back to Invoice Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/work/invoice-items')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoice Items
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Invoice Item Details
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              II-{invoiceItem.id} • {invoiceItem.invoice_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Reviewer Buttons - Show only if user is a reviewer and not yet reviewed */}
          {isReviewer && !isReviewed && (
            <>
              <Button
                onClick={() =>
                  openConfirmDialog(
                    'approve-reviewer',
                    'Review Invoice',
                    'Are you sure you want to review and approve this invoice? This action will allow the approver to proceed with final approval.'
                  )
                }
                disabled={
                  approveByReviewerMutation.isPending ||
                  rejectByReviewerMutation.isPending
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {approveByReviewerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Review
              </Button>
              <Button
                onClick={() =>
                  openConfirmDialog(
                    'reject-reviewer',
                    'Reject Invoice',
                    'Are you sure you want to reject this invoice? This action will prevent further processing.'
                  )
                }
                disabled={
                  approveByReviewerMutation.isPending ||
                  rejectByReviewerMutation.isPending
                }
                variant="destructive"
              >
                {rejectByReviewerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            </>
          )}

          {/* Approver Buttons - Show only if user is approver and invoice is reviewed */}
          {isApprover && isReviewed && (
            <>
              <Button
                onClick={() =>
                  openConfirmDialog(
                    'approve-approver',
                    'Approve Invoice',
                    'Are you sure you want to approve this invoice? This is the final approval step.'
                  )
                }
                disabled={
                  approveByApproverMutation.isPending ||
                  rejectByApproverMutation.isPending
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {approveByApproverMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
              <Button
                onClick={() =>
                  openConfirmDialog(
                    'reject-approver',
                    'Reject Invoice',
                    'Are you sure you want to reject this invoice as the approver? This will prevent payment processing.'
                  )
                }
                disabled={
                  approveByApproverMutation.isPending ||
                  rejectByApproverMutation.isPending
                }
                variant="destructive"
              >
                {rejectByApproverMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            </>
          )}

          {/* Print/Download Button */}
          <InvoiceitemPrintView invoiceItem={invoiceItem} />

          {/* Edit Button - Only for SUPER ADMIN, ADMIN, REQUESTER */}
          {canEdit && (
            <Button
              onClick={() => navigate(`/dashboard/work/invoice-items/${invoiceItem.slug || invoiceItem.id}/edit`)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Item
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="work-details">Work Details</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Invoice ID</label>
                  <p className="text-base font-medium text-gray-900">II-{invoiceItem.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <p className="text-base font-medium text-gray-900">{invoiceItem.invoice_number}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>
                    <Badge 
                      variant="outline"
                      className={
                        invoiceItem.status === 'Draft' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                        invoiceItem.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                        invoiceItem.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-300' :
                        invoiceItem.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                        'bg-blue-100 text-blue-700 border-blue-300'
                      }
                    >
                      {invoiceItem.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="text-base font-medium text-gray-900">{invoiceItem.currency}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Review Status</label>
                  <div>
                    <Badge 
                      variant={isReviewed ? 'default' : 'secondary'}
                      className={isReviewed ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                    >
                      {isReviewed ? 'Reviewed' : 'Pending Review'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Approval Status</label>
                  <div>
                    <Badge 
                      variant={invoiceItem.is_approved ? 'default' : 'secondary'}
                      className={invoiceItem.is_approved ? 'bg-green-100 text-green-700 border-green-300' : ''}
                    >
                      {invoiceItem.is_approved ? 'Approved' : 'Pending Approval'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Invoice Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-base text-gray-900">
                      {invoiceItem.invoice_date ? formatDate(invoiceItem.invoice_date) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-base text-gray-900">
                      {invoiceItem.due_date ? formatDate(invoiceItem.due_date) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Subtotal</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 text-base px-3 py-1">
                      {invoiceItem.currency} {formatAmount(invoiceItem.subtotal)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Tax Amount</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50 text-base px-3 py-1">
                      {invoiceItem.currency} {formatAmount(invoiceItem.tax_amount)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-lg font-semibold px-3 py-1">
                      {invoiceItem.currency} {formatAmount(invoiceItem.total_amount)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoiceItem.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {invoiceItem.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceItem.items_detail && invoiceItem.items_detail.length > 0 ? (
                <div className="space-y-4">
                  {invoiceItem.items_detail.map((item, index) => (
                    <Card key={item.id} className="bg-gray-50">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-gray-900">
                              {item.item_name}
                            </h4>
                            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-base px-3 py-1 font-semibold">
                              {invoiceItem.currency} {formatAmount(item.amount)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No items found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-details" className="space-y-6">
          {/* Work Order/Completion Information */}
          {invoiceItem.work_order && invoiceItem.work_order_detail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Work Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoiceItem.work_order_detail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Work Order ID</label>
                      <p className="text-base font-medium text-blue-700">
                        WO-{invoiceItem.work_order_detail.work_order_number || invoiceItem.work_order_detail.id}
                      </p>
                    </div>
                    {invoiceItem.work_order_detail.status && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge variant="outline" className="text-sm">
                          {invoiceItem.work_order_detail.status}
                        </Badge>
                      </div>
                    )}
                    {invoiceItem.work_order_detail.priority && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Priority</label>
                        <Badge 
                          variant={
                            invoiceItem.work_order_detail.priority === 'High' ? 'destructive' :
                            invoiceItem.work_order_detail.priority === 'Medium' ? 'default' : 'secondary'
                          }
                          className="text-sm"
                        >
                          {invoiceItem.work_order_detail.priority}
                        </Badge>
                      </div>
                    )}
                    {invoiceItem.work_order_detail.type && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <p className="text-base text-gray-900">{invoiceItem.work_order_detail.type}</p>
                      </div>
                    )}
                  </div>

                  {invoiceItem.work_order_detail.description && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Work Order Description</label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {invoiceItem.work_order_detail.description}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/dashboard/work/orders/${invoiceItem.work_order_detail.slug || invoiceItem.work_order_detail.id}`)}
                      className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    >
                      View Full Work Order
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Work order details not available</p>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Work Completion Information */}
          {invoiceItem.work_completion && invoiceItem.work_completion_detail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-600" />
                  Work Completion Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Completion ID</label>
                    <p className="text-base font-medium text-green-700">
                      {invoiceItem.work_completion_detail.completion_number}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Completion Number</label>
                    <p className="text-base text-gray-900">COMP-{invoiceItem.work_completion_detail.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          {/* Approver Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Approver
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceItem.approver_detail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-base font-medium text-gray-900">
                        {`${invoiceItem.approver_detail.first_name} ${invoiceItem.approver_detail.last_name}`.trim()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <p className="text-base text-gray-900">{invoiceItem.approver_detail.roles || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base text-gray-900">{invoiceItem.approver_detail.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No approver assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Reviewers Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Reviewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceItem.reviewers_detail && invoiceItem.reviewers_detail.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {invoiceItem.reviewers_detail.map((reviewer) => (
                    <div 
                      key={reviewer.id} 
                      className="p-4 border rounded-lg bg-gray-50 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {`${reviewer.first_name} ${reviewer.last_name}`.trim()}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">{reviewer.roles || 'No role assigned'}</p>
                      <p className="text-xs text-gray-500">{reviewer.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviewers assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-6">
          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceItem.attachments_data && invoiceItem.attachments_data.length > 0 ? (
                <div className="space-y-4">
                  {invoiceItem.attachments_data.map((attachment, index) => {
                    const fileName = getFileName(attachment.file);
                    const fileType = getFileType(attachment.file);
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          {getFileIcon(attachment.file)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {fileName}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{fileType}</span>
                              <span>•</span>
                              <span>Content Type: {attachment.content_type}</span>
                              <span>•</span>
                              <span>Object ID: {attachment.object_id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewFile(attachment.file)}
                            className="text-blue-700 border-blue-300 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(attachment.file, fileName)}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No attachments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmDialog.type?.includes('reject')
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoiceitemDetailView;
