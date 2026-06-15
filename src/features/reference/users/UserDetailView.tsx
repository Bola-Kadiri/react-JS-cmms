import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Loader2,
  Calendar,
  Building,
  MapPin,
  FileText,
  CreditCard,
  Clock,
  User,
  Shield,
  Award,
  Flag,
  Mail,
  Phone,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Warehouse,
  Settings,
  BadgePercent,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserQuery } from '@/hooks/user/useUserQueries';
import { useNavigate, useParams } from 'react-router-dom';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const UserDetailView = () => {
  const { t } = useTypedTranslation('accounts');

  const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const {
      data: user,
      isLoading,
      isError,
      error
    } = useUserQuery(slug);

    const handleBack = () => {
      navigate('/dashboard/accounts/users');
    };

    const handleEdit = () => {
      navigate(`/dashboard/accounts/users/edit/${slug}`);
    };

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  const StatusBadge = ({ status }) => {
    if (!status) return null;

    switch(status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="border-red-200 text-red-600 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">{t('user.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('user.detail.error')}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : t('user.detail.unknownError')}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('user.detail.backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/10">
              <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="bg-primary/5 text-primary">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="font-normal">
                  {user.roles}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={user.status} />
          <PermissionGuard feature='reference' permission='edit'>
          <Button onClick={handleEdit} className="gap-1.5">
            <Edit className="h-4 w-4" />
            {t('user.detail.editUser')}
          </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex md:inline-flex mb-6 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="profile" className="rounded-md">{t('user.detail.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-md">{t('user.detail.tabs.permissions')}</TabsTrigger>
          <TabsTrigger value="facilities" className="rounded-md">{t('user.detail.tabs.facilities')}</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-md">{t('user.detail.tabs.activity')}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* User Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-b from-primary/5 to-primary/0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('user.detail.summary.designation')}</p>
                    <p className="text-xl font-semibold">{user.designation}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Award className="h-4 w-4 mr-1.5" />
                    {user.team_lead ? t('user.detail.summary.teamLead') : t('user.detail.summary.teamMember')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-green-50 to-green-50/20 dark:from-green-950/20 dark:to-green-950/5 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <BadgePercent className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('user.detail.summary.approvalLimit')}</p>
                    <p className="text-xl font-semibold">${user.approval_limit}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-1.5" />
                    {user.generate_reports ? t('user.detail.summary.canGenerateReports') : t('user.detail.summary.cannotGenerateReports')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-green-50 to-green-50/20 dark:from-green-950/20 dark:to-green-950/5 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('user.detail.summary.accountStatus')}</p>
                    <p className="text-xl font-semibold flex items-center gap-2">
                      <StatusBadge status={user.status} />
                      {user.is_verified &&
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">{t('user.detail.verified')}</Badge>
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    {t('user.detail.summary.joined')} {formatDate(user.date_joined)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3 bg-muted/30">
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  {t('user.detail.personalInfo.title')}
                </CardTitle>
                <CardDescription>{t('user.detail.personalInfo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 px-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.fullName')}</h4>
                      <p className="font-medium">{user.first_name} {user.last_name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.gender')}</h4>
                      <p className="font-medium">{user.gender}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.email')}</h4>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.phone')}</h4>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.dateOfBirth')}</h4>
                      <p className="font-medium">{formatDate(user.date_of_birth)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.nationality')}</h4>
                      <p className="font-medium flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        {user.nationality}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.userId')}</h4>
                      <p className="font-medium">{user.user_id}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.passportNo')}</h4>
                      <p className="font-medium">{user.passport_number}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.personalInfo.address')}</h4>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      {user.address}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader className="pb-3 bg-muted/30">
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  {t('user.detail.accountInfo.title')}
                </CardTitle>
                <CardDescription>{t('user.detail.accountInfo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 px-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.accountInfo.status')}</h4>
                      <StatusBadge status={user.status} />
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.accountInfo.emailVerified')}</h4>
                      <StatusBadge status={user.is_verified ? 'Active' : 'Inactive'} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.accountInfo.accountBlocked')}</h4>
                      <StatusBadge status={user.is_blocked ? 'Active' : 'Inactive'} />
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.accountInfo.accountActive')}</h4>
                      <StatusBadge status={user.is_active ? 'Active' : 'Inactive'} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.accountInfo.dateJoined')}</h4>
                      <p className="font-medium">{formatDate(user.date_joined)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('user.detail.accountInfo.lastLogin')}</h4>
                      <p className="font-medium">{formatDate(user.last_login)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">{t('user.detail.accountInfo.capabilities')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center p-2 rounded-md bg-muted/30">
                        <CheckCircle2 className={`h-4 w-4 mr-2 ${user.team_lead ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm">{t('user.detail.accountInfo.teamLead')}</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md bg-muted/30">
                        <CheckCircle2 className={`h-4 w-4 mr-2 ${user.generate_reports ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm">{t('user.detail.accountInfo.generateReports')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="flex items-center text-lg">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                {t('user.detail.permissions.title')}
              </CardTitle>
              <CardDescription>{t('user.detail.permissions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-md">
                        <Building className="h-5 w-5 text-green-700 dark:text-green-400" />
                      </div>
                      <h3 className="font-medium">{t('user.detail.permissions.facilitiesTitle')}</h3>
                    </div>
                    <Badge className={user.access_to_all_facilities
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_facilities ? t('user.detail.permissions.allAccess') : t('user.detail.permissions.limited')}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {t('user.detail.permissions.facilitiesCount', { count: user.facility_detail?.length || 0 })}
                    </p>
                    <div className="max-h-28 overflow-y-auto">
                      {user.facility_detail?.map(facility => (
                        <div key={facility.id} className="flex items-center justify-between mb-2 p-2 bg-white/70 dark:bg-white/5 rounded text-sm">
                          <span>{facility.name}</span>
                          <StatusBadge status={facility.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-md">
                        <Home className="h-5 w-5 text-green-700 dark:text-green-400" />
                      </div>
                      <h3 className="font-medium">{t('user.detail.permissions.apartmentsTitle')}</h3>
                    </div>
                    <Badge className={user.access_to_all_apartments
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_apartments ? t('user.detail.permissions.allAccess') : t('user.detail.permissions.limited')}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {t('user.detail.permissions.apartmentsCount', { count: user.apartments_detail?.length || 0 })}
                    </p>
                    <div className="max-h-28 overflow-y-auto">
                      {user.apartments_detail?.map(apartment => (
                        <div key={apartment.id} className="flex items-center justify-between mb-2 p-2 bg-white/70 dark:bg-white/5 rounded text-sm">
                          <span>{apartment.no} - {apartment.type}</span>
                          <StatusBadge status={apartment.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-md">
                        <Warehouse className="h-5 w-5 text-green-700 dark:text-green-400" />
                      </div>
                      <h3 className="font-medium">{t('user.detail.permissions.warehousesTitle')}</h3>
                    </div>
                    <Badge className={user.access_to_all_warehouses
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_warehouses ? t('user.detail.permissions.allAccess') : t('user.detail.permissions.limited')}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {t('user.detail.permissions.warehousesCount', { count: user.warehouse_detail?.length || 0 })}
                    </p>
                    <div className="max-h-28 overflow-y-auto">
                      {user.warehouse_detail?.map(warehouse => (
                        <div key={warehouse.id} className="flex items-center justify-between mb-2 p-2 bg-white/70 dark:bg-white/5 rounded text-sm">
                          <span>{warehouse.title}</span>
                          <StatusBadge status={warehouse.is_active ? 'Active' : 'Inactive'} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-md">
                        <Briefcase className="h-5 w-5 text-green-700 dark:text-green-400" />
                      </div>
                      <h3 className="font-medium">{t('user.detail.permissions.departmentsTitle')}</h3>
                    </div>
                    <Badge className={user.access_to_all_departments
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_departments ? t('user.detail.permissions.allAccess') : t('user.detail.permissions.limited')}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {t('user.detail.permissions.departmentsCount', { count: user.departments_detail?.length || 0 })}
                    </p>
                    <div className="max-h-28 overflow-y-auto">
                      {user.departments_detail?.map(department => (
                        <div key={department.id} className="flex items-center justify-between mb-2 p-2 bg-white/70 dark:bg-white/5 rounded text-sm">
                          <span>{department.name}</span>
                          <StatusBadge status={department.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-md">
                        <Users className="h-5 w-5 text-green-700 dark:text-green-400" />
                      </div>
                      <h3 className="font-medium">{t('user.detail.permissions.clientsTitle')}</h3>
                    </div>
                    <Badge className={user.access_to_all_clients
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_clients ? t('user.detail.permissions.allAccess') : t('user.detail.permissions.limited')}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {t('user.detail.permissions.clientsCount', { count: user.clients_detail?.length || 0 })}
                    </p>
                    <div className="max-h-28 overflow-y-auto">
                      {user.clients_detail?.map(client => (
                        <div key={client.id} className="flex items-center justify-between mb-2 p-2 bg-white/70 dark:bg-white/5 rounded text-sm">
                          <span>{client.name}</span>
                          <StatusBadge status={client.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-6">
          <Card>
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="flex items-center text-lg">
                <Building className="h-5 w-5 mr-2 text-primary" />
                {t('user.detail.facilitiesTab.assignedFacilities')}
              </CardTitle>
              <CardDescription>{t('user.detail.facilitiesTab.facilitiesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.facility_detail?.map(facility => (
                  <Card key={facility.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-2 ${facility.status === "Active" ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Badge variant="outline" className="mb-2">{facility.code}</Badge>
                          <h3 className="text-lg font-medium">{facility.name}</h3>
                        </div>
                        <StatusBadge status={facility.status} />
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">{facility.type}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="flex items-center text-lg">
                <Home className="h-5 w-5 mr-2 text-primary" />
                {t('user.detail.facilitiesTab.assignedApartments')}
              </CardTitle>
              <CardDescription>{t('user.detail.facilitiesTab.apartmentsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.apartments_detail?.map(apartment => (
                  <Card key={apartment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-2 ${apartment.status === "Active" ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Badge variant="outline" className="mb-2">{apartment.no}</Badge>
                          <h3 className="text-lg font-medium">{apartment.type}</h3>
                        </div>
                        <StatusBadge status={apartment.status} />
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">{apartment.building_detail?.name || t('user.detail.facilitiesTab.noBuilding')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                {t('user.detail.activity.title')}
              </CardTitle>
              <CardDescription>{t('user.detail.activity.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="relative border-l border-muted pl-6 space-y-6 max-w-3xl">
                <div className="relative">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[22px] top-1"></div>
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>{t('user.detail.activity.lastLogin')}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(user.last_login)}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('user.detail.activity.lastLoginDesc')}</p>
                </div>

                <div className="relative">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[22px] top-1"></div>
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>{t('user.detail.activity.accountCreated')}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(user.date_joined)}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('user.detail.activity.accountCreatedDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 mt-8">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('user.detail.backToList')}
        </Button>
      </div>
    </div>
  );
};

export default UserDetailView;
