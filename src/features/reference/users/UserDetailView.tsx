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

const UserDetailView = () => {
  // Simulated loading states - in a real app, these would come from the API hook
  // const [isLoading] = useState(false);
  // const [isError] = useState(false);
  // const error = null;

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

  // Format date to readable format
  // const formatDate = (dateString) => {
  //   try {
  //     if (!dateString) return 'N/A';
  //     const date = new Date(dateString);
  //     const options = { year: 'numeric', month: 'short', day: 'numeric' };
  //     return date.toLocaleDateString('en-US', options);
  //   } catch (error) {
  //     return dateString || 'N/A';
  //   }
  // };

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
  

  // Status badge component
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading user details</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
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
            Edit User
          </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex md:inline-flex mb-6 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="profile" className="rounded-md">Profile</TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-md">Permissions</TabsTrigger>
          <TabsTrigger value="facilities" className="rounded-md">Facilities</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-md">Activity</TabsTrigger>
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
                    <p className="text-sm text-muted-foreground">Designation</p>
                    <p className="text-xl font-semibold">{user.designation}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Award className="h-4 w-4 mr-1.5" />
                    {user.team_lead ? 'Team Lead' : 'Team Member'}
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
                    <p className="text-sm text-muted-foreground">Approval Limit</p>
                    <p className="text-xl font-semibold">${user.approval_limit}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-1.5" />
                    {user.generate_reports ? 'Can generate reports' : 'Cannot generate reports'}
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
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="text-xl font-semibold flex items-center gap-2">
                      <StatusBadge status={user.status} />
                      {user.is_verified && 
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">Verified</Badge>
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Joined: {formatDate(user.date_joined)}
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
                  Personal Information
                </CardTitle>
                <CardDescription>User details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 px-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Full Name</h4>
                      <p className="font-medium">{user.first_name} {user.last_name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Gender</h4>
                      <p className="font-medium">{user.gender}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Email</h4>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Phone</h4>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Date of Birth</h4>
                      <p className="font-medium">{formatDate(user.date_of_birth)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Nationality</h4>
                      <p className="font-medium flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        {user.nationality}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">User ID</h4>
                      <p className="font-medium">{user.user_id}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Passport No.</h4>
                      <p className="font-medium">{user.passport_number}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-1">Address</h4>
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
                  Account Information
                </CardTitle>
                <CardDescription>Account status and permissions</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 px-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Status</h4>
                      <StatusBadge status={user.status} />
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Email Verified</h4>
                      <StatusBadge status={user.is_verified ? 'Active' : 'Inactive'} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Account Blocked</h4>
                      <StatusBadge status={user.is_blocked ? 'Active' : 'Inactive'} />
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Account Active</h4>
                      <StatusBadge status={user.is_active ? 'Active' : 'Inactive'} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Date Joined</h4>
                      <p className="font-medium">{formatDate(user.date_joined)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Last Login</h4>
                      <p className="font-medium">{formatDate(user.last_login)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">User Capabilities</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center p-2 rounded-md bg-muted/30">
                        <CheckCircle2 className={`h-4 w-4 mr-2 ${user.team_lead ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm">Team Lead</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md bg-muted/30">
                        <CheckCircle2 className={`h-4 w-4 mr-2 ${user.generate_reports ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm">Generate Reports</span>
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
                Access Control
              </CardTitle>
              <CardDescription>User's access permissions across the system</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-md">
                        <Building className="h-5 w-5 text-green-700 dark:text-green-400" />
                      </div>
                      <h3 className="font-medium">Facilities</h3>
                    </div>
                    <Badge className={user.access_to_all_facilities 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_facilities ? "All Access" : "Limited"}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Accessible Facilities: {user.facility_detail?.length || 0}</p>
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
                      <h3 className="font-medium">Apartments</h3>
                    </div>
                    <Badge className={user.access_to_all_apartments 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_apartments ? "All Access" : "Limited"}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Accessible Apartments: {user.apartments_detail?.length || 0}</p>
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
                      <h3 className="font-medium">Warehouses</h3>
                    </div>
                    <Badge className={user.access_to_all_warehouses 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_warehouses ? "All Access" : "Limited"}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Accessible Warehouses: {user.warehouse_detail?.length || 0}</p>
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
                      <h3 className="font-medium">Departments</h3>
                    </div>
                    <Badge className={user.access_to_all_departments 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_departments ? "All Access" : "Limited"}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Accessible Departments: {user.departments_detail?.length || 0}</p>
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
                      <h3 className="font-medium">Clients</h3>
                    </div>
                    <Badge className={user.access_to_all_clients 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"}>
                      {user.access_to_all_clients ? "All Access" : "Limited"}
                    </Badge>
                  </div>
                  <div className="border-t border-green-200/50 dark:border-green-800/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Accessible Clients: {user.clients_detail?.length || 0}</p>
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
                Assigned Facilities
              </CardTitle>
              <CardDescription>Facilities the user has access to</CardDescription>
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
                Assigned Apartments
              </CardTitle>
              <CardDescription>Apartments the user has access to</CardDescription>
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
                        <p className="text-muted-foreground">{apartment.building_detail?.name || "No building assigned"}</p>
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
                Recent Activity
              </CardTitle>
              <CardDescription>User's recent system activity</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="relative border-l border-muted pl-6 space-y-6 max-w-3xl">
                <div className="relative">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[22px] top-1"></div>
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>Last Login</span>
                    <span className="text-xs text-muted-foreground">{formatDate(user.last_login)}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">User logged into the system</p>
                </div>
                
                <div className="relative">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[22px] top-1"></div>
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>Account Created</span>
                    <span className="text-xs text-muted-foreground">{formatDate(user.date_joined)}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">User account was created</p>
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
          Back to Users
        </Button>
        {/* <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit User
        </Button> */}
      </div>
    </div>
  );
};

export default UserDetailView;