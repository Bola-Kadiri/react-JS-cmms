import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Package, XCircle, Upload } from 'lucide-react';
import { useCpApprove, useCpReject } from '@/hooks/workrequest/useWorkrequestQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { toast } from '@/components/ui/use-toast';

export type CpAction = 'cp-approve' | 'cp-reject';

interface ProcurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
  action: CpAction;
}

const NO_VENDOR_VALUE = 'original';

const cpRejectSchema = z.object({
  po_vendor: z.string().min(1, 'Alternative vendor is required').refine(
    (v) => v !== NO_VENDOR_VALUE,
    'Please select an alternative vendor',
  ),
  cp_reason: z.string().min(1, 'Reason is required'),
});

type CpRejectValues = z.infer<typeof cpRejectSchema>;

export const ProcurementForm = ({
  isOpen,
  onClose,
  workrequestSlug,
  workrequestNumber,
  action,
}: ProcurementFormProps) => {
  const cpApproveMutation = useCpApprove();
  const cpRejectMutation = useCpReject();
  const { data: vendorsData } = useVendorsQuery();
  const vendors: any[] = (vendorsData as any)?.results ?? (Array.isArray(vendorsData) ? vendorsData : []);

  // CP-approve state
  const [poNumber, setPoNumber] = useState('');
  const [poNumberError, setPoNumberError] = useState('');
  const [poAmount, setPoAmount] = useState('');
  const [poAmountError, setPoAmountError] = useState('');
  const [altVendorId, setAltVendorId] = useState<string>(NO_VENDOR_VALUE);
  const [poDocumentFile, setPoDocumentFile] = useState<File | null>(null);
  const poDocumentRef = useRef<HTMLInputElement>(null);

  const rejectForm = useForm<CpRejectValues>({
    resolver: zodResolver(cpRejectSchema),
    defaultValues: { po_vendor: NO_VENDOR_VALUE, cp_reason: '' },
  });

  const isPending = cpApproveMutation.isPending || cpRejectMutation.isPending;

  const handleClose = () => {
    setPoNumber('');
    setPoNumberError('');
    setPoAmount('');
    setPoAmountError('');
    setAltVendorId(NO_VENDOR_VALUE);
    setPoDocumentFile(null);
    if (poDocumentRef.current) poDocumentRef.current.value = '';
    rejectForm.reset();
    onClose();
  };

  const handleCpApprove = async () => {
    let hasError = false;
    if (!poNumber.trim()) {
      setPoNumberError('PO number is required');
      hasError = true;
    } else {
      setPoNumberError('');
    }
    if (!poAmount.trim()) {
      setPoAmountError('PO amount is required');
      hasError = true;
    } else if (isNaN(Number(poAmount))) {
      setPoAmountError('PO amount must be a valid number');
      hasError = true;
    } else {
      setPoAmountError('');
    }
    if (hasError) return;
    try {
      await cpApproveMutation.mutateAsync({
        slug: workrequestSlug,
        data: {
          po_number: poNumber.trim(),
          po_amount: poAmount.trim(),
          ...(altVendorId !== NO_VENDOR_VALUE && { po_vendor: Number(altVendorId) }),
          ...(poDocumentFile && { po_document: poDocumentFile }),
        },
      });
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.detail || 'Failed to approve';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleCpReject = async (data: CpRejectValues) => {
    try {
      await cpRejectMutation.mutateAsync({
        slug: workrequestSlug,
        data: { po_vendor: Number(data.po_vendor), cp_reason: data.cp_reason },
      });
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.detail || 'Failed to reject';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${action === 'cp-approve' ? 'text-green-700' : 'text-red-700'}`}>
            {action === 'cp-approve'
              ? <Package className="h-5 w-5" />
              : <XCircle className="h-5 w-5" />
            }
            {action === 'cp-approve' ? 'Approve & Upload Purchase Order' : 'Reject — Vendor Issue'}
          </DialogTitle>
          <DialogDescription>Work Request #{workrequestNumber}</DialogDescription>
        </DialogHeader>

        {/* ── CP Approve ── */}
        {action === 'cp-approve' && (
          <div className="space-y-5">

            {/* PO Number — required */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                PO Number<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                placeholder="e.g. PO-2026-00123"
                value={poNumber}
                onChange={(e) => {
                  setPoNumber(e.target.value);
                  if (e.target.value.trim()) setPoNumberError('');
                }}
                className={`h-10 ${poNumberError ? 'border-red-500' : ''}`}
              />
              {poNumberError && (
                <p className="text-xs text-red-500 mt-1">{poNumberError}</p>
              )}
            </div>

            {/* PO Amount — required */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                PO Amount<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 250000.00"
                value={poAmount}
                onChange={(e) => {
                  setPoAmount(e.target.value);
                  if (e.target.value.trim()) setPoAmountError('');
                }}
                className={`h-10 ${poAmountError ? 'border-red-500' : ''}`}
              />
              {poAmountError && (
                <p className="text-xs text-red-500 mt-1">{poAmountError}</p>
              )}
            </div>

            {/* PO Document — optional */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                PO Document{' '}
                <span className="text-gray-400 font-normal">(optional — PDF, Word, or image)</span>
              </label>
              <div className="flex items-center gap-3">
                <Input
                  ref={poDocumentRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setPoDocumentFile(e.target.files?.[0] || null)}
                  className="h-10"
                />
                {poDocumentFile && (
                  <span className="text-xs text-green-700 font-medium shrink-0 flex items-center gap-1">
                    <Upload className="h-3 w-3" /> {poDocumentFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* Optional alternative vendor */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Vendor on PO{' '}
                <span className="text-gray-400 font-normal">(optional — leave as original if unchanged)</span>
              </label>
              <Select value={altVendorId} onValueChange={setAltVendorId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Use original vendor from invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_VENDOR_VALUE}>Use original vendor from invoice</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {altVendorId !== NO_VENDOR_VALUE && (
                <p className="text-xs text-amber-600 mt-1">PO will be raised against the alternative vendor selected above.</p>
              )}
            </div>

            <DialogFooter className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
              <Button
                type="button"
                onClick={handleCpApprove}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve & Submit PO
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── CP Reject ── */}
        {action === 'cp-reject' && (
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleCpReject)} className="space-y-4">
              <FormField control={rejectForm.control} name="po_vendor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Alternative Vendor<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select alternative vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={rejectForm.control} name="cp_reason" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Reason for Vendor Change<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Vendor not on approved list, price discrepancy..."
                      {...field}
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending} variant="destructive">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject & Notify Requester
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
