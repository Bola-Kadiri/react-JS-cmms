import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '../ui/input';
import { useLogin } from '@/hooks/auth/useLogin';
import { Spinner } from '../Spinner';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';



  

const SignInForm = () => {
  const { t } = useTypedTranslation(['auth', 'form']);
  const { mutate, isPending, error } = useLogin();
  const [loginError, setLoginError] = useState<string | null>(null);

  const formSchema = z.object({
    email: z.string().email({ message: t('form:validation.email') }),
    password: z.string().min(5, t('form:validation.min', { count: 5 })),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Get return URL from location state (if available)
  const from = (location.state as any)?.from || '/';

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Clear any previous errors
    setLoginError(null);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    mutate({
      email: values.email,
      password: values.password
    }, {
      onSuccess: () => {
        // Redirect to the original URL or dashboard
        navigate(from, { replace: true });
      },
      onError: (error: any) => {
        // Display error from API
        setLoginError(error.response?.data?.detail || 
                      error.response?.data?.message || 
                      t('auth:messages.loginFailed'));
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 mb-8"
      >
        {loginError && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {loginError}
          </div>
        )}
        <div>
          {/* <FormFieldLayout
            form={form}
            name="email"
            label="Email"
            placeholder="Email"
          /> */}
          <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth:email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('auth:placeholders.email')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="">
          {/* <FormFieldLayout
            form={form}
            name="password"
            label="Password"
            placeholder="Password"
          /> */}
          <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth:password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('auth:placeholders.password')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
        </div>
        <Button type="submit" className="w-full">
          {isPending ? <Spinner text={t('common:status.loading')} /> : t('auth:login')}
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;
