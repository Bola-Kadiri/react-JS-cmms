import React from 'react';
import { useForm, FieldValues, SubmitHandler, DefaultValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '../Spinner';
import { Textarea } from '@/components/ui/textarea';

export interface FormField<TFieldValues extends FieldValues = Record<string, any>> {
  name: Path<TFieldValues> | string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'textarea';
  options?: { label: string; value: string }[];
  validation?: z.ZodTypeAny;
  width?: 'full' | 'half'; // Control if field takes full width or half width
}

interface CrudFormProps<TFieldValues extends FieldValues = Record<string, any>> {
  fields: FormField<TFieldValues>[];
  onSubmit: SubmitHandler<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  isOpen: boolean;
  isLoading: boolean;
  isUpdating?: boolean; // NEW: separate loading state for update operations
  onClose: () => void;
  title: string;
}

export function CrudForm<TFieldValues extends FieldValues = Record<string, any>>({
  fields,
  onSubmit,
  defaultValues,
  isOpen,
  isLoading,
  isUpdating = false, // Default to false
  onClose,
  title,
}: CrudFormProps<TFieldValues>) {
  // Build the form schema dynamically based on the fields
  const schema = z.object(
    fields.reduce((acc, field) => ({
      ...acc,
      [field.name as string]: field.validation || z.string(),
    }), {})
  );

  // Prepare defaultValues by ensuring checkbox fields are always boolean
  const preparedDefaultValues = React.useMemo<DefaultValues<TFieldValues>>(() => {
    if (!defaultValues) return {} as DefaultValues<TFieldValues>;
    
    return fields.reduce((values, field) => {
      // For checkbox fields, ensure the value is a boolean
      if (field.type === 'checkbox') {
        return {
          ...values,
          [field.name as string]: defaultValues[field.name as keyof typeof defaultValues] === true || 
                                 defaultValues[field.name as keyof typeof defaultValues] === 'true',
        };
      }
      return {
        ...values,
        [field.name as string]: defaultValues[field.name as keyof typeof defaultValues],
      };
    }, {} as DefaultValues<TFieldValues>);
  }, [defaultValues, fields]);

  const form = useForm<TFieldValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: preparedDefaultValues as DefaultValues<TFieldValues> || {} as DefaultValues<TFieldValues>,
  });
  
  // Reset form with defaultValues when they change or when the form is opened
  React.useEffect(() => {
    if (isOpen) {
      form.reset(preparedDefaultValues);
    }
  }, [form, preparedDefaultValues, isOpen]);

  const handleSubmit: SubmitHandler<TFieldValues> = (data) => {
    // Ensure checkbox values are always booleans, not undefined
    const formattedData = fields.reduce((result, field) => {
      if (field.type === 'checkbox') {
        return {
          ...result,
          [field.name as string]: data[field.name as keyof typeof data] === true,
        };
      }
      return {
        ...result,
        [field.name as string]: data[field.name as keyof typeof data],
      };
    }, {} as TFieldValues);

    console.log(formattedData);
    onSubmit(formattedData);
    // Only reset and close if not loading (to prevent form from disappearing before operation completes)
    if (!isLoading && !isUpdating) {
      form.reset();
      onClose();
    }
  };

  // Determine if we're in a create or update operation for button text
  const isEditing = !!defaultValues;
  const actionInProgress = isLoading || isUpdating;
  const buttonText = isEditing ? 'Update' : 'Create';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if not in a loading state
      if (!actionInProgress || !open) {
        onClose();
      }
    }}>
      {/* Make the dialog wider */}
      <DialogContent className="sm:max-w-[800px] w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Grid container for form fields */}
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <FormField
                  key={String(field.name)}
                  control={form.control}
                  name={field.name as Path<TFieldValues>}
                  render={({ field: formField }) => (
                    <FormItem 
                      // Make field take full width or half width based on field.width
                      className={field.width === 'full' ? 'col-span-2' : 'col-span-1'}
                    >
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        {field.type === 'select' && field.options ? (
                          <Select
                            onValueChange={formField.onChange}
                            value={formField.value}
                            disabled={actionInProgress}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'checkbox' ? (
                          <div className="flex items-center h-10 space-x-2">
                            <Checkbox
                              checked={formField.value === true}
                              onCheckedChange={(checked) => {
                                // Always set a boolean value: true when checked, false when unchecked
                                formField.onChange(checked === true);
                              }}
                              id={String(field.name)}
                              disabled={actionInProgress}
                            />
                            <label 
                              htmlFor={String(field.name)}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {field.label}
                            </label>
                          </div>
                        ) : field.type === 'radio' && field.options ? (
                          <RadioGroup
                            onValueChange={formField.onChange}
                            value={formField.value}
                            className="flex flex-col space-y-1"
                            disabled={actionInProgress}
                          >
                            {field.options.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={option.value} 
                                  id={`${String(field.name)}-${option.value}`} 
                                  disabled={actionInProgress}
                                />
                                <label htmlFor={`${String(field.name)}-${option.value}`}>{option.label}</label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : field.type === 'textarea' ? (
                          <Textarea
                            {...formField}
                            disabled={actionInProgress}
                            className="min-h-[100px]"
                          />
                        ) : (
                          <Input 
                            {...formField} 
                            type={field.type} 
                            disabled={actionInProgress}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  <Spinner text={isEditing ? 'Updating...' : 'Creating...'} />
                ) : (
                  buttonText
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}