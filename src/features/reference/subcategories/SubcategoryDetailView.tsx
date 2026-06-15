// src/features/accounts/subcategories/SubcategoryDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { useSubcategoryQuery } from '@/hooks/subcategory/useSubcategoryQueries';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const SubcategoryDetailView = () => {
 const { t } = useTypedTranslation('accounts');
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();

 // Using our custom hook instead of direct query
 const {
   data: subcategory,
   isLoading,
   isError,
   error
 } = useSubcategoryQuery(id);

 // Handle back button click
 const handleBack = () => {
   navigate('/dashboard/accounts/subcategories');
 };

 // Handle edit button click
 const handleEdit = () => {
   navigate(`/dashboard/accounts/subcategories/edit/${id}`);
 };

 if (isLoading) {
   return (
     <div className="flex justify-center items-center h-64">
       <div className="flex flex-col items-center gap-2">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="text-sm text-muted-foreground">{t('subcategory.detail.loading')}</p>
       </div>
     </div>
   );
 }

 if (isError) {
   return (
     <div className="flex flex-col items-center justify-center h-64 gap-4">
       <div className="text-red-500 text-xl">{t('subcategory.detail.error')}</div>
       <p className="text-sm text-muted-foreground mb-4">
         {error instanceof Error ? error.message : t('subcategory.detail.unknownError')}
       </p>
       <Button onClick={handleBack} variant="outline">
         {t('subcategory.detail.backToList')}
       </Button>
     </div>
   );
 }

 if (!subcategory) {
   return (
     <div className="flex flex-col items-center justify-center h-64 gap-4">
       <div className="text-red-500 text-xl">{t('subcategory.detail.notFound')}</div>
       <Button onClick={handleBack} variant="outline">
         {t('subcategory.detail.backToList')}
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
         <h1 className="text-2xl font-bold">{t('subcategory.detail.title')}</h1>
       </div>
       <PermissionGuard feature='reference' permission='edit'>
       <Button onClick={() => handleEdit()}>
         <Edit className="mr-2 h-4 w-4" /> {t('subcategory.detail.editSubcategory')}
       </Button>
       </PermissionGuard>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Subcategory Info Card */}
       <Card className="lg:col-span-3">
         <CardHeader>
           <CardTitle>{t('subcategory.detail.cardTitle')}</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <div className="mb-4">
                 <p className="text-sm font-medium text-muted-foreground">{t('subcategory.detail.fields.title')}</p>
                 <p className="text-lg font-medium">{subcategory.title}</p>
               </div>
               <div className="mb-4">
                 <p className="text-sm font-medium text-muted-foreground">{t('subcategory.detail.fields.status')}</p>
                 <span className={`px-3 py-1 rounded-full text-xs ${
                   subcategory.status === 'Active'
                     ? 'bg-green-500 text-white'
                     : 'bg-red-500 text-white'
                 }`}>
                   {subcategory.status}
                 </span>
               </div>
             </div>
             <div>
               <div className="mb-4">
                 <p className="text-sm font-medium text-muted-foreground">{t('subcategory.detail.fields.excludeCostLimit')}</p>
                 <p className="text-lg">{subcategory.exclude_costing_limit}</p>
               </div>
               <div className="mb-4">
                 <p className="text-sm font-medium text-muted-foreground">{t('subcategory.detail.fields.category')}</p>
                 <p className="text-lg">{subcategory.category || t('subcategory.detail.notProvided')}</p>
               </div>
             </div>
           </div>

           <div className="mt-4">
             <p className="text-sm font-medium text-muted-foreground">{t('subcategory.detail.fields.description')}</p>
             <p className="text-lg whitespace-pre-line">{subcategory.description || t('subcategory.detail.noDescription')}</p>
           </div>
         </CardContent>
       </Card>
     </div>
   </div>
 );
};

export default SubcategoryDetailView;
