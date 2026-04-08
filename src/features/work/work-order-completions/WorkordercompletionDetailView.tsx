import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Edit,
  Eye,
  Download,
  FileText,
  Image,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { 
  useWorkOrderCompletionQuery,
  useApproveByApproverMutation,
  useRejectByApproverMutation,
  useApproveByReviewerMutation,
  useRejectByReviewerMutation
} from '@/hooks/workordercompletion/useWorkordercompletionQueries';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const WorkordercompletionDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [showApproverConfirm, setShowApproverConfirm] = useState(false);
  const [showApproverReject, setShowApproverReject] = useState(false);
  const [showReviewerConfirm, setShowReviewerConfirm] = useState(false);
  const [showReviewerReject, setShowReviewerReject] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Queries and mutations
  const { data: completion, isLoading, error } = useWorkOrderCompletionQuery(Number(id));
  const approveByApproverMutation = useApproveByApproverMutation();
  const rejectByApproverMutation = useRejectByApproverMutation();
  const approveByReviewerMutation = useApproveByReviewerMutation();
  const rejectByReviewerMutation = useRejectByReviewerMutation();

  // Check user role
  const userRole = user?.role || '';
  const isApprover = userRole.toUpperCase().includes('APPROVER');
  const isReviewer = userRole.toUpperCase().includes('REVIEWER');

  // Handle approve by approver
  const handleApproveByApprover = async () => {
    if (!completion) return;
    try {
      await approveByApproverMutation.mutateAsync(completion.id);
      setShowApproverConfirm(false);
    } catch (error) {
      console.error('Failed to approve work order completion:', error);
    }
  };

  // Handle reject by approver
  const handleRejectByApprover = async () => {
    if (!completion) return;
    try {
      await rejectByApproverMutation.mutateAsync({ id: completion.id, notes: rejectionNotes });
      setShowApproverReject(false);
      setRejectionNotes('');
    } catch (error) {
      console.error('Failed to reject work order completion:', error);
    }
  };

  // Handle approve by reviewer
  const handleApproveByReviewer = async () => {
    if (!completion) return;
    try {
      await approveByReviewerMutation.mutateAsync(completion.id);
      setShowReviewerConfirm(false);
    } catch (error) {
      console.error('Failed to review work order completion:', error);
    }
  };

  // Handle reject by reviewer
  const handleRejectByReviewer = async () => {
    if (!completion) return;
    try {
      await rejectByReviewerMutation.mutateAsync({ id: completion.id, notes: rejectionNotes });
      setShowReviewerReject(false);
      setRejectionNotes('');
    } catch (error) {
      console.error('Failed to reject work order completion:', error);
    }
  };

  // Get due status badge
  const getDueStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'on time':
      case 'ontime':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">On Time</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">Upcoming</Badge>;
      case 'future':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">Future</Badge>;
      case 'due within 1 week':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">Due Within 1 Week</Badge>;
      case 'due today':
        return <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-300">Due Today</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  // Get approval status badge
  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'Pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get file icon based on URL
  const getFileIcon = (fileUrl: string) => {
    const fileName = getFileName(fileUrl);
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (['pdf'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !completion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load work order completion</p>
          <Button 
            onClick={() => navigate('/dashboard/work/work-order-completions')} 
            variant="outline" 
            size="sm"
          >
            Back to List
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
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/work/work-order-completions')}
            className="text-green-700 hover:text-green-800 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Work Order Completions
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {/* Reviewer buttons - only visible to reviewers */}
          {isReviewer && completion.approval_status === 'Pending' && (
            <>
              <Button
                onClick={() => setShowReviewerConfirm(true)}
                disabled={approveByReviewerMutation.isPending || completion?.is_reviewed}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {approveByReviewerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle className="h-4 w-4 mr-2" />
                {completion?.is_reviewed ? 'Reviewed' : 'Review'}
              </Button>
              <Button
                onClick={() => setShowReviewerReject(true)}
                disabled={rejectByReviewerMutation.isPending || completion?.is_reviewed}
                size="sm"
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-50 disabled:opacity-50"
              >
                {rejectByReviewerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <XCircle className="h-4 w-4 mr-2" />
                Reject Review
              </Button>
            </>
          )}
          
          {/* Approver buttons - only visible to approvers and only if reviewed */}
          {isApprover && completion.approval_status === 'Pending' && completion?.is_reviewed && (
            <>
              <Button
                onClick={() => setShowApproverConfirm(true)}
                disabled={approveByApproverMutation.isPending || completion?.approval_status === 'Approved'}
                size="sm"
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {approveByApproverMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle className="h-4 w-4 mr-2" />
                {completion.approval_status === 'Approved' ? 'Approved' : 'Approve'}
              </Button>
              <Button
                onClick={() => setShowApproverReject(true)}
                disabled={rejectByApproverMutation.isPending || completion.approval_status === 'Approved'}
                size="sm"
                variant="destructive"
              >
                {rejectByApproverMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          
          <Button
            onClick={() => navigate(`/dashboard/work/work-order-completions/${completion.id}/edit`)}
            size="sm"
            variant="outline"
            className="text-green-700 border-green-300 hover:bg-green-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900 mb-2">
                Work Order Completion #{completion.id}
              </CardTitle>
              <div className="flex items-center gap-4">
                {getApprovalStatusBadge(completion.approval_status)}
                {completion.due_status && getDueStatusBadge(completion.due_status)}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p className="font-medium">Created: {formatDate(completion.created_at)}</p>
              <p>Updated: {formatDate(completion.updated_at)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="work-order" className="text-sm">Work Order Details</TabsTrigger>
          <TabsTrigger value="resources" className="text-sm">Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900 mt-1">#{completion.id}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Work Order</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {completion.work_order_detail 
                      ? `WO-${completion.work_order_detail.work_order_number || completion.work_order_detail.id}`
                      : `WO-${completion.work_order}`}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Approval Status</label>
                  <div className="mt-1">{getApprovalStatusBadge(completion.approval_status)}</div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Due Status</label>
                  <div className="mt-1">{getDueStatusBadge(completion.due_status)}</div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Owner</label>
                  <p className="text-sm text-gray-900 mt-1">User ID: {completion.owner}</p>
                </div>
              </CardContent>
            </Card>

            {/* Approver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Approver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {completion.approver_detail ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {`${completion.approver_detail.first_name} ${completion.approver_detail.last_name}`.trim()}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="text-sm text-gray-900 mt-1">{completion.approver_detail.roles || 'N/A'}</p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900 mt-1">{completion.approver_detail.email}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No approver assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Reviewers Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Reviewers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completion.reviewers_detail && completion.reviewers_detail.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completion.reviewers_detail.map((reviewer) => (
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

            {/* Timeline & Dates */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {completion.start_date ? formatDate(completion.start_date) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {completion.due_date ? formatDate(completion.due_date) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(completion.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(completion.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved By (if different from approver) */}
            {completion.approved_by_detail && completion.approved_by !== completion.approver && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Approved By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {`${completion.approved_by_detail.first_name} ${completion.approved_by_detail.last_name}`.trim()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="text-sm text-gray-900 mt-1">{completion.approved_by_detail.roles || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900 mt-1">{completion.approved_by_detail.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Work Order Details Tab */}
        <TabsContent value="work-order" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Work Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completion.work_order_detail ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Work Order ID</label>
                    <p className="text-sm text-gray-900 mt-1">
                      WO-{completion.work_order_detail.work_order_number || completion.work_order_detail.id}
                    </p>
                  </div>
                  {completion.work_order_detail.title && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <p className="text-sm text-gray-900 mt-1">{completion.work_order_detail.title}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {completion.work_order_detail.description || 'No description available'}
                    </p>
                  </div>
                  {completion.work_order_detail.priority && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <p className="text-sm text-gray-900 mt-1">{completion.work_order_detail.priority}</p>
                    </div>
                  )}
                  {completion.work_order_detail.status && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Work Order Status</label>
                      <p className="text-sm text-gray-900 mt-1">{completion.work_order_detail.status}</p>
                    </div>
                  )}
                  {completion.work_order_detail.cost && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cost</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {completion.work_order_detail.currency || ''} {completion.work_order_detail.cost}
                      </p>
                    </div>
                  )}
                  {completion.work_order_detail.asset && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Asset</label>
                      <p className="text-sm text-gray-900 mt-1">Asset ID: {completion.work_order_detail.asset}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Work order details not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Attached Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {completion.resources_data && completion.resources_data.length > 0 ? (
                <div className="space-y-4">
                  {completion.resources_data.map((resource, index) => {
                    const fileName = getFileName(resource.file);
                    const fileType = getFileType(resource.file);
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          {getFileIcon(resource.file)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {fileName}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{fileType}</span>
                              <span>•</span>
                              <span>Content Type: {resource.content_type}</span>
                              <span>•</span>
                              <span>Object ID: {resource.object_id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewFile(resource.file)}
                            className="text-blue-700 border-blue-300 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(resource.file, fileName)}
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
                  <p className="text-sm text-gray-500">No resources attached</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approver Confirmation Modal */}
      <AlertDialog open={showApproverConfirm} onOpenChange={setShowApproverConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Work Order Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this work order completion? This action will mark it as approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveByApprover}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approver Rejection Dialog */}
      <Dialog open={showApproverReject} onOpenChange={setShowApproverReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Work Order Completion</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this work order completion (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection notes..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproverReject(false);
                setRejectionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectByApprover}
              disabled={rejectByApproverMutation.isPending}
            >
              {rejectByApproverMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviewer Confirmation Modal */}
      <AlertDialog open={showReviewerConfirm} onOpenChange={setShowReviewerConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review Work Order Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this work order completion as reviewed? This will allow the approver to proceed with approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveByReviewer}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reviewer Rejection Dialog */}
      <Dialog open={showReviewerReject} onOpenChange={setShowReviewerReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this work order completion (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection notes..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewerReject(false);
                setRejectionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectByReviewer}
              disabled={rejectByReviewerMutation.isPending}
            >
              {rejectByReviewerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkordercompletionDetailView; 