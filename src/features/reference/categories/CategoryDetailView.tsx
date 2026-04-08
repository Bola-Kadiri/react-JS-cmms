// src/features/reference/categories/CategoryDetailView.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Loader2, Hash, Tag, FileText, CheckCircle, XCircle, Settings, Zap, DollarSign, Plus } from 'lucide-react';
import { useCategoryQuery, useCreateSubCategory } from '@/hooks/category/useCategoryQueries';
import { PermissionGuard } from '@/components/PermissionGuard';

// Subcategory form schema
const subcategorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  code: z.string().min(1, 'Code is required'),
  work_request_approved: z.enum(['create_work_order', 'close_work_request']),
  exclude_costing_limit: z.boolean().default(false),
  power: z.boolean().default(false),
  create_payment_requisition: z.boolean().default(false),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type SubcategoryFormValues = z.infer<typeof subcategorySchema>;

const CategoryDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Using our custom hook instead of direct query
  const { 
    data: category, 
    isLoading, 
    isError,
    error 
  } = useCategoryQuery(id);

  // Subcategory creation hook
  const createSubcategoryMutation = useCreateSubCategory();

  // Subcategory form setup
  const subcategoryForm = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      title: '',  
      code: '',
      work_request_approved: 'create_work_order',
      exclude_costing_limit: false,
      power: false,
      create_payment_requisition: false,
      status: 'Active',
    }
  });

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/accounts/categories');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/accounts/categories/edit/${id}`);
  };

  // Handle subcategory form submission
  const onSubmitSubcategory = (data: SubcategoryFormValues) => {
    if (id) {
      createSubcategoryMutation.mutate(
        { id, subCat: data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            subcategoryForm.reset();
          }
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading category details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Categories
        </Button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Category not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBack}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Category Details</h1>
          </div>
          <PermissionGuard feature='reference' permission='edit'>
            <Button onClick={handleEdit} className="shadow-md hover:shadow-lg transition-shadow">
              <Edit className="mr-2 h-4 w-4" /> Edit Category
            </Button>
          </PermissionGuard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content with Tabs */}
          <Card className="lg:col-span-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                Category Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Category Details</TabsTrigger>
                  <TabsTrigger value="subcategories">
                    Subcategories ({category?.subcategories?.length || 0})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-6">
              {/* Basic Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Code</p>
                      <p className="text-lg font-semibold text-gray-800">{category.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Tag className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Title</p>
                      <p className="text-lg font-semibold text-gray-800">{category.title}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple-100">
                      {category.status === 'Active' ? (
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Request Configuration */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Work Request Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Problem Type</p>
                      <p className="text-lg font-semibold text-gray-800">{category.problem_type || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Work Request Approved</p>
                      <p className="text-lg font-semibold text-gray-800">{category.work_request_approved || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Permissions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-600" />
                  System Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-red-100">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Exclude Costing Limit</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.exclude_costing_limit 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.exclude_costing_limit ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Power</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.power 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.power ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <DollarSign className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Create Payment Requisition</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.create_payment_requisition 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.create_payment_requisition ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {category.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {category.description}
                    </p>
                  </div>
                </div>
              )}
                </TabsContent>

                <TabsContent value="subcategories" className="mt-6">
                  <div className="space-y-6">
                    {/* Subcategories Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-600" />
                        Subcategories
                      </h3>
                      <span className="text-sm text-gray-500">
                        {category?.subcategories?.length || 0} subcategories found
                      </span>
                    </div>

                    {/* Subcategories Table */}
                    {category?.subcategories && category.subcategories.length > 0 ? (
                      <Card className="border shadow-sm">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-medium text-gray-600">ID</TableHead>
                              <TableHead className="font-medium text-gray-600">Title</TableHead>
                              <TableHead className="font-medium text-gray-600">Description</TableHead>
                              <TableHead className="font-medium text-gray-600">Exclude Costing Limit</TableHead>
                              <TableHead className="font-medium text-gray-600">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.subcategories.map((subcategory) => (
                              <TableRow key={subcategory.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <TableCell className="font-medium text-blue-600">
                                  {subcategory.id}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {subcategory.title || 'No Title'}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {subcategory.description || 'No Description'}
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    subcategory.exclude_costing_limit
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {subcategory.exclude_costing_limit ? 'Yes' : 'No'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    subcategory.status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {subcategory.status}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                          <Settings className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No subcategories</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          This category doesn't have any subcategories yet.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* <PermissionGuard feature='reference' permission='edit'>
                    <Button 
                      onClick={handleEdit} 
                      className="w-full justify-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Category
                    </Button>
                  </PermissionGuard> */}
                  
                  <PermissionGuard feature='reference' permission='edit'>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          // variant="secondary" 
                          className="w-full justify-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4" />
                          Add Subcategory
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Create New Subcategory</DialogTitle>
                        </DialogHeader>
                        <Form {...subcategoryForm}>
                          <form onSubmit={subcategoryForm.handleSubmit(onSubmitSubcategory)} className="space-y-6">
                            {/* Basic Information - 2 Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={subcategoryForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Subcategory title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={subcategoryForm.control}
                                name="code"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Subcategory code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Configuration - 2 Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={subcategoryForm.control}
                                name="work_request_approved"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Work Request Approved</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select approval type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="create_work_order">Create Work Order</SelectItem>
                                        <SelectItem value="close_work_request">Close Work Request</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={subcategoryForm.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
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

                            {/* Permissions Section */}
                            <div className="space-y-4">
                              <div className="text-sm font-medium text-gray-700 border-b pb-2">
                                System Permissions
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                <FormField
                                  control={subcategoryForm.control}
                                  name="exclude_costing_limit"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-medium">Exclude Costing Limit</FormLabel>
                                        <div className="text-xs text-muted-foreground">
                                          Enable to exclude costing limits for this subcategory
                                        </div>
                                      </div>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={subcategoryForm.control}
                                  name="power"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-medium">Power</FormLabel>
                                        <div className="text-xs text-muted-foreground">
                                          Enable power functionality for this subcategory
                                        </div>
                                      </div>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={subcategoryForm.control}
                                  name="create_payment_requisition"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-medium">Create Payment Requisition</FormLabel>
                                        <div className="text-xs text-muted-foreground">
                                          Allow creation of payment requisitions
                                        </div>
                                      </div>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={createSubcategoryMutation.isPending}
                              >
                                {createSubcategoryMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Subcategory
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </PermissionGuard>

                  <Button 
                    onClick={handleBack} 
                    variant="outline" 
                    className="w-full justify-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Categories
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category Status Summary */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="text-lg">Category Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      category.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Power Enabled</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      category.power 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.power ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Creation</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      category.create_payment_requisition 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.create_payment_requisition ? 'Allowed' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailView;