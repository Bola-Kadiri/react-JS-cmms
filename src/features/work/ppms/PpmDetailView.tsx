import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Edit,
  Clock,
  Calendar,
  Bell,
  Repeat,
  Briefcase,
  Building,
  Home,
  DollarSign,
  CircleAlert,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Clipboard,
  MessageSquareWarning,
  FileText,
  Tag,
  Check,
  X
} from 'lucide-react';
import { usePpmQuery, useReviewPpm, useRejectPpm } from '@/hooks/ppm/usePpmQueries';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const PpmDetailView = () => {
  const { t } = useTypedTranslation('work');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { user } = useAuth();
  const isReviewer = (user?.role || '').toUpperCase() === 'REVIEWER';

  const {
    data: ppm,
    isLoading,
    isError,
    error
  } = usePpmQuery(id);

  const reviewPpmMutation = useReviewPpm(id);
  const rejectPpmMutation = useRejectPpm();

  const handleBack = () => {
    navigate('/dashboard/calendar/ppms');
  };

  const handleEdit = () => {
    navigate(`/dashboard/calendar/ppms/edit/${id}`);
  };

  const handleReview = (action: 'approve' | 'reject') => {
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const confirmReview = () => {
    if (id) {
      reviewPpmMutation.mutate(
        { id, review_action: reviewAction },
        {
          onSuccess: () => {
            setReviewDialogOpen(false);
          }
        }
      );
    }
  };

  const handleRejectWithReason = () => {
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (id && rejectionReason.trim()) {
      rejectPpmMutation.mutate(
        { id, rejection_reason: rejectionReason },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setRejectionReason('');
          },
        }
      );
    }
  };

  // Status badge renderer
  const StatusBadge = ({ status }: { status: string }) => {
    let color = "";
    let icon = null;

    switch (status) {
      case "Active":
        color = "bg-green-100 text-green-800";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case "Inactive":
        color = "bg-gray-100 text-gray-800";
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      case "Under Maintenance":
        color = "bg-yellow-100 text-yellow-800";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case "Disposed":
        color = "bg-red-100 text-red-800";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case "In Use":
        color = "bg-green-100 text-green-800";
        icon = <Info className="h-3 w-3 mr-1" />;
        break;
      case "Available":
        color = "bg-teal-100 text-teal-800";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      default:
        color = "bg-green-100 text-green-800";
        icon = <Info className="h-3 w-3 mr-1" />;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('ppm.detail.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('ppm.detail.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : t('ppm.detail.errorFallback')}
        </p>
        <Button onClick={handleBack} variant="outline">
          {t('ppm.detail.backToPpms')}
        </Button>
      </div>
    );
  }

  // Not found state
  if (!ppm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('ppm.detail.notFound')}</div>
        <Button onClick={handleBack} variant="outline">
          {t('ppm.detail.backToPpms')}
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
            <h1 className="text-2xl font-bold">{t('ppm.detail.pageTitle')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('ppm.detail.idCreated', { id: ppm.id, date: new Date(ppm.created_at).toLocaleDateString() })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ppm.status} />
          {ppm?.approval_status === 'Pending' && (
            <PermissionGuard feature='ppm_setting' permission='review'>
              <Button
                onClick={() => handleReview('approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" /> {t('ppm.detail.approve')}
              </Button>
              <Button
                onClick={() => handleReview('reject')}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" /> {t('ppm.detail.reject')}
              </Button>
            </PermissionGuard>
          )}
          {ppm?.approval_status === 'Pending' && isReviewer && (
            <Button
              onClick={handleRejectWithReason}
              variant="destructive"
            >
              <X className="mr-2 h-4 w-4" /> {t('ppm.detail.rejectWithReason')}
            </Button>
          )}
          <PermissionGuard feature='ppm_setting' permission='edit'>
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> {t('ppm.detail.editPpm')}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">{t('ppm.detail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="assets">{t('ppm.detail.tabs.assets', { count: ppm?.assets?.length || 0 })}</TabsTrigger>
          <TabsTrigger value="facilities">{t('ppm.detail.tabs.facilities', { count: ppm?.facilities?.length || 0 })}</TabsTrigger>
          <TabsTrigger value="apartments">{t('ppm.detail.tabs.buildings', { count: ppm?.buildings?.length || 0 })}</TabsTrigger>
          <TabsTrigger value="payments">{t('ppm.detail.tabs.ppmItems', { count: ppm?.items_detail?.length || 0 })}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clipboard className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.basicInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.description')}</p>
                  <p>{ppm.description || t('ppm.notProvided')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.currency')}</p>
                  <p className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.currency}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.autoCreateWorkOrder')}</p>
                  <p>{ppm.auto_create_work_order ? t('ppm.yes') : t('ppm.no')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.createWorkOrderAsApproved')}</p>
                  <p>{ppm.create_work_order_as_approved ? t('ppm.yes') : t('ppm.no')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Information Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.reviewInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.approvalStatus')}</p>
                  <Badge
                    variant="outline"
                    className={
                      ppm.approval_status === 'Approved'
                        ? 'bg-green-50 text-green-700 hover:bg-green-50'
                        : ppm.approval_status === 'Pending'
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                        : 'bg-red-50 text-red-700 hover:bg-red-50'
                    }
                  >
                    {ppm.approval_status || 'Pending'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.assignedApprover')}</p>
                  <p>{ppm.approver_detail?.name || t('ppm.notAssigned')}</p>
                </div>
                {ppm.rejection_reason && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.rejectionReason')}</p>
                    <p className="text-red-600">{ppm.rejection_reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.scheduleInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.frequency')}</p>
                  <p className="flex items-center">
                    <Repeat className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.frequency} {ppm.frequency_unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.notifyBeforeDue')}</p>
                  <p className="flex items-center">
                    <Bell className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.notify_before_due} {ppm.notify_unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('ppm.detail.reminderFrequency')}</p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {t('ppm.detail.every', { count: ppm.send_reminder_every, unit: ppm.reminder_unit })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.categoryInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                    {t('ppm.detail.categoryLabel')}
                  </h3>
                  <Card className="bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{t('ppm.detail.nameLabel')}</span>
                          <span>{ppm.category_detail?.name || t('ppm.notAvailable')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{t('ppm.detail.codeLabel')}</span>
                          <span>{ppm.category_detail?.code || t('ppm.notAvailable')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{t('ppm.detail.typeLabel')}</span>
                          <span>{(ppm.category_detail as any)?.type || t('ppm.notSpecified')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <MessageSquareWarning className="h-4 w-4 mr-1 text-muted-foreground" />
                    {t('ppm.detail.subcategoryLabel')}
                  </h3>
                  <Card className="bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{t('ppm.detail.nameLabel')}</span>
                          <span>{ppm.subcategory_detail?.name || t('ppm.notAvailable')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{t('ppm.detail.codeLabel')}</span>
                          <span>{ppm.subcategory_detail?.code || t('ppm.notAvailable')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{t('ppm.detail.descriptionLabel')}</span>
                          <span>{ppm.subcategory_detail?.description || t('ppm.notAvailable')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{t('ppm.detail.activeLabel')}</span>
                          <span>{ppm.subcategory_detail?.is_active ? t('ppm.yes') : t('ppm.no')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <CircleAlert className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.safetyInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm">{ppm.activities_safety_tips || t('ppm.detail.noSafetyTips')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.assetsTitle', { count: ppm?.assets?.length || 0 })}
              </CardTitle>
              <CardDescription>{t('ppm.detail.assetsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {ppm?.assets_detail?.map((asset) => (
                  <Card key={asset.id} className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{asset.asset_name} - {asset.serial_number || t('ppm.notAvailable')}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">{t('ppm.detail.assetTag')}</p>
                              <p className="font-medium">{asset.asset_tag}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{t('ppm.detail.serialNumber')}</p>
                              <p className="font-medium">{asset.serial_number || t('ppm.notAvailable')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{t('ppm.detail.assetType')}</p>
                              <p className="font-medium">{asset.asset_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{t('ppm.detail.condition')}</p>
                              <p className="font-medium">{asset.condition}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{t('ppm.detail.purchasedAmount')}</p>
                          <p className="text-xl font-bold">${asset.purchased_amount}</p>
                          <p className="text-xs text-muted-foreground">{t('ppm.detail.purchaseDate')}: {new Date(asset.purchase_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">{t('ppm.detail.purchaseDate')}</p>
                            <p className="text-sm">{new Date(asset.purchase_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('ppm.detail.lifespan')}</p>
                            <p className="text-sm">{asset.lifespan || t('ppm.notSpecified')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('ppm.detail.oemWarranty')}</p>
                            <p className="text-sm">{asset.oem_warranty || t('ppm.notSpecified')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('ppm.detail.assetCategory')}</p>
                            <p className="text-sm">{asset.category_detail?.name || t('ppm.notAvailable')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.facilitiesTitle', { count: ppm?.facilities?.length || 0 })}
              </CardTitle>
              <CardDescription>{t('ppm.detail.facilitiesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ppm?.facilities_detail?.map((facility) => (
                  <Card key={facility.id} className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{facility.name}</h3>
                          <p className="text-sm text-muted-foreground">{t('ppm.detail.facilityCode', { code: facility.code })}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('ppm.detail.facilityType')}</p>
                          <p className="text-sm">{facility.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('ppm.detail.managerId')}</p>
                          <p className="text-sm">{facility.manager}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-muted-foreground mb-2">{t('ppm.detail.gpsAddress')}</p>
                        <p className="text-sm">{facility.address_gps || t('ppm.notProvided')}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('ppm.detail.cluster')}</p>
                          <p className="text-sm">{facility.cluster_detail?.name || t('ppm.notAvailable')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buildings Tab */}
        <TabsContent value="apartments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.buildingsTitle', { count: ppm?.buildings?.length || 0 })}
              </CardTitle>
              <CardDescription>{t('ppm.detail.buildingsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>{t('ppm.detail.buildingsPlaceholder')}</p>
                  <p className="text-sm">{t('ppm.detail.buildingsCount', { count: ppm?.buildings?.length || 0 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PPM Items Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                {t('ppm.detail.ppmItemsTitle', { count: ppm?.items_detail?.length || 0 })}
              </CardTitle>
              <CardDescription>{t('ppm.detail.ppmItemsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ppm?.items_detail?.map((item) => (
                  <Card key={item.id} className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-medium">{item.description}</h3>
                          <p className="text-sm text-muted-foreground">{t('ppm.detail.itemId', { id: item.id })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{t('ppm.detail.totalPrice')}</p>
                          <p className="text-xl font-bold text-green-600">₦{item.total_price}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('ppm.detail.quantity')}</p>
                          <p className="text-sm font-medium">{item.qty}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('ppm.detail.unitPrice')}</p>
                          <p className="text-sm font-medium">₦{item.unit_price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('ppm.detail.unit')}</p>
                          <p className="text-sm font-medium">{item.unit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!ppm?.items_detail || ppm?.items_detail?.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>{t('ppm.detail.noItemsFound')}</p>
                    <p className="text-sm">{t('ppm.detail.noItemsHint')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Confirmation Dialog */}
      <AlertDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewAction === 'approve' ? t('ppm.detail.reviewDialog.approveTitle') : t('ppm.detail.reviewDialog.rejectTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('ppm.detail.reviewDialog.confirmMessage', {
                action: reviewAction === 'approve'
                  ? t('ppm.detail.reviewDialog.approveAction')
                  : t('ppm.detail.reviewDialog.rejectAction')
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('ppm.detail.reviewDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReview}
              disabled={reviewPpmMutation.isPending}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewPpmMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {reviewAction === 'approve' ? t('ppm.detail.reviewDialog.approving') : t('ppm.detail.reviewDialog.rejecting')}
                </>
              ) : (
                <>
                  {reviewAction === 'approve' ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  {reviewAction === 'approve' ? t('ppm.detail.reviewDialog.approve') : t('ppm.detail.reviewDialog.reject')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ppm.detail.rejectDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('ppm.detail.rejectDialog.description', { id: ppm.id })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">{t('ppm.detail.rejectDialog.reasonLabel')} <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejection_reason"
                placeholder={t('ppm.detail.rejectDialog.reasonPlaceholder')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
              }}
            >
              {t('ppm.detail.rejectDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || rejectPpmMutation.isPending}
            >
              {rejectPpmMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('ppm.detail.rejectDialog.rejecting')}
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  {t('ppm.detail.rejectDialog.submit')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PpmDetailView;
