import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Spinner } from '@/components/Spinner';
import { useRequestPasswordReset } from '@/hooks/auth/usePasswordReset';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const { mutate, isPending, error } = useRequestPasswordReset();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values.email, {
      onSuccess: () => setSubmitted(true),
    });
  };

  const apiError = (error as any)?.response?.data?.email?.[0]
    || (error as any)?.response?.data?.detail
    || (error ? 'Something went wrong. Please try again.' : null);

  return (
    <section
      className="bg-cover bg-center w-full min-h-screen relative"
      style={{ backgroundImage: `url('/images/bg-img.jpg')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/70 via-white/50 to-green-100/70" />

      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 1200 800" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e7ff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <header className="relative z-10 flex justify-between items-center px-8 py-6">
        <div className="text-3xl font-bold text-slate-700">ALPHA CMMS</div>
      </header>

      <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-88px)] px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-green-100">
          {submitted ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
              <p className="text-slate-500 text-sm mb-6">
                If an account exists for <strong>{form.getValues('email')}</strong>, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-green-700 font-medium hover:text-green-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-500 text-sm hover:text-slate-700 transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
                <h2 className="text-2xl font-bold text-slate-800 mt-2">Forgot your password?</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {apiError}
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="pl-9 border-slate-200 focus:border-green-400 focus:ring-green-400"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                    disabled={isPending}
                  >
                    {isPending ? <Spinner text="Sending..." /> : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
