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
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const VendorDetailView = () => {
  const { t } = useTypedTranslation('accounts');
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: vendor,
    isLoading,
    isError,
    error
  } = useVendorQuery(slug);

  const handleBack = () => navigate('/dashboard/accounts/vendors');
  const handleEdit = () => navigate(`/dashboard/accounts/vendors/edit/${slug}`);

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
          <p className="text-sm text-muted-foreground">{t('vendor.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">{t('vendor.detail.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : t('vendor.detail.unknownError')}
        </p>
        <Button onClick={handleBack} variant="outline">
          {t('vendor.detail.backToList')}
        </Button>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">{t('vendor.detail.notFound')}</div>
        <Button onClick={handleBack} variant="outline">
          {t('vendor.detail.backToList')}
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
              {t('vendor.detail.vendorLabel')} {getTypeBadge(vendor.type)}
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
              <Edit className="mr-2 h-4 w-4" /> {t('vendor.detail.editVendor')}
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
              {t('vendor.detail.vendorInfo')}
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
                      {vendor.email || t('vendor.detail.noEmail')}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${vendor.phone}`} className="text-green-600 hover:underline">
                      {vendor.phone || t('vendor.detail.noPhone')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking & Financial Info */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {t('vendor.detail.bankingInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('vendor.detail.fields.accountName')}</h3>
                <p className="text-lg font-medium">{vendor.account_name || t('vendor.detail.notProvided')}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('vendor.detail.fields.bank')}</h3>
                <p className="text-lg">{vendor.bank || t('vendor.detail.notProvided')}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('vendor.detail.fields.accountNumber')}</h3>
                <p className="text-lg font-mono">
                  {vendor.account_number ?
                    <span className="bg-gray-100 px-2 py-1 rounded">{vendor.account_number}</span> :
                    t('vendor.detail.notProvided')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('vendor.detail.fields.currency')}</h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-lg">{vendor.currency || t('vendor.detail.notProvided')}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{t('vendor.detail.verifiedAccount')}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('vendor.detail.verifiedAccountDesc')}
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
              {t('vendor.detail.activityTitle')}
            </CardTitle>
            <CardDescription>
              {t('vendor.detail.activityDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-500 font-medium mb-1">{t('vendor.detail.noActivity')}</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                {t('vendor.detail.noActivityDesc')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDetailView;
