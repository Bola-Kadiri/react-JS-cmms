import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Edit,
  FileText,
  FileBox,
  CalendarDays,
  Briefcase,
  Banknote,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Receipt,
} from 'lucide-react';
import PaymentRequisitionDetailView from '@/features/work/paymentrequisitions/PaymentrequisitionDetailView';
import {
  useWorkOrderCompletionQuery,
  useApproveByApproverMutation,
  useRejectByApproverMutation,
  useApproveByReviewerMutation,
  useRejectByReviewerMutation
} from '@/hooks/workordercompletion/useWorkordercompletionQueries';
import { formatDate } from '@/utils/formatters';
import Stage3Panel from './components/Stage3Panel';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
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

const PIPELINE_STEPS = [
  { label: 'Pending', status: 'Pending' },
  { label: 'Reviewed', status: 'Reviewed' },
  { label: 'Approved', status: 'Approved' },
];

const WCC_REJECTED_STATUSES = ['Reviewer Rejected', 'Approver Rejected'];

interface WorkordercompletionDetailViewProps {
  // Lets this same component render nested inside a Work Order's "Work
  // Completion Certificate" accordion section instead of only as its own
  // routed page. Falls back to the route param when omitted.
  idProp?: string;
  embedded?: boolean;
}

const WorkordercompletionDetailView = ({ idProp, embedded = false }: WorkordercompletionDetailViewProps = {}) => {
  const { id: idParam } = useParams<{ id: string }>();
  const id = idProp ?? idParam;
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const { userRole } = usePermissions();
  const isReviewer = userRole === 'REVIEWER' || userRole === 'ADMIN' || userRole === 'SUPER ADMIN';
  const isApprover = userRole === 'APPROVER' || userRole === 'ADMIN' || userRole === 'SUPER ADMIN';
  const isOwner = completion?.owner === Number(user?.id);
  const isRequester = userRole === 'REQUESTER';
  // Five-stage flow: the Stage 3 panel replaces the original pipeline and actions.
  const isFiveStage = (completion as any)?.flow === 'five_stage';

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

  const formatCurrency = (cost: string, currency: string) => {
    if (!cost) return 'N/A';
    const amount = parseFloat(cost);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 2 }).format(amount);
  };

  // Count of approval STEPS actually completed on THIS WCC's own chain
  // (separate from the Work Order's own Approval section one level up) —
  // 0 until its Reviewer actually acts, even if routing was assigned
  // earlier.
  const APPROVAL_STEPS_DONE: Record<string, number> = {
    'Pending': 0,
    'Reviewer Rejected': 1,
    'Reviewed': 1,
    'Approver Rejected': 2,
    'Approved': 2,
  };
  const approvalCount = APPROVAL_STEPS_DONE[completion.approval_status] ?? 0;

  const workOrder = completion.work_order_detail;
  const sourceWr = workOrder?.source_work_request_detail;
  const quotationItems = sourceWr?.quotation_items ?? [];

  // WCC's own uploaded files, plus everything already inherited at the Work
  // Order level (which itself already carries the source Work Request's PO/
  // invoice/attachment) — so nothing here looks empty just because a file
  // lives one or two levels up the chain.
  const attachments = [
    ...(completion.resources_data || []).map((r, i) => ({
      label: getFileName(r.file) || `attachment-${i + 1}`,
      url: r.file,
    })),
    ...(sourceWr?.po_document ? [{ label: 'PO Document', url: sourceWr.po_document }] : []),
    ...(sourceWr?.vendor_invoice ? [{ label: 'Vendor Invoice', url: sourceWr.vendor_invoice }] : []),
    ...(sourceWr?.attachment ? [{ label: 'Attachment', url: sourceWr.attachment }] : []),
    ...(workOrder?.resources_data || []).map((r, i) => ({
      label: r.file.split('/').pop() || `wo-attachment-${i + 1}`,
      url: r.file,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!embedded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/work/work-order-completions')}
              className="text-green-700 hover:text-green-800 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Order Completions
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Reviewer buttons - only visible to reviewers */}
          {!isFiveStage && (isReviewer || completion.reviewers?.includes(Number(user?.id))) && completion.approval_status === 'Pending' && (
            <>
              <Button
                onClick={() => setShowReviewerConfirm(true)}
                disabled={approveByReviewerMutation.isPending || completion?.is_reviewed}
                size="sm"
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
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
          {!isFiveStage && (isApprover || completion.approver === Number(user?.id)) && completion.approval_status === 'Reviewed' && (
            <>
              <Button
                onClick={() => setShowApproverConfirm(true)}
                disabled={approveByApproverMutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {approveByApproverMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => setShowApproverReject(true)}
                disabled={rejectByApproverMutation.isPending}
                size="sm"
                variant="destructive"
              >
                {rejectByApproverMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          
          {!isFiveStage && (
          <Button
            onClick={() => navigate(`/dashboard/work/work-order-completions/${completion.id}/edit`)}
            size="sm"
            variant="outline"
            className="text-green-700 border-green-300 hover:bg-green-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          )}
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

      {/* Pipeline stepper — visible to owner, requester */}
      {isFiveStage ? (
        <Stage3Panel id={completion.id} />
      ) : (isOwner || isRequester) && (() => {
        const isRejected = WCC_REJECTED_STATUSES.includes(completion.approval_status);
        const order = ['Pending', 'Reviewed', 'Approved'];
        const currentStep = order.indexOf(completion.approval_status) >= 0 ? order.indexOf(completion.approval_status) : 0;
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2 shadow-sm">
            <div className="flex items-center justify-between">
              {PIPELINE_STEPS.map((step, idx) => {
                const isActive = completion.approval_status === step.status;
                const isPast = !isRejected && currentStep > idx;
                const isFullyApproved = completion.approval_status === 'Approved';
                return (
                  <div key={step.status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${isFullyApproved || isPast || isActive ? 'bg-green-600 text-white' :
                          isRejected && currentStep <= idx ? 'bg-red-100 text-red-400' :
                          'bg-gray-200 text-gray-500'}`}>
                        {(isFullyApproved && idx < 3) || isPast ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className={`text-xs mt-1 text-center font-medium
                        ${isActive || isPast || isFullyApproved ? 'text-green-700' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 ${isPast || isFullyApproved ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {isRejected && (
              <p className="text-xs text-red-600 text-center mt-2 font-medium">
                Pipeline paused — {completion.approval_status}
              </p>
            )}
          </div>
        );
      })()}

      <Accordion type="multiple" defaultValue={['detail']} className="w-full space-y-3">
        {/* ── Detail ─────────────────────────────────────────────────── */}
        <AccordionItem value="detail" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <FileText className="h-5 w-5" />Detail (1)
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Description</p>
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border">
                {workOrder?.description || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">About</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">WCC Number</p><p className="font-mono font-semibold text-gray-900">WCC-{completion.wcc_number || completion.id}</p></div>
                  <div><p className="text-sm text-gray-500">Approval Status</p>{getApprovalStatusBadge(completion.approval_status)}</div>
                  <div><p className="text-sm text-gray-500">Due Status</p>{getDueStatusBadge(completion.due_status)}</div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Timeline</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Start Date</p><p className="font-medium text-gray-900">{completion.start_date ? formatDate(completion.start_date) : 'Not set'}</p></div>
                  <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium text-gray-900">{completion.due_date ? formatDate(completion.due_date) : 'Not set'}</p></div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Work Order</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Number</p><p className="font-mono font-medium text-gray-900">{workOrder?.work_order_number ? `WO-${workOrder.work_order_number}` : 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-500">Category</p><p className="font-medium text-gray-900">{workOrder?.category_detail?.name || 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-500">Facility</p><p className="font-medium text-gray-900">{workOrder?.facility_detail?.name || 'N/A'}</p></div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Resource ───────────────────────────────────────────────── */}
        {/* The Work Order's own vendor/technician — who actually did the
            work this certificate is certifying. */}
        <AccordionItem value="resource" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <Briefcase className="h-5 w-5" />Resource ({(workOrder?.vendor_detail ? 1 : 0) + (workOrder?.technician_detail ? 1 : 0)})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Vendor</p>
                {workOrder?.vendor_detail ? (
                  <div>
                    <p className="font-semibold text-gray-900">{workOrder.vendor_detail.name}</p>
                    {workOrder.vendor_detail.email && <p className="text-sm text-gray-500">{workOrder.vendor_detail.email}</p>}
                  </div>
                ) : <p className="text-sm text-gray-500">No vendor selected</p>}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Technician</p>
                {workOrder?.technician_detail ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={(workOrder.technician_detail as any).avatar} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-xs">
                        {`${(workOrder.technician_detail.first_name || '').charAt(0)}${(workOrder.technician_detail.last_name || '').charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{`${workOrder.technician_detail.first_name} ${workOrder.technician_detail.last_name}`}</p>
                      <p className="text-sm text-gray-600">{workOrder.technician_detail.email}</p>
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-500">No technician assigned</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Approval ───────────────────────────────────────────────── */}
        {/* This WCC's own Reviewer/Approver chain — separate from the Work
            Order's own Approval section one level up. */}
        <AccordionItem value="approval" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <CheckCircle className="h-5 w-5" />Approval ({approvalCount})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            {approvalCount === 0 ? (
              <p className="text-sm text-gray-400">No approvals yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {approvalCount >= 1 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Reviewer(s)</p>
                    {completion.reviewers_detail && completion.reviewers_detail.length > 0 ? (
                      <div className="space-y-2">
                        {completion.reviewers_detail.map((u: any) => (
                          <div key={u.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border">
                            <Avatar className="h-8 w-8"><AvatarImage src={u.avatar} /><AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{`${(u.first_name || '').charAt(0)}${(u.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                            <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p><p className="text-xs text-gray-500 truncate">{u.email}</p></div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-gray-400">Not assigned</p>}
                  </div>
                )}
                {approvalCount >= 2 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Approver</p>
                    {completion.approver_detail ? (
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border">
                        <Avatar className="h-8 w-8"><AvatarImage src={(completion.approver_detail as any).avatar} /><AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{`${(completion.approver_detail.first_name || '').charAt(0)}${(completion.approver_detail.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                        <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{completion.approver_detail.first_name} {completion.approver_detail.last_name}</p><p className="text-xs text-gray-500 truncate">{completion.approver_detail.email}</p></div>
                      </div>
                    ) : <p className="text-sm text-gray-400">Not assigned</p>}
                  </div>
                )}
              </div>
            )}
            {completion.approved_by_detail && completion.approved_by !== completion.approver && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Approved By</p>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border max-w-sm">
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{`${(completion.approved_by_detail.first_name || '').charAt(0)}${(completion.approved_by_detail.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                  <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{completion.approved_by_detail.first_name} {completion.approved_by_detail.last_name}</p><p className="text-xs text-gray-500 truncate">{completion.approved_by_detail.email}</p></div>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Quotation ──────────────────────────────────────────────── */}
        {/* Carried forward from the Work Order's own Quotation — which
            itself already carries it from the source Work Request. */}
        <AccordionItem value="quotation" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <Banknote className="h-5 w-5" />Quotation ({quotationItems.length})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            {sourceWr?.po_number && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-700 mb-2 uppercase">Purchase Order</p>
                <p className="text-lg font-bold text-gray-900 font-mono">{sourceWr.po_number}</p>
              </div>
            )}
            {quotationItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-4">Description</th>
                      <th className="pb-2 pr-4">Qty</th>
                      {!isRequester && <th className="pb-2 pr-4">Cost to Alphamead</th>}
                      <th className="pb-2 pr-4">Cost to Client</th>
                      <th className="pb-2">VAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationItems.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{item.description}</td>
                        <td className="py-2 pr-4">{item.quantity}</td>
                        {!isRequester && (
                          <td className="py-2 pr-4">
                            {item.unit_cost_vendor != null ? formatCurrency(item.unit_cost_vendor, workOrder?.currency || 'NGN') : '—'}
                          </td>
                        )}
                        <td className="py-2 pr-4">{formatCurrency(item.unit_cost_client, workOrder?.currency || 'NGN')}</td>
                        <td className="py-2">{item.add_vat ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No quotation lines on the source Work Request.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Comments ───────────────────────────────────────────────── */}
        <AccordionItem value="comments" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold"><FileText className="h-5 w-5" />Comments (0)</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-sm text-gray-400">No comments on this WCC yet.</p>
          </AccordionContent>
        </AccordionItem>

        {/* ── WCC File attachments ──────────────────────────────────── */}
        <AccordionItem value="attachments" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <FileBox className="h-5 w-5" />WCC File attachments ({attachments.length})
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((a, i) => (
                  <a
                    key={`${a.label}-${i}`}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-700 underline font-medium p-2 rounded-lg hover:bg-green-50"
                  >
                    <FileText className="h-4 w-4" /> {a.label}
                  </a>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No files attached.</p>}
          </AccordionContent>
        </AccordionItem>

        {/* ── History ────────────────────────────────────────────────── */}
        <AccordionItem value="history" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <CalendarDays className="h-5 w-5" />History (3)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
                  <div className="w-px h-12 bg-gray-300 mt-2" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Submitted</h3>
                  <time className="text-sm text-gray-500">{formatDate(completion.created_at)}</time>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100"><Clock className="h-5 w-5 text-green-600" /></div>
                  <div className="w-px h-12 bg-gray-300 mt-2" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Last Updated</h3>
                  <time className="text-sm text-gray-500">{formatDate(completion.updated_at)}</time>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    completion.approval_status === 'Approved' ? 'bg-green-100' :
                    WCC_REJECTED_STATUSES.includes(completion.approval_status) ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {completion.approval_status === 'Approved'
                      ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                      : WCC_REJECTED_STATUSES.includes(completion.approval_status) ? <XCircle className="h-5 w-5 text-red-600" />
                      : <Clock className="h-5 w-5 text-yellow-600" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Current Status</h3>
                  <div className="mt-1">{getApprovalStatusBadge(completion.approval_status)}</div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Payment Requisition ────────────────────────────────────── */}
        {/* A real extension of this WCC once it's Approved: nests the full
            Payment Requisition page inline instead of linking away,
            matching how this WCC itself nests inside its Work Order. */}
        <AccordionItem value="payment-requisition" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <Receipt className="h-5 w-5" />
              Payment Requisition
              {workOrder?.linked_payment_requisition
                ? <span className="font-mono">— {workOrder.linked_payment_requisition.requisition_number}</span>
                : ' (0)'}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            {completion.approval_status === 'Approved' && workOrder?.linked_payment_requisition ? (
              <PaymentRequisitionDetailView
                idProp={String(workOrder.linked_payment_requisition.id)}
                embedded
              />
            ) : (
              <p className="text-sm text-gray-400">No Payment Requisition raised yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
              className="bg-green-600 hover:bg-green-700"
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