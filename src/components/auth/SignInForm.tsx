import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: t('form:validation.email') }),
    password: z.string().min(5, t('form:validation.min', { count: 5 })),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const location = useLocation();
  const navigate = useNavigate();

  const from = (location.state as any)?.from || '/';

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoginError(null);
    console.log('[SignInForm] onSubmit: Form submitted with values', values);
    mutate({
      email: values.email,
      password: values.password
    }, {
      onSuccess: () => {
        console.log('[SignInForm] onSuccess: Login successful.');
        // Removed navigation from here, AuthContext will handle it.
      },
      onError: (error: any) => {
        console.error('[SignInForm] onError: Login failed.', error);
        setLoginError(error.response?.data?.detail || 
                      error.response?.data?.message || 
                      t('auth:messages.loginFailed'));
      }
    });
  }

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Log in</h1>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mb-8"
        >
          {loginError && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {loginError}
            </div>
          )}
          
          <div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">{t('auth:email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isPending}
                        {...form.register("email")}
                        className="py-3 bg-white/80 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-400"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">{t('auth:password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        disabled={isPending}
                        {...form.register("password")}
                        className="py-3 bg-white/80 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-600 text-sm">Remember Me</span>
            </label>
            
            <a href="#" className="text-slate-500 text-sm hover:text-slate-700 transition-colors">
              Forgot Password?
            </a>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {isPending ? <Spinner text={t('common:status.loading')} /> : t('auth:login')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignInForm