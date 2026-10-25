import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  ArrowLeft,
  Edit,
  Loader2,
  AlertTriangle,
  Banknote,
  User,
  Briefcase,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileText,
  FileBox,
  CalendarDays,
  MapPin,
  ShieldCheck,
  ClipboardCheck,
  Receipt,
  Clock,
} from 'lucide-react';
import { useWorkorderQuery, useUnlockResubmission, useCreatePaymentRequisitionFromWorkorder } from '@/hooks/workorder/useWorkorderQueries';
import Stage2Panel from './components/Stage2Panel';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';
import WorkorderPrintView from './WorkorderPrintView';
import { WorkorderApprovalForm, WorkorderApprovalAction } from './WorkorderApprovalForm';
import { WorkorderCloseForm } from './WorkorderCloseForm';
import { WorkorderRoutingForm } from './WorkorderRoutingForm';
import WorkordercompletionDetailView from '@/features/work/work-order-completions/WorkordercompletionDetailView';

const PIPELINE_STEPS = [
  { label: 'Pending', status: 'Pending' },
  { label: 'Reviewed', status: 'Reviewed' },
  { label: 'Approved', status: 'Approved' },
];

// New Raise Payment bills: Approver → Reviewer → (second approver for large bills).
const APPROVER_FIRST_STEPS = [
  { label: 'Pending', status: 'Pending' },
  { label: 'Approver Approved', status: 'Approver Approved' },
  { label: 'Reviewed', status: 'Awaiting Final Approval' },
  { label: 'Approved', status: 'Approved' },
];

const REJECTED_STATUSES = ['Reviewer Rejected', 'Approver Rejected', 'Final Approver Rejected'];

interface WorkorderDetailViewProps {
  // Lets this same component render nested inside a Work Request's "Past
  // work order" accordion section instead of only as its own routed page.
  // Falls back to the route param when omitted, so the standalone page
  // (including entry points with no parent Work Request, e.g. PPM-sourced
  // work orders) keeps working exactly as before.
  slugProp?: string;
  embedded?: boolean;
}

const WorkorderDetailView = ({ slugProp, embedded = false }: WorkorderDetailViewProps = {}) => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugProp ?? slugParam;
  const navigate = useNavigate();
  const { userRole } = usePermissions();
  const { user } = useAuth();
  const currentUserId = Number(user?.id);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<WorkorderApprovalAction>('reviewer-approve');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);

  // Using our custom hook instead of direct query
  const {
    data: workorder,
    isLoading,
    isError,
    error
  } = useWorkorderQuery(slug);

  const unlockResubmissionMutation = useUnlockResubmission(slug);
  const createPaymentRequisitionMutation = useCreatePaymentRequisitionFromWorkorder(slug);

  const handleBack = () => {
    navigate('/dashboard/work/orders');
  };

  const handleEdit = (slug: string) => {
    navigate(`/dashboard/work/orders/edit/${slug}`);
  };

  const openApprovalModal = (action: WorkorderApprovalAction) => {
    setApprovalAction(action);
    setIsApprovalModalOpen(true);
  };

  const getPipelineStep = (currentStatus: string, steps = PIPELINE_STEPS): number => {
    const idx = steps.findIndex((step) => step.status === currentStatus);
    return idx >= 0 ? idx : 0;
  };

  // Get priority badge styles
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">{priority}</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{priority}</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{priority}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Get type badge styles
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FROM-PPM':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">From PPM</Badge>;
      case 'FROM-WORK-REQUEST':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">From Work Request</Badge>;
      case 'RAISE-PAYMENT':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Raise Payment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (cost: string, currency: string) => {
    if (!cost) return 'N/A';
    const amount = parseFloat(cost);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Reviewed': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Reviewer Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Approver Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Approver Approved': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Awaiting Final Approval': 'bg-amber-100 text-amber-800 border-amber-200',
      'Final Approver Rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <Badge variant="outline" className={`${map[status] || 'bg-gray-100 text-gray-800 border-gray-200'} font-medium`}>
        {status}
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-green-600">Loading work order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading work order details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Work Orders
        </Button>
      </div>
    );
  }

  if (!workorder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Work order not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Work Orders
        </Button>
      </div>
    );
  }

  const isOwner = !!(user && workorder && workorder.requester === (user as any).id);
  // Five-stage flow: the Stage 2 panel replaces the original pipeline, banners and actions.
  const isFiveStage = (workorder as any).flow === 'five_stage';
  const isAdmin = ['SUPER ADMIN', 'ADMIN'].includes(userRole);
  const isRaisePaymentRequester = workorder.type === 'RAISE-PAYMENT' && userRole === 'REQUESTER';
  // Raise Payment — known-cost bill (EKEDC, waste…): no WCC; approval raises the payment
  // requisition already approved, and Finance's disbursement closes it all. Raise
  // Payment work orders from before this flow have no payee and keep the WCC flow.
  const isKnownCost = workorder.type === 'RAISE-PAYMENT' && !!workorder.payee;
  const knownCostPayment = isKnownCost ? workorder.linked_payment_requisition : null;
  const isRejected = REJECTED_STATUSES.includes(workorder.approval_status);
  // New Raise Payment bills: Approver first, then Reviewer, then (₦1,000,000 or
  // more) the second approver. `next_step` from the backend says who acts next.
  const isApproverFirst = workorder.approval_route === 'APPROVER_FIRST';
  const pipelineSteps = isApproverFirst
    ? APPROVER_FIRST_STEPS.filter((step) => workorder.needs_second_approval || step.status !== 'Awaiting Final Approval')
    : PIPELINE_STEPS;
  const currentStep = getPipelineStep(workorder.approval_status, pipelineSteps);
  const canActAsApprover = ['APPROVER', 'ADMIN', 'SUPER ADMIN'].includes(userRole) || workorder.approver === currentUserId;
  const canActAsReviewer = ['REVIEWER', 'ADMIN', 'SUPER ADMIN'].includes(userRole) || !!workorder.reviewers?.includes(currentUserId);
  const isFinalApprover = !!workorder.final_approver && workorder.final_approver === currentUserId;
  // Routing (reviewer/approver) can be assigned/changed by the Requester (or
  // Admin) any time before the work order reaches a terminal state — matches
  // the backend's own gate on assign-routing.
  const canAssignRouting = (isOwner || isAdmin) && workorder.approval_status !== 'Approved' && !isRejected;
  // Once Approved, WCC is the next (and only remaining) thing to add — no
  // WCC yet, or the last one was rejected and needs resubmitting.
  const needsWccAction = !isKnownCost && workorder.approval_status === 'Approved' && (
    !workorder.latest_completion || workorder.latest_completion.approval_status.includes('Rejected')
  );

  // Count of approval STEPS actually completed (Reviewer → Approver), not
  // who's merely assigned — 0 until the Reviewer actually acts, even if
  // routing was assigned earlier. Mirrors the same pattern on Work Request.
  const APPROVAL_STEPS_DONE: Record<string, number> = {
    'Pending': 0,
    'Reviewer Rejected': 1,
    'Reviewed': 1,
    'Approver Rejected': 2,
    'Approved': 2,
    // Approver-first Raise Payment: the Approver acts first.
    'Approver Approved': 1,
    'Awaiting Final Approval': 2,
    'Final Approver Rejected': 2,
  };
  const approvalCount = APPROVAL_STEPS_DONE[workorder.approval_status] ?? 0;
  const isRequesterView = userRole === 'REQUESTER';
  // Files never get re-uploaded onto the Work Order — this combines its own
  // resources with the PO/invoice/attachment already on the source Work
  // Request, so nothing looks empty just because it lives one level up.
  const sourceWr = workorder.source_work_request_detail;
  const attachments = [
    ...(sourceWr?.po_document ? [{ label: 'PO Document', url: sourceWr.po_document }] : []),
    ...(sourceWr?.vendor_invoice ? [{ label: 'Vendor Invoice', url: sourceWr.vendor_invoice }] : []),
    ...(sourceWr?.attachment ? [{ label: 'Attachment', url: sourceWr.attachment }] : []),
    ...(workorder.resources_data || []).map((r, i) => ({
      label: r.file.split('/').pop() || `attachment-${i + 1}`,
      url: r.file,
    })),
  ];
  const historyEntries = 3; // Submitted / Last Updated / Current Status — always present

  return (
    <div className={embedded ? '' : 'container mx-auto py-6'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {!embedded && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="border-green-200 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-green-800">Work Order #{workorder.work_order_number}</h1>
            <p className="text-green-600 text-sm">Created on {format(new Date(workorder.created_at), 'PPP')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {getTypeBadge(workorder.type)}
              {workorder.priority && getPriorityBadge(workorder.priority)}
            </div>
            {!isFiveStage && workorder.cost && workorder.currency && (
              <div className="text-right">
                <p className="text-lg font-semibold text-green-700">
                  {formatCurrency(workorder.cost, workorder.currency)}
                </p>
                <p className="text-xs text-green-500">Total Cost</p>
              </div>
            )}
          </div>
          
          {/* New Raise Payment bills: buttons for whoever acts next (Approver → Reviewer → second approver) */}
          {isApproverFirst && workorder.next_step === 'approver' && canActAsApprover && (
            <div className="flex gap-2">
              <Button onClick={() => openApprovalModal('approver-approve')} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button onClick={() => openApprovalModal('approver-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
          {isApproverFirst && workorder.next_step === 'reviewer' && canActAsReviewer && (
            <div className="flex gap-2">
              <Button onClick={() => openApprovalModal('reviewer-approve')} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Review
              </Button>
              <Button onClick={() => openApprovalModal('reviewer-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
          {isApproverFirst && workorder.next_step === 'final_approver' && isFinalApprover && (
            <div className="flex gap-2">
              <Button onClick={() => openApprovalModal('final-approve')} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Give Final Approval
              </Button>
              <Button onClick={() => openApprovalModal('final-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {/* Reviewer action buttons — shown when not yet reviewed and user is a reviewer */}
          {!isFiveStage && !isApproverFirst && !workorder.is_reviewed && (
            userRole === 'REVIEWER' ||
            userRole === 'ADMIN' ||
            userRole === 'SUPER ADMIN' ||
            workorder.reviewers?.includes(currentUserId)
          ) && (
            <div className="flex gap-2">
              <Button
                onClick={() => openApprovalModal('reviewer-approve')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Review
              </Button>
              <Button
                onClick={() => openApprovalModal('reviewer-reject')}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {/* Approver action buttons — shown after review and user is the approver */}
          {!isFiveStage && !isApproverFirst && workorder.is_reviewed && !workorder.is_approved && (
            userRole === 'APPROVER' ||
            userRole === 'ADMIN' ||
            userRole === 'SUPER ADMIN' ||
            workorder.approver === currentUserId
          ) && (
            <div className="flex gap-2">
              <Button
                onClick={() => openApprovalModal('approver-approve')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => openApprovalModal('approver-reject')}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {/* Close Work Order — shown once fully approved and not yet closed.
              Requires an approved WCC AND a fully-approved linked Payment
              Requisition to already exist; the backend enforces both, but
              we pre-check here too so the trigger is disabled with a clear
              reason instead of letting the dialog fail on submit. */}
          {!isFiveStage && !isKnownCost && workorder.approval_status === 'Approved' && workorder.work_status !== 'closed' && (
            userRole === 'APPROVER' ||
            userRole === 'ADMIN' ||
            userRole === 'SUPER ADMIN' ||
            workorder.approver === currentUserId
          ) && (() => {
            const closeBlockedReason =
              !workorder.latest_completion || workorder.latest_completion.approval_status !== 'Approved'
                ? 'An approved Work Completion Certificate is required before closing.'
                : !workorder.linked_payment_requisition
                ? 'A Payment Requisition must be raised and fully approved before closing.'
                : workorder.linked_payment_requisition.approval_status !== 'approve'
                ? 'The linked Payment Requisition must be fully approved before closing.'
                : null;
            return (
              <Button
                onClick={() => setIsCloseModalOpen(true)}
                disabled={!!closeBlockedReason}
                title={closeBlockedReason || undefined}
                className="bg-green-700 hover:bg-green-800 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Close Work Order
              </Button>
            );
          })()}

          {/* Requester: the one thing they still need to do, right at the
              top — add Reviewer + Approver first, then (once this work
              order is Approved) add the WCC. Neither action touches any
              other field on this record, so nothing already entered is
              ever at risk of being lost. */}
          {!isFiveStage && (isOwner || isAdmin) && canAssignRouting && (
            <Button
              onClick={() => setIsRoutingModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              {workorder.reviewers_detail?.length || workorder.approver_detail ? 'Change' : 'Add'} Reviewer &amp; Approver
            </Button>
          )}
          {!isFiveStage && (isOwner || isAdmin) && !canAssignRouting && needsWccAction && (
            <Button
              onClick={() => navigate(`/dashboard/work/work-order-completions/new?work_order=${workorder.id}`)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              {workorder.latest_completion ? 'Submit New WCC' : 'Add WCC'}
            </Button>
          )}

          {/* Print/Download Button */}
          <WorkorderPrintView workorder={workorder} />

          {/* An approved Raise Payment is locked (its payment is already raised). */}
          {!isFiveStage && !(isKnownCost && workorder.approval_status === 'Approved') && (
            <PermissionGuard feature='work_order' permission='edit'>
              <Button
                onClick={() => handleEdit(workorder.slug)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Work Order
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {isFiveStage ? (
        <Stage2Panel slug={workorder.slug} number={workorder.work_order_number} />
      ) : (<>
      {/* Pipeline stepper — visible to owner (requester), admin, and RAISE-PAYMENT requester */}
      {(isOwner || isAdmin || isRaisePaymentRequester) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            {pipelineSteps.map((step, idx) => {
              const isActive = workorder.approval_status === step.status;
              const isPast = !isRejected && currentStep > idx;
              const isFullyApproved = workorder.approval_status === 'Approved';
              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${isFullyApproved || isPast || isActive ? 'bg-green-600 text-white' :
                        isRejected && currentStep <= idx ? 'bg-red-100 text-red-400' :
                        'bg-gray-200 text-gray-500'}`}>
                      {(isFullyApproved && idx < pipelineSteps.length) || isPast ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={`text-xs mt-1 text-center font-medium
                      ${isActive || isPast || isFullyApproved ? 'text-green-700' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${isPast || isFullyApproved ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          {isRejected && (
            <p className="text-xs text-red-600 text-center mt-2 font-medium">
              Pipeline paused — {workorder.approval_status}
            </p>
          )}
        </div>
      )}

      {/* Rejection banner */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-red-800 font-semibold text-base">{workorder.approval_status}</h3>
            </div>
            {isAdmin && (workorder as any).allow_resubmission && (
              <span className="text-xs bg-green-100 text-green-700 border border-green-300 rounded px-2 py-1 font-medium">
                Resubmission Unlocked
              </span>
            )}
          </div>
          {workorder.reviewer_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Reviewer reason: </span>
              <span className="text-sm text-red-900">{workorder.reviewer_reason}</span>
            </div>
          )}
          {workorder.approver_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Approver reason: </span>
              <span className="text-sm text-red-900">{workorder.approver_reason}</span>
            </div>
          )}
          {workorder.final_approver_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Final approver reason: </span>
              <span className="text-sm text-red-900">{workorder.final_approver_reason}</span>
            </div>
          )}
          {isAdmin && !(workorder as any).allow_resubmission && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-xs text-red-700 mb-3">
                This work order is rejected. If the requester should be allowed to raise a new work order from the same source, unlock resubmission below.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-red-400 text-red-700 hover:bg-red-100"
                disabled={unlockResubmissionMutation.isPending}
                onClick={() => unlockResubmissionMutation.mutate()}
              >
                {unlockResubmissionMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Unlock Resubmission
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Raise Payment of ₦1,000,000 or more, approved and reviewed: waiting for the second approver */}
      {workorder.approval_status === 'Awaiting Final Approval' && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-700 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">
              Awaiting final approval from {workorder.final_approver_detail
                ? `${workorder.final_approver_detail.first_name || ''} ${workorder.final_approver_detail.last_name || ''}`.trim() || workorder.final_approver_detail.email
                : 'the second approver'}
            </p>
            <p>Approved by the Approver and reviewed by the Reviewer. Because of its amount, the payment is raised only after this final approval.</p>
          </div>
        </div>
      )}

      {/* Approved banner */}
      {workorder.approval_status === 'Approved' && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-green-700" />
            <h3 className="text-green-800 font-semibold text-base">Work Order Fully Approved</h3>
          </div>
          {workorder.digital_signature && (
            <p className="text-sm text-green-900">
              <span className="font-medium">Signed by:</span> {workorder.digital_signature}
            </p>
          )}
          {isKnownCost && (
            <p className="text-sm text-green-900">
              {knownCostPayment?.is_disbursed
                ? 'Payment disbursed by Finance — this work order is closed.'
                : 'Payment approved and sent to Finance for disbursement. This work order closes automatically once paid.'}
            </p>
          )}
        </div>
      )}

      </>)}

      {/* Accordion sections — same set as the Work Request page (Detail,
          Resource, Approval, Quotation, Comments, File attachments,
          History), plus WCC as the one addition specific to a Work Order. */}
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
                {workorder.description || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">About</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Work Order Number</p><p className="font-mono font-semibold text-gray-900">{workorder.work_order_number}</p></div>
                  <div><p className="text-sm text-gray-500">Type</p>{getTypeBadge(workorder.type)}</div>
                  <div><p className="text-sm text-gray-500">Priority</p>{workorder.priority ? getPriorityBadge(workorder.priority) : 'N/A'}</div>
                  <div><p className="text-sm text-gray-500">Approval Status</p>{getStatusBadge(workorder.approval_status)}</div>
                  {workorder.source_work_request_detail && (
                    <div><p className="text-sm text-gray-500">Source Work Request</p><p className="font-medium text-gray-900">{workorder.source_work_request_detail.work_request_number}</p></div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Category</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Category</p><p className="font-medium text-gray-900">{workorder.category_detail?.name || 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-500">Subcategory</p><p className="font-medium text-gray-900">{workorder.subcategory_detail?.name || 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-500">Department</p><p className="font-medium text-gray-900">{workorder.department || 'N/A'}</p></div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Requester</p>
                {workorder.requester_detail ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={(workorder.requester_detail as any).avatar} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                        {`${workorder.requester_detail.first_name?.charAt(0) || ''}${workorder.requester_detail.last_name?.charAt(0) || ''}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{`${workorder.requester_detail.first_name} ${workorder.requester_detail.last_name}`}</p>
                      <p className="text-sm text-gray-600">{workorder.requester_detail.email}</p>
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-400">N/A</p>}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Location</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><p className="text-sm text-gray-500">Facility</p><p className="font-medium text-gray-900">{workorder.facility_detail?.name || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Building</p><p className="font-medium text-gray-900">{workorder.building_detail?.name || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Asset</p><p className="font-medium text-gray-900">{workorder.asset_detail?.asset_name || 'N/A'}</p></div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Resource ───────────────────────────────────────────────── */}
        <AccordionItem value="resource" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <Briefcase className="h-5 w-5" />Resource ({(workorder.vendor_detail ? 1 : 0) + (workorder.technician_detail ? 1 : 0)})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {workorder.work_status !== 'closed' && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Vendor and technician are set when this work order is closed.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Vendor</p>
                {workorder.vendor_detail ? (
                  <div>
                    <p className="font-semibold text-gray-900">{workorder.vendor_detail.name}</p>
                    {workorder.vendor_detail.email && <p className="text-sm text-gray-500">{workorder.vendor_detail.email}</p>}
                  </div>
                ) : <p className="text-sm text-gray-500">No vendor selected</p>}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Technician</p>
                {workorder.technician_detail ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={(workorder.technician_detail as any).avatar} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-xs">
                        {`${(workorder.technician_detail.first_name || '').charAt(0)}${(workorder.technician_detail.last_name || '').charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{`${workorder.technician_detail.first_name} ${workorder.technician_detail.last_name}`}</p>
                      <p className="text-sm text-gray-600">{workorder.technician_detail.email}</p>
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-500">No technician assigned</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Approval ───────────────────────────────────────────────── */}
        <AccordionItem value="approval" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <CheckCircle className="h-5 w-5" />Approval ({approvalCount})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            {/* Lists grow as each step actually completes — not who's merely
                assigned. Empty until the Reviewer acts, even if routing was
                assigned earlier. */}
            {approvalCount === 0 ? (
              <p className="text-sm text-gray-400">No approvals yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {approvalCount >= 1 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Reviewer(s)</p>
                    {workorder.reviewers_detail && workorder.reviewers_detail.length > 0 ? (
                      <div className="space-y-2">
                        {workorder.reviewers_detail.map((u: any) => (
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
                    {workorder.approver_detail ? (
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border">
                        <Avatar className="h-8 w-8"><AvatarImage src={(workorder.approver_detail as any).avatar} /><AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{`${(workorder.approver_detail.first_name || '').charAt(0)}${(workorder.approver_detail.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                        <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{workorder.approver_detail.first_name} {workorder.approver_detail.last_name}</p><p className="text-xs text-gray-500 truncate">{workorder.approver_detail.email}</p></div>
                      </div>
                    ) : <p className="text-sm text-gray-400">Not assigned</p>}
                  </div>
                )}
                {/* Raise Payment of NGN 1,000,000 or more: the final approver the Requester selected */}
                {isApproverFirst && workorder.final_approver_detail && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Final Approver</p>
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-amber-100 text-amber-800 font-semibold">{`${(workorder.final_approver_detail.first_name || '').charAt(0)}${(workorder.final_approver_detail.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                      <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{workorder.final_approver_detail.first_name} {workorder.final_approver_detail.last_name}</p><p className="text-xs text-gray-500 truncate">{workorder.final_approved_at ? `Approved ${format(new Date(workorder.final_approved_at), 'PPP p')}` : workorder.final_approver_detail.email}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Quotation ──────────────────────────────────────────────── */}
        {/* Never re-entered on the Work Order — carries forward the exact
            same quotation/PO from the source Work Request. */}
        <AccordionItem value="quotation" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <Banknote className="h-5 w-5" />Quotation ({workorder.source_work_request_detail?.quotation_items?.length ?? 0})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            {workorder.source_work_request_detail?.po_number && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-700 mb-2 uppercase">Purchase Order (from source Work Request)</p>
                <p className="text-lg font-bold text-gray-900 font-mono">{workorder.source_work_request_detail.po_number}</p>
                {workorder.source_work_request_detail.po_document && (
                  <a
                    href={workorder.source_work_request_detail.po_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-700 underline font-medium mt-2"
                  >
                    <FileText className="h-3 w-3" /> View PO Document
                  </a>
                )}
              </div>
            )}

            {workorder.source_work_request_detail?.quotation_items && workorder.source_work_request_detail.quotation_items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2 pr-4">Description</th>
                        <th className="pb-2 pr-4">Qty</th>
                        {!isRequesterView && <th className="pb-2 pr-4">Estimate</th>}
                        {!isRequesterView && <th className="pb-2 pr-4">Cost to Alphamead</th>}
                        <th className="pb-2 pr-4">Cost to Client</th>
                        <th className="pb-2">VAT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workorder.source_work_request_detail.quotation_items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{item.description}</td>
                          <td className="py-2 pr-4">{item.quantity}</td>
                          {!isRequesterView && (
                            <td className="py-2 pr-4 text-gray-400">
                              {item.unit_cost_estimate != null ? formatCurrency(item.unit_cost_estimate, workorder.currency || 'NGN') : '—'}
                            </td>
                          )}
                          {!isRequesterView && (
                            <td className="py-2 pr-4">
                              {item.unit_cost_vendor != null ? formatCurrency(item.unit_cost_vendor, workorder.currency || 'NGN') : '—'}
                            </td>
                          )}
                          <td className="py-2 pr-4">{formatCurrency(item.unit_cost_client, workorder.currency || 'NGN')}</td>
                          <td className="py-2">{item.add_vat ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap justify-end gap-6 pt-4 border-t text-sm">
                  <div>
                    <span className="text-gray-500">Total Qty: </span>
                    <span className="font-semibold">
                      {workorder.source_work_request_detail.quotation_items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)}
                    </span>
                  </div>
                  {!isRequesterView && workorder.source_work_request_detail.total_cost_vendor != null && (
                    <div><span className="text-gray-500">Cost to Alphamead: </span><span className="font-semibold">{formatCurrency(workorder.source_work_request_detail.total_cost_vendor, workorder.currency || 'NGN')}</span></div>
                  )}
                  {workorder.source_work_request_detail.total_cost_client != null && (
                    <div><span className="text-gray-500">Cost to Client: </span><span className="font-semibold">{formatCurrency(workorder.source_work_request_detail.total_cost_client, workorder.currency || 'NGN')}</span></div>
                  )}
                  {!isRequesterView && workorder.source_work_request_detail.margin != null && (
                    <div><span className="text-gray-500">Margin: </span><span className="font-semibold text-green-700">{formatCurrency(workorder.source_work_request_detail.margin, workorder.currency || 'NGN')}</span></div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No quotation lines on the source Work Request.</p>
            )}

            {workorder.source_work_request_detail?.invoice_no && (
              <div><p className="text-sm text-gray-500">Invoice Number</p><p className="font-semibold text-gray-900">{workorder.source_work_request_detail.invoice_no}</p></div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Comments ───────────────────────────────────────────────── */}
        <AccordionItem value="comments" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold"><FileText className="h-5 w-5" />Comments (0)</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-sm text-gray-400">No comments on this work order yet.</p>
          </AccordionContent>
        </AccordionItem>

        {/* ── File attachments ──────────────────────────────────────── */}
        <AccordionItem value="attachments" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <FileBox className="h-5 w-5" />File attachments ({attachments.length})
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

        {/* ── Payment (Raise Payment only — takes the place of the WCC) ─── */}
        {isKnownCost && (
          <AccordionItem value="payment" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2 text-green-800 font-semibold">
                <Banknote className="h-5 w-5" />Payment ({knownCostPayment ? 1 : 0})
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Pay to</p>
                  <p className="font-medium text-gray-900">{workorder.payee_detail?.name || 'N/A'}</p>
                  {(workorder.payee_detail as any)?.bank && (
                    <p className="text-xs text-gray-500">
                      {(workorder.payee_detail as any).bank} — {(workorder.payee_detail as any).account_number}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {workorder.cost ? formatCurrency(workorder.cost, workorder.currency) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Payment Date</p>
                  <p className="font-medium text-gray-900">
                    {workorder.expected_payment_date ? format(new Date(workorder.expected_payment_date), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Withholding Tax</p>
                  <p className="font-medium text-gray-900">{workorder.withholding_tax || 'N/A'}</p>
                </div>
              </div>

              {knownCostPayment ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-green-700" />
                    <span className="font-semibold text-gray-900">Payment Requisition {knownCostPayment.requisition_number}</span>
                    <Badge variant="outline" className={
                      knownCostPayment.is_disbursed
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }>
                      {knownCostPayment.is_disbursed
                        ? `Disbursed${knownCostPayment.disbursed_at ? ` on ${format(new Date(knownCostPayment.disbursed_at), 'PPP')}` : ''}`
                        : 'Approved — awaiting Finance'}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => navigate(`/dashboard/work/payment-requisitions/view/${knownCostPayment.id}`)}
                  >
                    View Payment Requisition
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  {isRejected
                    ? 'No payment — this work order was rejected.'
                    : 'The payment requisition is created automatically, already approved, when the Approver approves this work order. No WCC is needed — the attached bill is the evidence.'}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ── WCC (Work Completion Certificate) ─────────────────────── */}
        {!isKnownCost && (
        <AccordionItem value="wcc" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <ClipboardCheck className="h-5 w-5" />WCC ({workorder.latest_completion ? 1 : 0})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {workorder.approval_status !== 'Approved' ? (
              <p className="text-sm text-gray-400">A Work Completion Certificate can be added once this Work Order is Approved.</p>
            ) : workorder.latest_completion ? (
              <div className="border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 p-3 border-b border-green-100">
                  <span className="font-semibold text-gray-900">WCC-{workorder.latest_completion.wcc_number}</span>
                  <Badge variant="outline" className={
                    workorder.latest_completion.approval_status === 'Approved'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : workorder.latest_completion.approval_status.includes('Rejected')
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }>
                    {workorder.latest_completion.approval_status}
                  </Badge>
                </div>
                <div className="p-3">
                  <WorkordercompletionDetailView idProp={String(workorder.latest_completion.id)} embedded />
                </div>
              </div>
            ) : (
              // Add/resubmit WCC is triggered from the top of the page (see
              // needsWccAction) — this just shows the current state.
              <p className="text-sm text-gray-400">No Work Completion Certificate submitted yet.</p>
            )}

            {(isOwner || isAdmin) && workorder.latest_completion?.approval_status === 'Approved' && !workorder.linked_payment_requisition && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => createPaymentRequisitionMutation.mutate()}
                  disabled={createPaymentRequisitionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {createPaymentRequisitionMutation.isPending
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Receipt className="mr-2 h-4 w-4" />}
                  Create Payment Requisition
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
        )}

        {/* ── History ────────────────────────────────────────────────── */}
        <AccordionItem value="history" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <CalendarDays className="h-5 w-5" />History ({historyEntries})
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
                  <h3 className="text-base font-semibold text-gray-900">Raised</h3>
                  <time className="text-sm text-gray-500">{format(new Date(workorder.created_at), 'PPP p')}</time>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100"><Loader2 className="h-5 w-5 text-green-600" /></div>
                  <div className="w-px h-12 bg-gray-300 mt-2" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Last Updated</h3>
                  <time className="text-sm text-gray-500">{format(new Date(workorder.updated_at), 'PPP p')}</time>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    workorder.approval_status === 'Approved' ? 'bg-green-100' :
                    isRejected ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {workorder.approval_status === 'Approved'
                      ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                      : isRejected ? <XCircle className="h-5 w-5 text-red-600" />
                      : <Loader2 className="h-5 w-5 text-yellow-600" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Current Status</h3>
                  <div className="mt-1">{getStatusBadge(workorder.approval_status)}</div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {workorder && (
        <WorkorderApprovalForm
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          workorderSlug={workorder.slug}
          workorderNumber={workorder.work_order_number}
          action={approvalAction}
          approverFirst={isApproverFirst}
          needsSecondApproval={!!workorder.needs_second_approval}
        />
      )}

      {workorder && (
        <WorkorderCloseForm
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          workorderSlug={workorder.slug}
          workorderNumber={workorder.work_order_number}
        />
      )}

      {isRoutingModalOpen && (
        <WorkorderRoutingForm
          isOpen={isRoutingModalOpen}
          onClose={() => setIsRoutingModalOpen(false)}
          workorderSlug={workorder.slug}
          workorderNumber={workorder.work_order_number}
          currentReviewers={workorder.reviewers || []}
          currentApprover={workorder.approver}
        />
      )}
    </div>
  );
};

export default WorkorderDetailView;

