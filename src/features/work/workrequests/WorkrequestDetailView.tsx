import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, Edit, Loader2, AlertTriangle, Clock, CalendarDays, FileText,
  Banknote, User, Briefcase, CheckCircle2, XCircle, FileBox,
  MapPin, Settings, FileCheck, Package, CheckCircle, RefreshCw, ShieldCheck,
  UserCog, Truck,
} from 'lucide-react';
import {
  useWorkrequestQuery,
  useResubmitWorkrequest,
  useReviewerApprove,
  useFinalApprove,
  useCpApprove,
} from '@/hooks/workrequest/useWorkrequestQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ApprovalForm, ApprovalAction } from './components/ApprovalForm';
import { ProcurementForm, CpAction } from './components/ProcurementForm';
import { WorkrequestAssignResourcesForm } from './components/WorkrequestAssignResourcesForm';
import { WorkrequestVendorForm } from './components/WorkrequestVendorForm';
import { useAuth } from '@/contexts/AuthContext';
import WorkrequestPrintView from './WorkrequestPrintView';
import WorkorderDetailView from '@/features/work/workorders/WorkorderDetailView';
import { REJECTED_STATUSES } from '@/types/workrequest';
import { useFormatters } from '@/utils/formatters';

const PIPELINE_STEPS = [
  { label: 'Pending Review', status: 'Pending Review' },
  { label: 'CP Approved', status: 'CP Approved' },
  { label: 'Reviewed', status: 'Reviewed' },
  { label: 'Fully Approved', status: 'Fully Approved' },
];

const WorkrequestDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [approvalAction, setApprovalAction] = useState<ApprovalAction | null>(null);
  const [procurementAction, setProcurementAction] = useState<CpAction | null>(null);
  const [showAssignResources, setShowAssignResources] = useState(false);
  const [showAssignVendor, setShowAssignVendor] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const userRole = (user?.role || '').toUpperCase();
  const isAdmin = ['SUPER ADMIN', 'ADMIN'].includes(userRole);
  const isProcurement = userRole === 'PROCUREMENT AND STORE';
  const isReviewer = userRole === 'REVIEWER';
  const isApprover = userRole === 'APPROVER';
  const isRequesterView = userRole === 'REQUESTER';
  const { formatCurrency: formatMoney } = useFormatters();

  const { data: workrequest, isLoading, isError, error } = useWorkrequestQuery(slug);
  const resubmitMutation = useResubmitWorkrequest();
  const reviewerApproveMutation = useReviewerApprove();
  const finalApproveMutation = useFinalApprove();
  const cpApproveMutation = useCpApprove();

  const isOwner = !!(user && workrequest && workrequest.requester === (user as any).id);
  const isRejected = workrequest ? REJECTED_STATUSES.includes(workrequest.approval_status) : false;

  // Once Procurement & Store has imputed both a cost (quotation line) and a
  // PO — and the request hasn't reached a terminal state — three separate
  // people can each edit their own field via the assign-resources action:
  // the Requester sets technician + approver, Procurement & Store sets
  // vendor (it's the payee the eventual Payment Requisition goes to, so it
  // stays a procurement decision). Matches the backend's own per-field role
  // checks exactly.
  const hasCostImputed = !!(workrequest && (workrequest.quotation_items?.length ?? 0) > 0);
  const hasPo = !!workrequest?.po_number;
  // Quotations at or below ₦100,000 (Cost to Client) don't need a PO before
  // Procurement & Store can approve — keep in sync with PO_THRESHOLD in
  // ProcurementForm.tsx and the backend's cp_approve check.
  const PO_THRESHOLD = 100000;
  const poRequiredForApprove = !!workrequest && (
    workrequest.currency !== 'NGN' || parseFloat(workrequest.total_cost_client || '0') > PO_THRESHOLD
  );
  // Procurement & Store must have actually priced it — a cost (quotation
  // line) or a PO — before approving at all; above the threshold, a PO
  // specifically is required. Matches the backend's cp_approve guard.
  const canApproveGate = (hasCostImputed || hasPo) && (!poRequiredForApprove || hasPo);
  const isUnlocked = !!(
    workrequest && hasCostImputed && (hasPo || !poRequiredForApprove) &&
    workrequest.approval_status !== 'Fully Approved' && !isRejected
  );
  const canAssignResources = isUnlocked && (isOwner || isAdmin);
  const canAssignVendor = isUnlocked && (isProcurement || isAdmin);

  const userId = (user as any)?.id;
  const isMyCpStep = !isAdmin && !!(workrequest?.request_to?.some((id: any) => String(id) === String(userId)));
  const isMyReviewStep = !isAdmin && !!(workrequest?.reviewers?.some((id: any) => String(id) === String(userId)));
  const isMyApproveStep = !isAdmin && !!(workrequest && String(workrequest.approver) === String(userId));
  const stepHighlight = [false, isMyCpStep, isMyReviewStep, isMyApproveStep];

  const handleBack = () => navigate('/dashboard/work/requests');
  const handleEdit = (s: string) => navigate(`/dashboard/work/requests/edit/${s}`);
  const handleResubmit = () => { if (slug) resubmitMutation.mutate(slug); };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Pending Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CP Approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'Reviewed': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Fully Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected – Vendor Changed': 'bg-red-100 text-red-800 border-red-200',
      'Reviewer Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Approver Rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <Badge variant="outline" className={`${map[status] || 'bg-gray-100 text-gray-800 border-gray-200'} font-medium`}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      Work: 'bg-blue-100 text-blue-800 border-blue-200',
      Procument: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return <Badge variant="outline" className={`${styles[type] || ''} font-medium`}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      High: 'bg-red-100 text-red-800 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200',
    };
    return <Badge variant="outline" className={`${styles[priority] || ''} font-medium`}>{priority}</Badge>;
  };

  const formatCurrency = (cost: string, currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', NGN: '₦' };
    return `${symbols[currency] || ''}${cost}`;
  };

  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'PPP p'); } catch { return 'N/A'; }
  };

  const getPipelineStep = (currentStatus: string): number => {
    const order = ['Pending Review', 'CP Approved', 'Reviewed', 'Fully Approved'];
    const idx = order.indexOf(currentStatus);
    return idx >= 0 ? idx : 0;
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground">Loading work request...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <div className="text-red-500 text-xl">Error loading work request</div>
      <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
      <Button onClick={handleBack} variant="outline">Back to Work Requests</Button>
    </div>
  );

  if (!workrequest) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <div className="text-red-500 text-xl">Work request not found</div>
      <Button onClick={handleBack} variant="outline">Back to Work Requests</Button>
    </div>
  );

  const currentStep = getPipelineStep(workrequest.approval_status);

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack} className="border-green-200 text-green-700 hover:bg-green-50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Request {workrequest.work_request_number}</h1>
            <p className="text-gray-600 text-base mt-1">Created {formatDate(workrequest.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            {getTypeBadge(workrequest.type)}
            {getPriorityBadge(workrequest.priority)}
            {getStatusBadge(workrequest.approval_status)}
          </div>

          <WorkrequestPrintView workrequest={workrequest} />

          {/* Procurement & Store actions — Pending Review. Quotation/PO/Vendor
              are filled in from the Quotation accordion (see below); this is
              just the final confirm once that's saved. */}
          {workrequest.approval_status === 'Pending Review' && (isProcurement || isAdmin) && (
            <>
              <Button
                onClick={() => setShowApproveConfirm(true)}
                disabled={!canApproveGate}
                title={
                  !canApproveGate
                    ? (!hasCostImputed && !hasPo
                        ? 'Add a cost (quotation line) or a PO number in the Quotation section below first.'
                        : 'Cost to Client exceeds ₦100,000 — save a PO number in the Quotation section below first.')
                    : undefined
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => setProcurementAction('cp-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject — Vendor Issue
              </Button>
            </>
          )}

          {/* Reviewer actions — CP Approved */}
          {workrequest.approval_status === 'CP Approved' && (isReviewer || isAdmin) && (
            <>
              <Button
                onClick={() => reviewerApproveMutation.mutate(workrequest.slug)}
                disabled={reviewerApproveMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {reviewerApproveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => setApprovalAction('reviewer-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}

          {/* Approver actions — Reviewed */}
          {workrequest.approval_status === 'Reviewed' && (isApprover || isAdmin) && (
            <>
              <Button
                onClick={() => finalApproveMutation.mutate({ slug: workrequest.slug, data: { digital_signature: '' } })}
                disabled={finalApproveMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {finalApproveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ShieldCheck className="mr-2 h-4 w-4" /> Final Approval
              </Button>
              <Button onClick={() => setApprovalAction('final-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}

          {/* Requester: Procurement & Store has priced it — add Reviewer +
              Approver here, right at the top, rather than having to dig for
              the edit page. Unlocked specifically for this (see cp_approve). */}
          {workrequest.approval_status !== 'Pending Review' && !isRejected && !workrequest.is_locked && (isOwner || isAdmin) && (
            <PermissionGuard feature="work_request" permission="edit">
              <Button onClick={() => handleEdit(workrequest.slug)} className="bg-green-600 hover:bg-green-700 text-white">
                <Edit className="mr-2 h-4 w-4" /> Add Reviewer &amp; Approver
              </Button>
            </PermissionGuard>
          )}

          {/* Requester: edit + resubmit after any rejection */}
          {isRejected && !workrequest.is_locked && (isOwner || isAdmin) && (
            <>
              <PermissionGuard feature="work_request" permission="edit">
                <Button onClick={() => handleEdit(workrequest.slug)} className="bg-green-600 hover:bg-green-700 text-white">
                  <Edit className="mr-2 h-4 w-4" /> Edit & Correct
                </Button>
              </PermissionGuard>
              <Button
                onClick={handleResubmit}
                disabled={resubmitMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {resubmitMutation.isPending
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <RefreshCw className="mr-2 h-4 w-4" />
                }
                Resubmit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline stepper — visible to all roles; assigned step highlighted per viewer */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        {(isMyCpStep || isMyReviewStep || isMyApproveStep) && (
          <p className="text-xs text-blue-600 font-medium mb-3 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-300 ring-offset-1" />
            Your assigned step is highlighted
          </p>
        )}
        <div className="flex items-center justify-between">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = workrequest.approval_status === step.status;
            const isPast = !isRejected && currentStep > idx;
            const isFullyApproved = workrequest.approval_status === 'Fully Approved';
            const isMyStep = stepHighlight[idx];
            return (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${isMyStep ? 'ring-2 ring-green-400 ring-offset-2' : ''}
                    ${isFullyApproved || isPast || isActive ? 'bg-green-600 text-white' :
                      isRejected && currentStep <= idx ? 'bg-red-100 text-red-400' :
                      'bg-gray-200 text-gray-500'}`}>
                    {(isFullyApproved && idx < 4) || isPast ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center font-medium
                    ${isMyStep || isActive ? 'text-green-700' :
                      isPast || isFullyApproved ? 'text-green-700' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                  {isMyStep && (
                    <span className="text-xs text-blue-500 font-medium mt-0.5">Your step</span>
                  )}
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
            Pipeline paused — {workrequest.approval_status}
          </p>
        )}
      </div>

      {/* Approval Metrics — at-a-glance who approved / is pending */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Approval Chain
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Procurement & Store */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Procurement &amp; Store</p>
            {workrequest.request_to_detail?.length > 0 ? (
              <div className="space-y-2">
                {workrequest.request_to_detail.map((u: any) => {
                  const done = ['CP Approved', 'Reviewed', 'Fully Approved'].includes(workrequest.approval_status) && !isRejected;
                  const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`;
                  return (
                    <div key={u.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                      {done
                        ? <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        : <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-xs text-gray-400">Not assigned</p>}
          </div>

          {/* Reviewer(s) */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Reviewer(s)</p>
            {workrequest.reviewers_detail?.length > 0 ? (
              <div className="space-y-2">
                {workrequest.reviewers_detail.map((u: any) => {
                  const done = ['Reviewed', 'Fully Approved'].includes(workrequest.approval_status) && !isRejected;
                  const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`;
                  return (
                    <div key={u.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                      {done
                        ? <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        : <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-xs text-gray-400">Not assigned</p>}
          </div>

          {/* Final Approver */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Final Approver</p>
            {workrequest.approver_detail ? (() => {
              const u: any = workrequest.approver_detail;
              const done = workrequest.approval_status === 'Fully Approved';
              const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`;
              return (
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  {done
                    ? <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    : <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                </div>
              );
            })() : <p className="text-xs text-gray-400">Not assigned</p>}
          </div>
        </div>
      </div>

      {/* Rejection banner */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-red-800 font-semibold text-base">{workrequest.approval_status}</h3>
          </div>
          {workrequest.cp_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Procurement & Store reason: </span>
              <span className="text-sm text-red-900">{workrequest.cp_reason}</span>
            </div>
          )}
          {workrequest.po_vendor_detail && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Suggested alternative vendor: </span>
              <span className="text-sm text-red-900">{workrequest.po_vendor_detail.name}</span>
            </div>
          )}
          {workrequest.reviewer_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Reviewer reason: </span>
              <span className="text-sm text-red-900">{workrequest.reviewer_reason}</span>
            </div>
          )}
          {workrequest.approver_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Approver reason: </span>
              <span className="text-sm text-red-900">{workrequest.approver_reason}</span>
            </div>
          )}
          {!workrequest.is_locked && (isOwner || isAdmin) && (
            <p className="text-sm text-red-700 mt-3 font-medium">
              Correct the issue above, then click "Edit & Correct" → "Resubmit" to restart the pipeline.
            </p>
          )}
        </div>
      )}

      {/* Fully approved banner — Requester only */}
      {workrequest.approval_status === 'Fully Approved' && isOwner && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-green-700" />
            <h3 className="text-green-800 font-semibold text-base">Committed to Ledger — Fully Approved</h3>
          </div>
          {workrequest.digital_signature && (
            <p className="text-sm text-green-900 mb-1">
              <span className="font-medium">Signed by:</span> {workrequest.digital_signature}
            </p>
          )}
          {workrequest.fully_approved_at && (
            <p className="text-sm text-green-900">
              <span className="font-medium">Approved at:</span> {formatDate(workrequest.fully_approved_at)}
            </p>
          )}
          {workrequest.derived_work_order && (
            <p className="text-sm text-green-900 mt-2 flex items-center gap-1.5">
              <FileBox className="h-4 w-4 text-green-700" />
              <span className="font-medium">Work Order:</span>
              <button
                type="button"
                onClick={() => navigate(`/dashboard/work/orders/view/${workrequest.derived_work_order!.slug}`)}
                className="font-mono font-semibold text-green-700 underline underline-offset-2 hover:text-green-900"
                title="Open the work order raised from this request"
              >
                {workrequest.derived_work_order.work_order_number}
              </button>
            </p>
          )}
        </div>
      )}

      {/* Three-way audit panel for Reviewer */}
      {workrequest.approval_status === 'CP Approved' && (isReviewer || isAdmin) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
          <h3 className="text-green-800 font-semibold text-base mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5" /> Three-Way Audit Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-green-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-600 uppercase mb-2">1. Original Request</p>
              <p className="text-sm font-medium text-gray-900">{workrequest.description || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Vendor: {workrequest.vendor_detail?.name || 'N/A'}</p>
            </div>
            <div className="bg-white border border-green-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-600 uppercase mb-2">2. Purchase Order</p>
              {workrequest.po_number ? (
                <>
                  <p className="text-sm font-medium text-gray-900 font-mono">{workrequest.po_number}</p>
                  <p className="text-xs text-gray-500 mt-1">PO Vendor: {workrequest.po_vendor_detail?.name || workrequest.vendor_detail?.name || 'N/A'}</p>
                  {workrequest.po_document && (
                    <a
                      href={workrequest.po_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-green-700 underline font-medium mt-2"
                    >
                      <FileText className="h-3 w-3" /> View PO Document
                    </a>
                  )}
                </>
              ) : !poRequiredForApprove ? (
                <>
                  <p className="text-sm font-medium text-gray-900">PO not required</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Cost to Client is {formatMoney(workrequest.total_cost_client || '0', workrequest.currency)} — at or below ₦{PO_THRESHOLD.toLocaleString()}.
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">No PO uploaded yet</p>
              )}
            </div>
            <div className="bg-white border border-green-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-600 uppercase mb-2">3. Vendor Invoice</p>
              {workrequest.vendor_invoice ? (
                <a
                  href={workrequest.vendor_invoice}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 underline font-medium"
                >
                  View Invoice Document
                </a>
              ) : (
                <p className="text-sm text-gray-400">No invoice uploaded</p>
              )}
              {workrequest.invoice_no && (
                <p className="text-xs text-gray-500 mt-1">Invoice No: {workrequest.invoice_no}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4">
            Verify all three match before approving. If there is a discrepancy, reject with a specific reason.
          </p>
        </div>
      )}

      {(() => {
        const resourceCount = (workrequest.vendor_detail ? 1 : 0) + (workrequest.technician_detail ? 1 : 0);
        // Count of approval STEPS actually completed so far (CP → Reviewer →
        // Approver), not how many people are assigned to approve — those are
        // assigned from the moment the request is created, so counting them
        // would show e.g. 3 before Procurement & Store has done anything.
        // At "Pending Review" (CP still raising the quote), this is 0.
        const APPROVAL_STEPS_DONE: Record<string, number> = {
          'Pending Review': 0,
          'Rejected – Vendor Changed': 0, // CP rejected outright — no approval happened
          'CP Approved': 1,
          'Reviewer Rejected': 1, // CP approved, then Reviewer rejected
          'Reviewed': 2,
          'Approver Rejected': 2, // CP + Reviewer approved, then Approver rejected
          'Fully Approved': 3,
        };
        const approvalCount = APPROVAL_STEPS_DONE[workrequest.approval_status] ?? 0;
        const attachments = [
          workrequest.po_document && { label: 'PO Document', url: workrequest.po_document },
          workrequest.vendor_invoice && { label: 'Vendor Invoice', url: workrequest.vendor_invoice },
          workrequest.attachment && { label: 'Attachment', url: workrequest.attachment },
        ].filter(Boolean) as { label: string; url: string }[];
        const historyEntries = 3; // Submitted / Last Updated / Current Status — always present

        return (
          <Accordion type="multiple" defaultValue={['detail']} className="w-full space-y-3">
            {/* ── Detail ─────────────────────────────────────────────────── */}
            <AccordionItem value="detail" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-green-800 font-semibold"><FileBox className="h-5 w-5" />Detail (1)</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5"><FileText className="h-4 w-4" />Description</p>
                  <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border">
                    {workrequest.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">About</p>
                    <div className="space-y-3">
                      <div><p className="text-sm text-gray-500">Request Number</p><p className="font-mono font-semibold text-gray-900">{workrequest.work_request_number}</p></div>
                      <div><p className="text-sm text-gray-500">Type</p>{getTypeBadge(workrequest.type)}</div>
                      <div><p className="text-sm text-gray-500">Priority</p>{getPriorityBadge(workrequest.priority)}</div>
                      <div><p className="text-sm text-gray-500">Approval Status</p>{getStatusBadge(workrequest.approval_status)}</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Category</p>
                    <div className="space-y-3">
                      <div><p className="text-sm text-gray-500">Category</p><p className="font-medium text-gray-900">{workrequest.category_detail?.description || workrequest.category_detail?.name || 'N/A'}</p></div>
                      <div><p className="text-sm text-gray-500">Subcategory</p><p className="font-medium text-gray-900">{workrequest.subcategory_detail?.title || 'N/A'}</p></div>
                      <div><p className="text-sm text-gray-500">Department</p><p className="font-medium text-gray-900">{workrequest.department_detail?.name || 'N/A'}</p></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Requester</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={workrequest.requester_detail?.avatar} />
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                          {`${workrequest.requester_detail?.first_name?.charAt(0) || ''}${workrequest.requester_detail?.last_name?.charAt(0) || ''}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{`${workrequest.requester_detail?.first_name} ${workrequest.requester_detail?.last_name}`}</p>
                        <p className="text-sm text-gray-600">{workrequest.requester_detail?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Location</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div><p className="text-sm text-gray-500">Facility</p><p className="font-medium text-gray-900">{workrequest.facility_detail?.name || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-500">Zone</p><p className="font-medium text-gray-900">{workrequest.zone_detail?.name || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-500">Subzone</p><p className="font-medium text-gray-900">{workrequest.subsystem_detail?.name || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-500">Asset</p><p className="font-medium text-gray-900">{workrequest.asset_detail?.asset_name || 'N/A'}</p></div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ── Resource ───────────────────────────────────────────────── */}
            <AccordionItem value="resource" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-green-800 font-semibold">
                  <Briefcase className="h-5 w-5" />Resource ({resourceCount})
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {!isUnlocked && !hasCostImputed && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Procurement &amp; Store has not imputed a cost and PO yet — resources and the approving officer
                    can only be added once that's done.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Vendor</p>
                    {workrequest.vendor_detail ? (
                      <div>
                        <p className="font-semibold text-gray-900">{workrequest.vendor_detail.name}</p>
                        {workrequest.vendor_detail.email && <p className="text-sm text-gray-500">{workrequest.vendor_detail.email}</p>}
                      </div>
                    ) : <p className="text-sm text-gray-500">No vendor selected</p>}
                    {canAssignVendor && (
                      <Button
                        onClick={() => setShowAssignVendor(true)}
                        variant="outline"
                        size="sm"
                        className="mt-2 border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Truck className="mr-2 h-4 w-4" /> {workrequest.vendor_detail ? 'Change' : 'Assign'} Vendor
                      </Button>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Technician</p>
                    {workrequest.technician_detail ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={workrequest.technician_detail.avatar} />
                          <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-xs">
                            {`${(workrequest.technician_detail.first_name || '').charAt(0)}${(workrequest.technician_detail.last_name || '').charAt(0)}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{`${workrequest.technician_detail.first_name} ${workrequest.technician_detail.last_name}`}</p>
                          <p className="text-sm text-gray-600">{workrequest.technician_detail.email}</p>
                        </div>
                      </div>
                    ) : <p className="text-sm text-gray-500">No technician assigned</p>}
                    {canAssignResources && (
                      <Button
                        onClick={() => setShowAssignResources(true)}
                        variant="outline"
                        size="sm"
                        className="mt-2 border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <UserCog className="mr-2 h-4 w-4" /> {workrequest.technician_detail ? 'Change' : 'Assign'} Technician
                      </Button>
                    )}
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
                {/* Lists grow as each step actually completes — not who's
                    merely assigned. Empty until Procurement & Store approves. */}
                {approvalCount === 0 ? (
                  <p className="text-sm text-gray-400">No approvals yet — waiting on Procurement &amp; Store.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {approvalCount >= 1 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Procurement &amp; Store</p>
                        {workrequest.request_to_detail && workrequest.request_to_detail.length > 0 ? (
                          <div className="space-y-2">
                            {workrequest.request_to_detail.map((u: any) => (
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
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Reviewer(s)</p>
                        {workrequest.reviewers_detail && workrequest.reviewers_detail.length > 0 ? (
                          <div className="space-y-2">
                            {workrequest.reviewers_detail.map((u: any) => (
                              <div key={u.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border">
                                <Avatar className="h-8 w-8"><AvatarImage src={u.avatar} /><AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{`${(u.first_name || '').charAt(0)}${(u.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                                <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p><p className="text-xs text-gray-500 truncate">{u.email}</p></div>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-gray-400">Not assigned</p>}
                      </div>
                    )}
                    {approvalCount >= 3 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Final Approver</p>
                        {workrequest.approver_detail ? (
                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border">
                            <Avatar className="h-8 w-8"><AvatarImage src={workrequest.approver_detail.avatar} /><AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{`${(workrequest.approver_detail.first_name || '').charAt(0)}${(workrequest.approver_detail.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                            <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{workrequest.approver_detail.first_name} {workrequest.approver_detail.last_name}</p><p className="text-xs text-gray-500 truncate">{workrequest.approver_detail.email}</p></div>
                          </div>
                        ) : <p className="text-sm text-gray-400">Not assigned</p>}
                      </div>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ── Quotation ──────────────────────────────────────────────── */}
            <AccordionItem value="quotation" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-green-800 font-semibold">
                  <Banknote className="h-5 w-5" />Quotation ({workrequest.quotation_items?.length ?? 0})
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
                {/* Quotation/PO/Vendor entry lives here — its own step,
                    separate from clicking Approve at the top. */}
                {(isProcurement || isAdmin) && workrequest.approval_status === 'Pending Review' && (
                  <Button
                    type="button"
                    onClick={() => setProcurementAction('save-quotation')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {workrequest.po_number ? 'Edit Quotation, PO & Vendor' : 'Add Quotation, PO & Vendor'}
                  </Button>
                )}

                {workrequest.po_number && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-700 mb-2 uppercase">Purchase Order</p>
                    <p className="text-lg font-bold text-gray-900 font-mono">{workrequest.po_number}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Vendor: {workrequest.po_vendor_detail?.name || workrequest.vendor_detail?.name || 'N/A'}
                    </p>
                  </div>
                )}

                {workrequest.quotation_items && workrequest.quotation_items.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="pb-2 pr-4">Description</th>
                            <th className="pb-2 pr-4">Qty</th>
                            {/* Estimate/vendor cost are only present in the API
                                response for roles other than Requester — see
                                backend WorkRequestQuotationItemSerializer.to_representation. */}
                            {!isRequesterView && <th className="pb-2 pr-4">Estimate</th>}
                            {!isRequesterView && <th className="pb-2 pr-4">Cost to Alphamead</th>}
                            <th className="pb-2 pr-4">Cost to Client</th>
                            <th className="pb-2">VAT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workrequest.quotation_items.map((item) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="py-2 pr-4">{item.description}</td>
                              <td className="py-2 pr-4">{item.quantity}</td>
                              {!isRequesterView && (
                                <td className="py-2 pr-4 text-gray-400">
                                  {item.unit_cost_estimate != null ? formatMoney(item.unit_cost_estimate, workrequest.currency) : '—'}
                                </td>
                              )}
                              {!isRequesterView && (
                                <td className="py-2 pr-4">
                                  {item.unit_cost_vendor != null ? formatMoney(item.unit_cost_vendor, workrequest.currency) : '—'}
                                </td>
                              )}
                              <td className="py-2 pr-4">{formatMoney(item.unit_cost_client, workrequest.currency)}</td>
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
                          {workrequest.quotation_items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)}
                        </span>
                      </div>
                      {!isRequesterView && workrequest.total_cost_vendor != null && (
                        <div><span className="text-gray-500">Cost to Alphamead: </span><span className="font-semibold">{formatMoney(workrequest.total_cost_vendor, workrequest.currency)}</span></div>
                      )}
                      {workrequest.total_cost_client != null && (
                        <div><span className="text-gray-500">Cost to Client: </span><span className="font-semibold">{formatMoney(workrequest.total_cost_client, workrequest.currency)}</span></div>
                      )}
                      {workrequest.margin != null && (
                        <div><span className="text-gray-500">Margin: </span><span className="font-semibold text-green-700">{formatMoney(workrequest.margin, workrequest.currency)}</span></div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No quotation lines yet — Procurement &amp; Store hasn't imputed a cost.</p>
                )}

                {workrequest.invoice_no && (
                  <div><p className="text-sm text-gray-500">Invoice Number</p><p className="font-semibold text-gray-900">{workrequest.invoice_no}</p></div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ── Comments ───────────────────────────────────────────────── */}
            <AccordionItem value="comments" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-green-800 font-semibold"><FileText className="h-5 w-5" />Comments (0)</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-gray-400">No comments on this request yet.</p>
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
                    {attachments.map((a) => (
                      <a
                        key={a.label}
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

            {/* ── Work Order ─────────────────────────────────────────────── */}
            {/* A real extension of this request: nests the full Work Order
                page inline — its own approval chain, Close button, and (from
                there) its own nested WCC and Payment Requisition sections —
                instead of linking away to a separate page. */}
            <AccordionItem value="past-work-order" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-green-800 font-semibold">
                  <Settings className="h-5 w-5" />Work Order ({workrequest.derived_work_order ? 1 : 0})
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {workrequest.derived_work_order ? (
                  <WorkorderDetailView slugProp={workrequest.derived_work_order.slug} embedded />
                ) : <p className="text-sm text-gray-400">No work order has been raised from this request yet.</p>}
              </AccordionContent>
            </AccordionItem>

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
                      <h3 className="text-base font-semibold text-gray-900">Submitted</h3>
                      <time className="text-sm text-gray-500">{formatDate(workrequest.created_at)}</time>
                      <p className="mt-1 text-sm text-gray-700">{workrequest.type} work request submitted by requester</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100"><Clock className="h-5 w-5 text-green-600" /></div>
                      <div className="w-px h-12 bg-gray-300 mt-2" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Last Updated</h3>
                      <time className="text-sm text-gray-500">{formatDate(workrequest.updated_at)}</time>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        workrequest.approval_status === 'Fully Approved' ? 'bg-green-100' :
                        isRejected ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {workrequest.approval_status === 'Fully Approved'
                          ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                          : isRejected ? <XCircle className="h-5 w-5 text-red-600" />
                          : <Clock className="h-5 w-5 text-yellow-600" />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Current Status</h3>
                      <div className="mt-1">{getStatusBadge(workrequest.approval_status)}</div>
                      {workrequest.fully_approved_at && (
                        <p className="mt-1 text-sm text-gray-500">Approved: {formatDate(workrequest.fully_approved_at)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })()}

      {/* Role-specific action dialogs */}
      {approvalAction && (
        <ApprovalForm
          isOpen={!!approvalAction}
          onClose={() => setApprovalAction(null)}
          workrequestSlug={workrequest.slug}
          workrequestNumber={workrequest.work_request_number}
          action={approvalAction}
        />
      )}

      {procurementAction && (
        <ProcurementForm
          isOpen={!!procurementAction}
          onClose={() => setProcurementAction(null)}
          workrequestSlug={workrequest.slug}
          workrequestNumber={workrequest.work_request_number}
          action={procurementAction}
          currency={workrequest.currency}
          existing={{
            po_number: workrequest.po_number,
            po_amount: workrequest.po_amount,
            po_vendor: workrequest.po_vendor,
            items: workrequest.quotation_items?.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unit_cost_estimate: item.unit_cost_estimate,
              unit_cost_vendor: item.unit_cost_vendor || '',
              unit_cost_client: item.unit_cost_client,
              add_vat: item.add_vat,
            })),
          }}
        />
      )}

      <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Work Request</AlertDialogTitle>
            <AlertDialogDescription>
              This commits the saved quotation (PO {workrequest.po_number}) and moves the request to CP Approved,
              ready for Reviewer sign-off. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cpApproveMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={cpApproveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={async () => {
                try {
                  await cpApproveMutation.mutateAsync({ slug: workrequest.slug, data: {} });
                  setShowApproveConfirm(false);
                } catch {
                  // error surfaced by the mutation's own onError toast
                }
              }}
            >
              {cpApproveMutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving...</>
                : 'Confirm Approval'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showAssignResources && (
        <WorkrequestAssignResourcesForm
          isOpen={showAssignResources}
          onClose={() => setShowAssignResources(false)}
          workrequestSlug={workrequest.slug}
          workrequestNumber={workrequest.work_request_number}
          currentTechnician={workrequest.technician}
        />
      )}

      {showAssignVendor && (
        <WorkrequestVendorForm
          isOpen={showAssignVendor}
          onClose={() => setShowAssignVendor(false)}
          workrequestSlug={workrequest.slug}
          workrequestNumber={workrequest.work_request_number}
          currentVendor={workrequest.vendor}
        />
      )}

    </div>
  );
};

export default WorkrequestDetailView;
