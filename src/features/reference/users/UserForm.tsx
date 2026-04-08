// src/features/asset/users/UserForm.tsx
import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { User } from '@/types/user';
import { Category } from '@/types/category';
import { Facility } from '@/types/facility';
import { Apartment } from '@/types/apartment';
import { Department } from '@/types/department';
import { Building } from '@/types/building';
import { Warehouse } from '@/types/warehouse';
import { Client } from '@/types/client';
import { useUserQuery, useCreateUser, useUpdateUser } from '@/hooks/user/useUserQueries';

import { useList } from '@/hooks/crud/useCrudOperations';
import { toast } from '@/components/ui/use-toast';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const ownerEndpoint = 'accounts/api/users/';
const catEndpoint = 'accounts/api/categories/';
const departmentEndpoint = 'accounts/api/departments/';
const clientEndpoint = 'accounts/api/clients/';
const facilityEndpoint = 'facility/api/api/facilities/';
// const apartmentEndpoint = 'facility/api/api/apartments/';
const buildingEndpoint = 'facility/api/api/buildings/';
const warehouseEndpoint = 'asset_inventory/api/warehouses/';

// Form schema definition
const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  roles: z.enum([
    'SUPER ADMIN', 
    'ADMIN', 
    'REQUESTER', 
    'REVIEWER', 
    'APPROVAL', 
    'PROCUREMENT AND STORE'
  ]),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  designation: z.string(),
  date_of_birth: z.string(),
  gender: z.enum(['Male', 'Female', 'Other']),
  nationality: z.string(),
  passport_number: z.string(),
  address: z.string(),
  status: z.enum(['Active', 'Inactive']),
  team_lead: z.boolean(),
  generate_reports: z.boolean(),
  approval_limit: z.string(),
  is_verified: z.boolean(),
  is_blocked: z.boolean(),
  is_active: z.boolean(),
  access_to_all_facilities: z.boolean(),
  facility: z.array(z.number()),
  access_to_all_flats: z.boolean(),
  flats: z.array(z.number()),
  // access_to_all_apartments: z.boolean(),
  // apartments: z.array(z.number()),
  access_to_all_categories: z.boolean(),
  categories: z.array(z.number()),
  access_to_all_warehouses: z.boolean(),
  warehouse: z.array(z.number()),
  access_to_all_departments: z.boolean(),
  departments: z.array(z.number()),
  access_to_all_clients: z.boolean(),
  clients: z.array(z.number()),
  supervisor: z.number().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    personal: true,
    additional: false,
    roles: false,
    options: false,
    accesses: false
  });
  
  // User form setup
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      roles: 'SUPER ADMIN',
      email: '',
      phone: '',
      designation: '',
      date_of_birth: '',
      gender: 'Male',
      nationality: '',
      passport_number: '',
      address: '',
      status: 'Active',
      team_lead: false,
      generate_reports: false,
      approval_limit: '',
      is_verified: false,
      is_blocked: false,
      is_active: true,
      access_to_all_facilities: false,
      facility: [],
      access_to_all_flats: false,
      flats: [],
      // access_to_all_apartments: false,
      // apartments: [],
      access_to_all_categories: false,
      categories: [],
      access_to_all_warehouses: false,
      warehouse: [],
      access_to_all_departments: false,
      departments: [],
      access_to_all_clients: false,
      clients: [],
      supervisor: undefined
    }
  });

  // Data fetching hooks
  const { data: users = [] } = useList<User>('users', ownerEndpoint);
  const { data: categories = [] } = useList<Category>('categories', catEndpoint);
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);
  // const { data: apartments = [] } = useList<Apartment>('apartments', apartmentEndpoint);
  const { data: departments = [] } = useList<Department>('departments', departmentEndpoint);
  const { data: buildings = [] } = useList<Building>('buildings', buildingEndpoint);
  const { data: clients = [] } = useList<Client>('clients', clientEndpoint);
  const { data: warehouses = [] } = useList<Warehouse>('warehouses', warehouseEndpoint);

  const {hasNoAccess} = useFeatureAccess('reference')

  // Fetch user data for edit mode using our custom hook
  const { 
    data: userData, 
    isLoading: isLoadingUser, 
    isError: isUserError,
    error: userError
  } = useUserQuery(isEditMode ? slug : undefined);

  // Use our custom mutation hooks
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser(slug);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle user data loading
  useEffect(() => {
    if (userData && isEditMode) {
      // Reset the form with user data
      userForm.reset({
        first_name: userData.first_name,
        last_name: userData.last_name,
        roles: userData.roles,
        email: userData.email,
        phone: userData.phone,
        designation: userData.designation,
        date_of_birth: userData.date_of_birth,
        gender: userData.gender,
        nationality: userData.nationality,
        passport_number: userData.passport_number,
        address: userData.address,
        status: userData.status,
        team_lead: userData.team_lead,
        generate_reports: userData.generate_reports,
        approval_limit: userData.approval_limit,
        is_verified: userData.is_verified,
        is_blocked: userData.is_blocked,
        is_active: userData.is_active,
        access_to_all_facilities: userData.access_to_all_facilities,
        facility: Array.isArray(userData.facility) ? userData.facility : [],
        access_to_all_flats: userData.access_to_all_flats,
        flats: Array.isArray(userData.flats) ? userData.flats : [],
        // access_to_all_apartments: userData.access_to_all_apartments,
        // apartments: Array.isArray(userData.apartments) ? userData.apartments : [],
        access_to_all_categories: userData.access_to_all_categories,
        categories: Array.isArray(userData.categories) ? userData.categories : [],
        access_to_all_warehouses: userData.access_to_all_warehouses,
        warehouse: Array.isArray(userData.warehouse) ? userData.warehouse : [],
        access_to_all_departments: userData.access_to_all_departments,
        departments: Array.isArray(userData.departments) ? userData.departments : [],
        access_to_all_clients: userData.access_to_all_clients,
        clients: Array.isArray(userData.clients) ? userData.clients : [],
        supervisor: userData.supervisor
      });
    }
  }, [userData, isEditMode, userForm]);

  const onSubmitUser = async (data: UserFormValues) => {
    try {
      if (isEditMode && slug) {
        updateUserMutation.mutate(
          { slug, user: data },
          { onSuccess: () => navigate('/dashboard/accounts/users') }
        );
      } else {
        createUserMutation.mutate(
          data as unknown as Omit<User, 'id'>,
          { onSuccess: () => navigate('/dashboard/accounts/users') }
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/accounts/users');
  };

  if (isEditMode && isLoadingUser) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isUserError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading user details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {userError instanceof Error ? userError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  
        
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h1>
        </div>
      </div>

      <Form {...userForm}>
        <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-6">
          {/* First Collapsible: Personal Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('personal')}
            >
              <h2 className="text-lg font-medium">Personal Information</h2>
              {openSections.personal ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.personal && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter first name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter last name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter designation"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="supervisor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supervisor</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supervisor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.first_name} {user.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Second Collapsible: Additional Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('additional')}
            >
              <h2 className="text-lg font-medium">Additional Information</h2>
              {openSections.additional ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.additional && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter nationality"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="passport_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter passport number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={userForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter address"
                          {...field}
                          className="min-h-[100px] resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          {/* Third Collapsible: Roles & Status */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('roles')}
            >
              <h2 className="text-lg font-medium">Role & Status</h2>
              {openSections.roles ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.roles && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SUPER ADMIN">SUPER ADMIN</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                            <SelectItem value="REQUESTER">REQUESTER</SelectItem>
                            <SelectItem value="REVIEWER">REVIEWER</SelectItem>
                            <SelectItem value="APPROVAL">APPROVAL</SelectItem>
                            <SelectItem value="PROCUREMENT AND STORE">PROCUREMENT AND STORE</SelectItem>
                            {/* <SelectItem value="Facility Account">Facility Account</SelectItem>
                            <SelectItem value="Facility Store">Facility Store</SelectItem>
                            <SelectItem value="Facility View">Facility View</SelectItem> */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={`${field.value === 'Active' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Fourth Collapsible: Options */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('options')}
            >
              <h2 className="text-lg font-medium">Options</h2>
              {openSections.options ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.options && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={userForm.control}
                    name="team_lead"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Team Lead</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark if user is a team lead</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="generate_reports"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Generate Reports</FormLabel>
                          <p className="text-sm text-muted-foreground">User can generate reports</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={userForm.control}
                    name="is_verified"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Verified</FormLabel>
                          <p className="text-sm text-muted-foreground">User is verified</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="is_blocked"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Blocked</FormLabel>
                          <p className="text-sm text-muted-foreground">User is blocked</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Active</FormLabel>
                          <p className="text-sm text-muted-foreground">User is active</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={userForm.control}
                  name="approval_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approval Limit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Enter approval limit amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          {/* Fifth Collapsible: Access Permissions */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('accesses')}
            >
              <h2 className="text-lg font-medium">Access Permissions</h2>
              {openSections.accesses ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.accesses && (
              <div className="p-6 space-y-8 bg-white">
                {/* Facilities Access */}
                <div>
                  <h3 className="text-md font-medium mb-3">Facility Access</h3>
                  <div className="space-y-6">
                    <FormField
                      control={userForm.control}
                      name="access_to_all_facilities"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium leading-none">Access to All Facilities</FormLabel>
                            <p className="text-sm text-muted-foreground">Grant access to all facilities</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!userForm.watch('access_to_all_facilities') && (
                      <FormField
                        control={userForm.control}
                        name="facility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Facilities</FormLabel>
                            <div className="border rounded-md p-4 space-y-4 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {facilities.map(facility => (
                                  <div key={facility.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`facility-${facility.id}`}
                                      checked={field.value.includes(Number(facility.id))}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, facility.id]);
                                        } else {
                                          field.onChange(field.value.filter(id => id !== Number(facility.id)));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`facility-${facility.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {facility.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Flats Access */}
                <div>
                  <h3 className="text-md font-medium mb-3">Area / Building Access</h3>
                  <div className="space-y-6">
                    <FormField
                      control={userForm.control}
                      name="access_to_all_flats"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium leading-none">Access to All Area / Building</FormLabel>
                            <p className="text-sm text-muted-foreground">Grant access to all Area / Building</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!userForm.watch('access_to_all_flats') && (
                      <FormField
                        control={userForm.control}
                        name="flats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Area / Building</FormLabel>
                            <div className="border rounded-md p-4 space-y-4 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {buildings.map(building => (
                                  <div key={building.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`flat-${building.id}`}
                                      checked={field.value.includes(building.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, building.id]);
                                        } else {
                                          field.onChange(field.value.filter(id => id !== building.id));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`flat-${building.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {building.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Apartments Access */}
                {/* <div>
                  <h3 className="text-md font-medium mb-3">Apartments Access</h3>
                  <div className="space-y-6">
                    <FormField
                      control={userForm.control}
                      name="access_to_all_apartments"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium leading-none">Access to All Apartments</FormLabel>
                            <p className="text-sm text-muted-foreground">Grant access to all apartments</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!userForm.watch('access_to_all_apartments') && (
                      <FormField
                        control={userForm.control}
                        name="apartments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Apartments</FormLabel>
                            <div className="border rounded-md p-4 space-y-4 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {apartments.map(apartment => (
                                  <div key={apartment.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`apartment-${apartment.id}`}
                                      checked={field.value.includes(Number(apartment.id))}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, apartment.id]);
                                        } else {
                                          field.onChange(field.value.filter(id => id !== Number(apartment.id)));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`apartment-${apartment.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {apartment.type}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div> */}
                
                {/* Categories Access */}
                <div>
                  <h3 className="text-md font-medium mb-3">Categories Access</h3>
                  <div className="space-y-6">
                    <FormField
                      control={userForm.control}
                      name="access_to_all_categories"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium leading-none">Access to All Categories</FormLabel>
                            <p className="text-sm text-muted-foreground">Grant access to all categories</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!userForm.watch('access_to_all_categories') && (
                      <FormField
                        control={userForm.control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Categories</FormLabel>
                            <div className="border rounded-md p-4 space-y-4 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map(category => (
                                  <div key={category.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`category-${category.id}`}
                                      checked={field.value.includes(category.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, category.id]);
                                        } else {
                                          field.onChange(field.value.filter(id => id !== category.id));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`category-${category.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {category.title}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                
                {/* Warehouses Access */}
                <div>
                  <h3 className="text-md font-medium mb-3">Warehouses Access</h3>
                  <div className="space-y-6">
                    <FormField
                      control={userForm.control}
                      name="access_to_all_warehouses"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium leading-none">Access to All Warehouses</FormLabel>
                            <p className="text-sm text-muted-foreground">Grant access to all warehouses</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!userForm.watch('access_to_all_warehouses') && (
                      <FormField
                        control={userForm.control}
                        name="warehouse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Warehouses</FormLabel>
                            <div className="border rounded-md p-4 space-y-4 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {warehouses.map(warehouse => (
                                  <div key={warehouse.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`warehouse-${warehouse.id}`}
                                      checked={field.value.includes(warehouse.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, warehouse.id]);
                                        } else {
                                          field.onChange(field.value.filter(id => id !== warehouse.id));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`warehouse-${warehouse.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {warehouse.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                
                {/* Departments Access */}
                <div>
                  <h3 className="text-md font-medium mb-3">Departments Access</h3>
                  <div className="space-y-6">
                    <FormField
                      control={userForm.control}
                      name="access_to_all_departments"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium leading-none">Access to All Departments</FormLabel>
                            <p className="text-sm text-muted-foreground">Grant access to all departments</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!userForm.watch('access_to_all_departments') && (
                      <FormField
                        control={userForm.control}
                        name="departments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Departments</FormLabel>
                            <div className="border rounded-md p-4 space-y-4 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {departments.map(department => (
                                  <div key={department.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`department-${department.id}`}
                                      checked={field.value.includes(Number(department.id))}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, department.id]);
                                        } else {
                                          field.onChange(field.value.filter(id => id !== Number(department.id)));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`department-${department.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {department.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                
                {/* Clients Access */}
                <div>
                  <h3 className="text-md font-medium mb-3">Clients Access</h3>
                  <div className="space-y-6">
                    <FormField
                      control={userForm.control}
                      name="access_to_all_clients"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium leading-none">Access to All Clients</FormLabel>
                            <p className="text-sm text-muted-foreground">Grant access to all clients</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!userForm.watch('access_to_all_clients') && (
                      <FormField
                        control={userForm.control}
                        name="clients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Clients</FormLabel>
                            <div className="border rounded-md p-4 space-y-4 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {clients.map(client => (
                                  <div key={client.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`client-${client.id}`}
                                      checked={field.value.includes(client.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, client.id]);
                                        } else {
                                          field.onChange(field.value.filter(id => id !== client.id));
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`client-${client.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {client.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {(createUserMutation.isPending || updateUserMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default UserForm;