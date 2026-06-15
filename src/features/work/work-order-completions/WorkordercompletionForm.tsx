import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Upload, X, FileText, Image } from 'lucide-react';
import {
  useWorkOrderCompletionQuery,
  useCreateWorkOrderCompletionMutation,
  useUpdateWorkOrderCompletionMutation,
  useAvailableWorkOrdersQuery
} from '@/hooks/workordercompletion/useWorkordercompletionQueries';
import { useReviewersQuery, useApproversQuery } from '@/hooks/workrequest/useWorkrequestQueries';
import { toast } from '@/components/ui/use-toast';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const WorkordercompletionForm = () => {
  const { t } = useTypedTranslation('work');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const workOrderCompletionSchema = z.object({
    work_order: z.number().min(1, t('wcc.form.validation.workOrderRequired')),
    reviewers: z.array(z.number()).min(1, t('wcc.form.validation.reviewersRequired')),
    approver: z.number().min(1, t('wcc.form.validation.approverRequired')),
    start_date: z.string().min(1, t('wcc.form.validation.startDateRequired')),
    due_date: z.string().min(1, t('wcc.form.validation.dueDateRequired')),
    resources: z.array(z.any()).default([]),
  });

  type WorkOrderCompletionFormValues = z.infer<typeof workOrderCompletionSchema>;

  // File handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Queries and mutations
  const { isLoading: isLoadingCompletion } = useWorkOrderCompletionQuery(Number(id));
  const { data: availableWorkOrders, isLoading: isLoadingWorkOrders } = useAvailableWorkOrdersQuery();
  const { data: reviewers = [], isLoading: isLoadingReviewers } = useReviewersQuery();
  const { data: approvers = [], isLoading: isLoadingApprovers } = useApproversQuery();

  const createMutation = useCreateWorkOrderCompletionMutation();
  const updateMutation = useUpdateWorkOrderCompletionMutation();

  const isLoading = isLoadingCompletion || isLoadingWorkOrders || isLoadingReviewers || isLoadingApprovers;

  // Form setup
  const form = useForm<WorkOrderCompletionFormValues>({
    resolver: zodResolver(workOrderCompletionSchema),
    defaultValues: {
      work_order: 0,
      reviewers: [],
      approver: 0,
      start_date: '',
      due_date: '',
      resources: [],
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t('wcc.form.toast.invalidFileType'),
          description: t('wcc.form.toast.invalidFileTypeDesc', { name: file.name }),
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('wcc.form.toast.fileTooLarge'),
          description: t('wcc.form.toast.fileTooLargeDesc', { name: file.name }),
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);

    if (event.target) {
      event.target.value = '';
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-red-500" />;
  };

  // Submit form
  const onSubmit = async (values: WorkOrderCompletionFormValues) => {
    try {
      const formData = new FormData();

      formData.append('work_order', values.work_order.toString());
      formData.append('approver', values.approver.toString());
      formData.append('start_date', values.start_date);
      formData.append('due_date', values.due_date);

      values.reviewers.forEach((reviewerId) => {
        formData.append('reviewers', reviewerId.toString());
      });

      selectedFiles.forEach((file) => {
        formData.append('resources', file);
      });

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id: Number(id), data: formData });
        toast({
          title: t('wcc.form.toast.successTitle'),
          description: t('wcc.form.toast.updateSuccess'),
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: t('wcc.form.toast.successTitle'),
          description: t('wcc.form.toast.createSuccess'),
        });
      }

      navigate('/dashboard/work/work-order-completions');
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: t('wcc.form.toast.errorTitle'),
        description: error?.response?.data?.message || t('wcc.form.toast.saveError'),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/work/work-order-completions')}
          className="text-green-700 hover:text-green-800 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('wcc.form.backToList')}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? t('wcc.form.editTitle') : t('wcc.form.createTitle')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditMode ? t('wcc.form.editSubtitle') : t('wcc.form.createSubtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Work Order Selection */}
              <FormField
                control={form.control}
                name="work_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('wcc.form.workOrder')} <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('wcc.form.selectWorkOrder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableWorkOrders?.results && availableWorkOrders.results.length > 0 ? (
                          availableWorkOrders.results.map((workOrder) => (
                            <SelectItem key={workOrder.id} value={workOrder.id.toString()}>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">WO-{workOrder.work_order_number}</span>
                                {workOrder.title && (
                                  <span className="text-xs text-gray-500">{workOrder.title}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-work-orders" disabled>
                            {t('wcc.form.noWorkOrders')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Approver Selection */}
              <FormField
                control={form.control}
                name="approver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('wcc.form.approver')} <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('wcc.form.selectApprover')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvers && approvers.length > 0 ? (
                          approvers.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {user.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {user.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-approvers" disabled>
                            {t('wcc.form.noApprovers')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('wcc.form.startDate')} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('wcc.form.dueDate')} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reviewers Selection (Multi-select) */}
            <FormField
              control={form.control}
              name="reviewers"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('wcc.form.reviewers')} <span className="text-red-500">*</span>
                    </FormLabel>
                    <p className="text-xs text-gray-500 mt-1">{t('wcc.form.reviewersHint')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                    {reviewers && reviewers.length > 0 ? (
                      reviewers.map((user) => (
                        <FormField
                          key={user.id}
                          control={form.control}
                          name="reviewers"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={user.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(user.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, user.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== user.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {user.name}
                                    </span>
                                    {user.email && (
                                      <span className="text-xs text-gray-500">
                                        {user.email}
                                      </span>
                                    )}
                                  </div>
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">{t('wcc.form.noReviewers')}</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {t('wcc.form.resources')}
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('wcc.form.uploadFiles')}
                  </Button>
                  <span className="text-xs text-gray-500">
                    {t('wcc.form.uploadHint')}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{t('wcc.form.selectedFiles')}</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/work/work-order-completions')}
                className="px-6"
              >
                {t('wcc.form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 bg-green-600 hover:bg-green-700"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEditMode ? t('wcc.form.update') : t('wcc.form.create')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default WorkordercompletionForm;
