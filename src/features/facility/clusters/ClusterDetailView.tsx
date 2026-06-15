// src/features/facility/clusters/ClusterDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  Loader2,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Hash,
  Sparkles,
  Crown,
  Network
} from 'lucide-react';
import { useClusterQuery } from '@/hooks/cluster/useClusterQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { User as UserType } from '@/types/user';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const ClusterDetailView = () => {
  const { t } = useTypedTranslation('facility');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Using our custom hook instead of direct query
  const {
    data: cluster,
    isLoading,
    isError,
    error
  } = useClusterQuery(id);

  // Get users to resolve manager name
  const {
    data: users = []
  } = useList<UserType>('users', 'accounts/api/users/');

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/facility/clusters');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/facility/clusters/edit/${id}`);
  };

  // Get manager name helper function
  const getManagerName = (managerId: number) => {
    const manager = users.find(user => user.id === managerId);
    return manager ? `${manager.first_name} ${manager.last_name}` : t('cluster.unknownManager');
  };

  // Get manager initials
  const getManagerInitials = (managerId: number) => {
    const manager = users.find(user => user.id === managerId);
    if (!manager) return 'UM';
    return `${manager.first_name?.[0] || ''}${manager.last_name?.[0] || ''}`;
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time helper function
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate days since creation
  const getDaysSinceCreation = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 p-8 bg-white backdrop-blur-sm rounded-2xl shadow-xl border">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 h-12 w-12 animate-pulse bg-primary/10 rounded-full"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">{t('cluster.detail.loading')}</p>
            <p className="text-sm text-muted-foreground">{t('cluster.detail.loadingSubtitle')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-6 p-8 bg-white backdrop-blur-sm rounded-2xl shadow-xl border max-w-md">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Network className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-destructive mb-2">{t('cluster.detail.error')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : t('cluster.detail.errorFallback')}
            </p>
          </div>
          <Button onClick={handleBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('cluster.detail.backButton')}
          </Button>
        </div>
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-6 p-8 bg-white backdrop-blur-sm rounded-2xl shadow-xl border max-w-md">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Network className="h-8 w-8 text-amber-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-amber-700 mb-2">{t('cluster.detail.notFound')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('cluster.detail.notFoundMessage')}
            </p>
          </div>
          <Button onClick={handleBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('cluster.detail.backButton')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('cluster.detail.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('cluster.detail.subtitle')}</p>
              </div>
            </div>
            <Button
              onClick={handleEdit}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Edit className="mr-2 h-4 w-4" />
              {t('cluster.detail.editButton')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-primary/5 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 bg-primary/5 rounded-full"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-primary/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
                  <Network className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-foreground">{cluster.name}</h2>
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-lg">{cluster.region_detail?.name}</span>
                    <span className="text-sm bg-primary/10 px-2 py-1 rounded-full text-primary">
                      {cluster.region_detail?.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>{t('cluster.detail.clusterId')} {cluster.id}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Region Information */}
          <Card className="bg-white border shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                {t('cluster.detail.regionInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">{cluster.region_detail?.name}</p>
                <p className="text-sm text-muted-foreground">{cluster.region_detail?.country}</p>
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit border border-blue-200">
                  {t('cluster.detail.regionId')} {cluster.region}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manager Information */}
          <Card className="bg-white border shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                  <Crown className="h-4 w-4 text-primary" />
                </div>
                {t('cluster.detail.manager')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/15 rounded-full flex items-center justify-center text-primary font-semibold shadow-lg border border-primary/30">
                  {getManagerInitials(cluster.select_manager)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{getManagerName(cluster.select_manager)}</p>
                  <p className="text-sm text-muted-foreground">{t('cluster.detail.managerRole')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creation Date */}
          <Card className="bg-white border shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
                {t('cluster.detail.created')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">{formatDate(cluster.created_at)}</p>
                <p className="text-sm text-muted-foreground">{formatTime(cluster.created_at)}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit border border-emerald-200">
                  <Clock className="h-3 w-3" />
                  {getDaysSinceCreation(cluster.created_at)} {t('cluster.detail.daysAgo')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card className="bg-white border shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                {t('cluster.detail.lastUpdated')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">{formatDate(cluster.updated_at)}</p>
                <p className="text-sm text-muted-foreground">{formatTime(cluster.updated_at)}</p>
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit border border-amber-200">
                  {t('cluster.detail.recentlyModified')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <Card className="bg-white border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <Network className="h-4 w-4 text-primary" />
              </div>
              {t('cluster.detail.overview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border border-primary/10">
              <p className="text-lg leading-relaxed text-foreground">
                {t('cluster.detail.summary', {
                  name: cluster.name,
                  region: cluster.region_detail?.name,
                  country: cluster.region_detail?.country,
                  manager: getManagerName(cluster.select_manager),
                  createdAt: formatDate(cluster.created_at),
                  updatedAt: formatDate(cluster.updated_at),
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClusterDetailView;
