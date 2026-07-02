import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Spinner } from '@/components/Spinner';
import { useConfirmPasswordReset } from '@/hooks/auth/usePasswordReset';

const schema = z
  .object({
    new_password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type FormValues = z.infer<typeof schema>;

const ResetPassword = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const { mutate, isPending, error } = useConfirmPasswordReset();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  const onSubmit = (values: FormValues) => {
    if (!uid || !token) return;
    mutate(
      { uid, token, new_password: values.new_password, confirm_password: values.confirm_password },
      { onSuccess: () => setDone(true) }
    );
  };

  const apiError =
    (error as any)?.response?.data?.error ||
    (error as any)?.response?.data?.detail ||
    (error as any)?.response?.data?.confirm_password?.[0] ||
    (error ? 'Something went wrong. Please try again.' : null);

  if (!uid || !token) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <p className="text-red-600 font-medium mb-4">Invalid or missing reset link.</p>
          <Link to="/forgot-password" className="text-green-700 hover:underline">
            Request a new reset link
          </Link>
        </div>
      </section>
    );
  }

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
          {done ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Password reset!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Your password has been updated successfully.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-slate-800 text-white hover:bg-slate-700"
              >
                Go to Login
              </Button>
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
                <h2 className="text-2xl font-bold text-slate-800 mt-2">Set new password</h2>
                <p className="text-slate-500 text-sm mt-1">Choose a strong password for your account.</p>
              </div>

              {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {apiError}
                  {(apiError as string).toLowerCase().includes('invalid') && (
                    <span>
                      {' '}
                      <Link to="/forgot-password" className="underline font-medium">
                        Request a new link.
                      </Link>
                    </span>
                  )}
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type={showNew ? 'text' : 'password'}
                              placeholder="New password"
                              className="pl-9 pr-10 border-slate-200 focus:border-green-400 focus:ring-green-400"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type={showConfirm ? 'text' : 'password'}
                              placeholder="Confirm new password"
                              className="pl-9 pr-10 border-slate-200 focus:border-green-400 focus:ring-green-400"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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
                    {isPending ? <Spinner text="Resetting..." /> : 'Reset Password'}
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

export default ResetPassword;
