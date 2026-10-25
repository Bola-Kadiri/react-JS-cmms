// src/features/delegation/CoverWhileAwayPage.tsx
// Signers (Category Manager, Client rep, Head of Finance & Treasury) name a stand-in while away.
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAllRecords } from '@/hooks/crud/useAllRecords';
import { User } from '@/types/user';
import { Cover, CoverStatus, createCover, endCover, fetchCovers, fetchStandIns } from '@/services/delegationsApi';

export const SIGNER_ROLES = ['APPROVER', 'CLIENT', 'HEAD OF FINANCE & TREASURY'];

const STATUS: Record<CoverStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  ended: { label: 'Ended', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  ended_early: { label: 'Ended early', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const emptyForm = { person: '', stand_in: '', starts_at: '', ends_at: '', value_limit: '', reason: '' };
type FormState = typeof emptyForm;
type FormErrors = Partial<Record<keyof FormState, string>>;

const readError = (error: any): { message: string; fields: FormErrors } => {
  const data = error?.response?.data ?? {};
  const fields: FormErrors = {};
  for (const key of Object.keys(emptyForm) as (keyof FormState)[]) {
    if (data[key]) fields[key] = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key]);
  }
  return { message: data.error || Object.values(fields)[0] || 'Could not save the cover. Please try again.', fields };
};

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const CoverWhileAwayPage = () => {
  const { userRole } = usePermissions();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperAdmin = userRole === 'SUPER ADMIN';
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: covers = [], isLoading } = useQuery({ queryKey: ['covers'], queryFn: fetchCovers });
  const { data: users = [] } = useAllRecords<User>('users', 'accounts/api/users/', userRole === 'SUPER ADMIN');
  const signers = isSuperAdmin ? users.filter((u) => SIGNER_ROLES.includes(u.roles)) : [];
  const personId = isSuperAdmin && form.person ? Number(form.person) : undefined;
  const { data: standIns = [] } = useQuery({
    queryKey: ['covers', 'stand-ins', personId ?? 'me'],
    queryFn: () => fetchStandIns(personId),
    enabled: !isSuperAdmin || !!personId,
  });

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value, ...(key === 'person' ? { stand_in: '' } : {}) }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const save = useMutation({
    mutationFn: () => createCover({
      ...(personId ? { person: personId } : {}),
      stand_in: Number(form.stand_in),
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      value_limit: form.value_limit || null,
      reason: form.reason.trim(),
    }),
    onSuccess: () => {
      toast.success('Cover saved');
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ['covers'] });
    },
    onError: (error) => {
      const { message, fields } = readError(error);
      setErrors(fields);
      toast.error(message);
    },
  });
  const end = useMutation({
    mutationFn: (id: number) => endCover(id),
    onSuccess: () => { toast.success('Cover ended'); queryClient.invalidateQueries({ queryKey: ['covers'] }); },
    onError: (error) => toast.error(readError(error).message),
  });

  if (userRole && !isSuperAdmin && !SIGNER_ROLES.includes(userRole)) return <Navigate to="/unauthorized" replace />;

  const missing: FormErrors = {};
  if (isSuperAdmin && !form.person) missing.person = 'Choose who is away.';
  if (!form.stand_in) missing.stand_in = 'Choose a stand-in.';
  if (!form.starts_at) missing.starts_at = 'Enter the start.';
  if (!form.ends_at) missing.ends_at = 'Enter the end.';
  if (!form.reason.trim()) missing.reason = 'Enter a reason.';
  const canSave = Object.keys(missing).length === 0 && !save.isPending;

  const field = (key: keyof FormState, label: string, input: JSX.Element, hint?: string, required = true) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {input}
      {errors[key] ? <p className="text-sm text-red-600">{errors[key]}</p>
        : hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cover while away</h1>
        <p className="mt-2 text-gray-600">Name a stand-in for your sign-offs while you are on leave or travelling.</p>
      </div>

      <section className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="p-6 bg-green-50 border-b border-green-100">
          <h2 className="text-lg font-semibold text-green-800">New cover</h2>
        </div>
        <div className="p-6 grid gap-5 md:grid-cols-2">
          {isSuperAdmin && field('person', 'Person who is away',
            <Select value={form.person || undefined} onValueChange={(v) => set('person', v)}>
              <SelectTrigger className={errors.person ? 'border-red-500' : ''}><SelectValue placeholder="Select a signer" /></SelectTrigger>
              <SelectContent>
                {signers.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.first_name} {u.last_name} · {u.roles}</SelectItem>)}
              </SelectContent>
            </Select>)}
          {field('stand_in', 'Stand-in',
            <Select value={form.stand_in || undefined} onValueChange={(v) => set('stand_in', v)} disabled={isSuperAdmin && !form.person}>
              <SelectTrigger className={errors.stand_in ? 'border-red-500' : ''}><SelectValue placeholder="Select a stand-in" /></SelectTrigger>
              <SelectContent>
                {standIns.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} · {p.email}</SelectItem>)}
              </SelectContent>
            </Select>,
            'Only people with the same role are listed.')}
          {field('starts_at', 'From',
            <Input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)}
                   className={errors.starts_at ? 'border-red-500' : ''} />)}
          {field('ends_at', 'Until',
            <Input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)}
                   className={errors.ends_at ? 'border-red-500' : ''} />,
            'Cover ends by itself at this time.')}
          {field('value_limit', 'Value limit (₦)',
            <Input type="number" min="0" step="0.01" placeholder="No limit" value={form.value_limit}
                   onChange={(e) => set('value_limit', e.target.value)} />,
            'Optional. Anything above this still waits for you.', false)}
          {field('reason', 'Reason',
            <Input value={form.reason} placeholder="e.g. Annual leave" onChange={(e) => set('reason', e.target.value)}
                   className={errors.reason ? 'border-red-500' : ''} />)}
        </div>
        <div className="px-6 pb-6 space-y-3">
          <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
            The stand-in cannot pass the cover on, and cannot act on a job they raised or reviewed.
            Every action is recorded as “stand-in on behalf of you”. You or a Super Admin can end it early.
          </p>
          <div className="flex justify-end">
            <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={!canSave}
                    onClick={() => (Object.keys(missing).length ? setErrors(missing) : save.mutate())}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save cover
            </Button>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="text-green-800">Person</TableHead>
              <TableHead className="text-green-800">Stand-in</TableHead>
              <TableHead className="text-green-800">From</TableHead>
              <TableHead className="text-green-800">Until</TableHead>
              <TableHead className="text-green-800">Value limit</TableHead>
              <TableHead className="text-green-800">Reason</TableHead>
              <TableHead className="text-green-800">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin inline text-green-600" /></TableCell></TableRow>
            ) : covers.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No cover arranged yet.</TableCell></TableRow>
            ) : covers.map((cover: Cover) => {
              const canEnd = (isSuperAdmin || cover.person.id === Number(user?.id))
                && (cover.status === 'active' || cover.status === 'scheduled');
              return (
                <TableRow key={cover.id}>
                  <TableCell><div className="font-medium">{cover.person.name}</div><div className="text-xs text-gray-500">{cover.person.roles}</div></TableCell>
                  <TableCell>{cover.stand_in.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{when(cover.starts_at)}</TableCell>
                  <TableCell className="whitespace-nowrap">{when(cover.ends_at)}</TableCell>
                  <TableCell>{cover.value_limit ? `₦${Number(cover.value_limit).toLocaleString()}` : 'No limit'}</TableCell>
                  <TableCell>{cover.reason}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS[cover.status].className}>{STATUS[cover.status].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    {canEnd && (
                      <Button variant="outline" size="sm" disabled={end.isPending} onClick={() => end.mutate(cover.id)}>
                        End early
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CoverWhileAwayPage;
