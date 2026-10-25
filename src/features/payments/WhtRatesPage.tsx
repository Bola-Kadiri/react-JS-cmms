// src/features/payments/WhtRatesPage.tsx
// Withholding tax rates AP can pick on a voucher. Kept by the Head of Finance & Treasury; switched off, never deleted.
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/contexts/PermissionsContext';
import { createWhtRate, fetchWhtRates, updateWhtRate } from '@/services/paymentFlowApi';
import { errorMessage } from './format';

const WhtRatesPage = () => {
  const queryClient = useQueryClient();
  const { userRole } = usePermissions();
  const canKeep = ['HEAD OF FINANCE & TREASURY', 'SUPER ADMIN'].includes(userRole ?? '');
  const { data: rates = [], isLoading } = useQuery({ queryKey: ['wht-rates', 'all'], queryFn: () => fetchWhtRates(true) });
  const [form, setForm] = useState({ name: '', rate: '' });
  const [error, setError] = useState('');

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['wht-rates'] });
  const add = useMutation({
    mutationFn: () => createWhtRate(form),
    onSuccess: () => { refresh(); setForm({ name: '', rate: '' }); setError(''); toast.success('Rate added'); },
    onError: (e) => setError(errorMessage(e)),
  });
  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => updateWhtRate(id, { is_active }),
    onSuccess: refresh,
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withholding tax rates</h1>
        <p className="mt-2 text-gray-600">
          The rates AP Officers choose from on a payment voucher, taken on the amount before VAT.
          {canKeep ? ' Switch a rate off rather than deleting it; vouchers keep the rate they were raised with.' : ' Kept by the Head of Finance & Treasury.'}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50"><TableRow>
            <TableHead>Name</TableHead><TableHead>Rate</TableHead><TableHead>In use</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin inline text-green-600" /></TableCell></TableRow>
            ) : rates.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{Number(r.rate)}%</TableCell>
                <TableCell>
                  <Switch checked={r.is_active} disabled={!canKeep || toggle.isPending} aria-label={`${r.name} in use`}
                          onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {canKeep && (
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="text-lg font-semibold text-green-800">Add a rate</h2>
          <div className="grid gap-4 md:grid-cols-[1fr_140px_auto] items-end">
            <div className="space-y-2">
              <label htmlFor="rate-name" className="text-sm font-medium text-gray-700">Name</label>
              <Input id="rate-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rent" />
            </div>
            <div className="space-y-2">
              <label htmlFor="rate-value" className="text-sm font-medium text-gray-700">Rate (%)</label>
              <Input id="rate-value" type="number" min="0" max="100" step="0.01" value={form.rate}
                     onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={!form.name.trim() || form.rate === '' || add.isPending}
                    onClick={() => add.mutate()}>
              {add.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Add
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default WhtRatesPage;
