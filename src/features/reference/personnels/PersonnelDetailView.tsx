// src/features/facility/personnels/PersonnelDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Loader2, Phone, Mail, User, FileText, Download, Eye, Building, Hash, Calendar, CheckCircle2 } from 'lucide-react';
import { usePersonnelQuery } from '@/hooks/personnel/usePersonnelQueries';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PermissionGuard } from '@/components/PermissionGuard';

const PersonnelDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const { 
    data: personnel, 
    isLoading, 
    isError,
    error 
  } = usePersonnelQuery(slug);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/accounts/personnels');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/accounts/personnels/edit/${slug}`);
  };

  // Handle document preview
  const handlePreviewDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank');
  };

  // Handle document download
  const handleDownloadDocument = (documentUrl: string, documentName: string) => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading personnel details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading personnel details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Personnels
        </Button>
      </div>
    );
  }

  if (!personnel) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Personnel not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Personnels
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Personnel Details</h1>
        </div>
        <PermissionGuard feature='reference' permission='edit'>
        <Button onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit Personnel
        </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Personnel Profile Card */}
        <Card className="lg:col-span-4 self-start overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-green-300 h-32"></div>
        <div className="flex justify-center -mt-16">
          <Avatar className="h-32 w-32 border-4 border-white bg-white">
            <AvatarImage src={personnel.avatar_url} alt={`${personnel.first_name} ${personnel.last_name}`} />
            <AvatarFallback className="text-3xl bg-gray-200">
              {personnel.first_name?.[0]}{personnel.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
                
        <CardContent className="text-center pt-4">
          <h2 className="text-xl font-bold">
            {personnel.first_name} {personnel.last_name}
          </h2>
          <p className="text-gray-500 mt-1">{personnel.staff_number}</p>
                  
          <Badge className={`mt-3 ${
            personnel.status === 'Active' 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
          }`}>
            {personnel.status}
          </Badge>
                  
          <Separator className="my-4" />
                  
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <p className="text-gray-600">{personnel.email || 'No email provided'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <p className="text-gray-600">{personnel.phone_number || 'No phone provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4 grid grid-cols-3">
              <TabsTrigger value="details">Personnel Details</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">First Name</p>
                        <p className="text-base font-medium">{personnel.first_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                        <p className="text-base font-medium">{personnel.last_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-base">{personnel.email || '-'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Staff Number</p>
                        <p className="text-base font-medium">{personnel.staff_number || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p className="text-base">{personnel.phone_number || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-base">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs ${
                            personnel.status === 'Active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {personnel.status || 'Unknown'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Category Access</CardTitle>
                </CardHeader>
                <CardContent>
                  {personnel.access_to_all_categories ? (
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <p className="text-green-700 font-medium">This personnel has access to all categories</p>
                      </div>
                    </div>
                  ) : personnel.categories && personnel.categories.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">This personnel has access to the following categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {personnel.categories.map(categoryId => (
                          <Badge key={categoryId} variant="secondary">
                            Category {categoryId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No category access assigned</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {personnel.documents_data && personnel.documents_data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {personnel.documents_data.map((document) => (
                        <Card key={document.id} className="overflow-hidden">
                          <div className="bg-gray-100 h-32 flex items-center justify-center border-b">
                            <FileText className="h-12 w-12 text-gray-400" />
                            {/* <img src={document.file} /> */}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-sm truncate mb-2" title={document.name}>
                              {document.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3">
                              {document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString() : 'No upload date'}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handlePreviewDocument(document.file)}
                              >
                                <Eye className="h-3 w-3 mr-1" /> View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleDownloadDocument(document.file, document.name)}
                              >
                                <Download className="h-3 w-3 mr-1" /> Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No documents uploaded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDetailView;