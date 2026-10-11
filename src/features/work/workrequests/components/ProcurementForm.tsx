import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Package, XCircle, Upload, Plus, Trash2, Building2, Truck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSaveQuotation, useCpReject } from '@/hooks/workrequest/useWorkrequestQueries';
import type { QuotationItemInput } from '@/services/workrequestsApi';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useFormatters } from '@/utils/formatters';
import { toast } from '@/components/ui/use-toast';

// 'save-quotation': fills in Quotation/PO/Vendor as its own step, from the
// Quotation accordion — no longer bundled with actually approving (see
// WorkrequestDetailView's separate, payload-less Approve confirm).
export type CpAction = 'save-quotation' | 'cp-reject';

interface ProcurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
  action: CpAction;
  currency?: 'USD' | 'EUR' | 'NGN';
  // Pre-fills the form with whatever was already saved — save-quotation is
  // re-callable any number of times, so re-opening this should show the
  // existing draft, not a blank form.
  existing?: {
    po_number?: string | null;
    po_amount?: string | null;
    po_vendor?: number | null;
    items?: QuotationItemInput[];
  };
}

const NO_VENDOR_VALUE = 'original';

// PO threshold: quotations at or below ₦100,000 (Cost to Client) don't need
// a PO. Quotation always comes before the PO requirement is known, so both
// fields are optional here — actual enforcement happens at submit time in
// handleSaveQuotation, once the live totals are known.
export const PO_THRESHOLD = 100000;

const cpApproveSchema = z.object({
  po_number: z.string().optional(),
  po_amount: z.string().optional().refine((v) => !v || !isNaN(Number(v)), 'PO amount must be a valid number'),
  po_vendor: z.string().default(NO_VENDOR_VALUE),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.string().min(1, 'Required').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
    // Reference only — never feeds total_cost_vendor, so left optional.
    unit_cost_estimate: z.string().optional(),
    unit_cost_vendor: z.string().min(1, 'Required').refine((v) => !isNaN(Number(v)), 'Must be a number'),
    unit_cost_client: z.string().min(1, 'Required').refine((v) => !isNaN(Number(v)), 'Must be a number'),
    add_vat: z.boolean().default(false),
  })).default([]),
});

type CpApproveValues = z.infer<typeof cpApproveSchema>;

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
  currency = 'NGN',
  existing,
}: ProcurementFormProps) => {
  const saveQuotationMutation = useSaveQuotation();
  const cpRejectMutation = useCpReject();
  const { data: vendorsData } = useVendorsQuery();
  const { formatCurrency } = useFormatters();
  const vendors: any[] = (vendorsData as any)?.results ?? (Array.isArray(vendorsData) ? vendorsData : []);

  // Internal quotation (sourced in-house, no vendor needed) vs. Vendor RFQ
  // (needs a vendor) — purely a display toggle that shows/hides the vendor
  // picker below; the backend already treats po_vendor as optional, so no
  // schema change was needed for this.
  const [quotationMode, setQuotationMode] = useState<'internal' | 'vendor_rfq'>(
    existing?.po_vendor ? 'vendor_rfq' : 'internal'
  );

  const poDocumentRef = useRef<HTMLInputElement>(null);

  const approveForm = useForm<CpApproveValues>({
    resolver: zodResolver(cpApproveSchema),
    defaultValues: {
      po_number: existing?.po_number || '',
      po_amount: existing?.po_amount || '',
      po_vendor: existing?.po_vendor ? String(existing.po_vendor) : NO_VENDOR_VALUE,
      items: existing?.items || [],
    },
  });

  // Re-opening the dialog on a request whose quotation was already saved
  // (once, or partially) should show that draft, not a blank form — the
  // defaultValues above only apply on first mount.
  useEffect(() => {
    if (isOpen && action === 'save-quotation') {
      approveForm.reset({
        po_number: existing?.po_number || '',
        po_amount: existing?.po_amount || '',
        po_vendor: existing?.po_vendor ? String(existing.po_vendor) : NO_VENDOR_VALUE,
        items: existing?.items || [],
      });
      setQuotationMode(existing?.po_vendor ? 'vendor_rfq' : 'internal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { fields, append, remove } = useFieldArray({
    control: approveForm.control,
    name: 'items',
  });

  const watchItems = approveForm.watch('items');
  const totals = (watchItems || []).reduce(
    (acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      acc.quantity += qty;
      acc.estimate += qty * (parseFloat(item.unit_cost_estimate || '') || 0);
      acc.vendor += qty * (parseFloat(item.unit_cost_vendor) || 0);
      acc.client += qty * (parseFloat(item.unit_cost_client) || 0);
      return acc;
    },
    { quantity: 0, estimate: 0, vendor: 0, client: 0 },
  );
  const margin = totals.client - totals.vendor;
  const poRequired = currency !== 'NGN' || totals.client > PO_THRESHOLD;

  const rejectForm = useForm<CpRejectValues>({
    resolver: zodResolver(cpRejectSchema),
    defaultValues: { po_vendor: NO_VENDOR_VALUE, cp_reason: '' },
  });

  const isPending = saveQuotationMutation.isPending || cpRejectMutation.isPending;

  const handleClose = () => {
    approveForm.reset({ po_number: '', po_amount: '', po_vendor: NO_VENDOR_VALUE, items: [] });
    setQuotationMode('internal');
    if (poDocumentRef.current) poDocumentRef.current.value = '';
    rejectForm.reset();
    onClose();
  };

  const handleSaveQuotation = async (data: CpApproveValues) => {
    if (poRequired && !data.po_number?.trim()) {
      approveForm.setError('po_number', { message: 'PO number is required — Cost to Client exceeds ₦100,000' });
      return;
    }
    if (poRequired && !data.po_amount?.trim()) {
      approveForm.setError('po_amount', { message: 'PO amount is required — Cost to Client exceeds ₦100,000' });
      return;
    }
    try {
      await saveQuotationMutation.mutateAsync({
        slug: workrequestSlug,
        data: {
          ...(data.po_number?.trim() && { po_number: data.po_number.trim() }),
          ...(data.po_amount?.trim() && { po_amount: data.po_amount.trim() }),
          ...(data.po_vendor !== NO_VENDOR_VALUE && { po_vendor: Number(data.po_vendor) }),
          ...(poDocumentRef.current?.files?.[0] && { po_document: poDocumentRef.current.files[0] }),
          // react-hook-form + zod types each item's fields as optional here
          // (the schema's input side, before zodResolver's own validation
          // runs) even though they're all required at runtime — zodResolver
          // has already enforced that by the time this callback fires.
          ...(data.items.length > 0 && { items: data.items as QuotationItemInput[] }),
        },
      });
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.detail || 'Failed to save quotation';
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${action === 'save-quotation' ? 'text-green-700' : 'text-red-700'}`}>
            {action === 'save-quotation'
              ? <Package className="h-5 w-5" />
              : <XCircle className="h-5 w-5" />
            }
            {action === 'save-quotation' ? 'Quotation, PO & Vendor' : 'Reject — Vendor Issue'}
          </DialogTitle>
          <DialogDescription>
            Work Request #{workrequestNumber}
            {action === 'save-quotation' && ' — save now, approve separately once ready.'}
          </DialogDescription>
        </DialogHeader>

        {/* ── Save Quotation ── */}
        {action === 'save-quotation' && (
          <Form {...approveForm}>
            <form onSubmit={approveForm.handleSubmit(handleSaveQuotation)} className="space-y-5">

              {/* Quotation comes first — the PO requirement below is derived
                  from its Cost to Client total, so it has to be priced
                  before the PO fields make sense. */}

              {/* Quotation mode — Internal (in-house/warehouse, no vendor
                  needed) vs. Vendor RFQ (needs a vendor). Purely determines
                  whether the vendor picker below is shown. */}
              <div>
                <FormLabel className="text-sm font-medium text-gray-700 block mb-2">Quotation Type</FormLabel>
                <RadioGroup
                  value={quotationMode}
                  onValueChange={(value) => {
                    setQuotationMode(value as 'internal' | 'vendor_rfq');
                    if (value === 'internal') approveForm.setValue('po_vendor', NO_VENDOR_VALUE);
                  }}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="internal" id="quotation-internal" />
                    <Label htmlFor="quotation-internal" className="flex items-center gap-1.5 text-sm font-normal cursor-pointer">
                      <Building2 className="h-3.5 w-3.5 text-gray-500" /> Internal quotation
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="vendor_rfq" id="quotation-vendor-rfq" />
                    <Label htmlFor="quotation-vendor-rfq" className="flex items-center gap-1.5 text-sm font-normal cursor-pointer">
                      <Truck className="h-3.5 w-3.5 text-gray-500" /> Create vendor RFQ
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {quotationMode === 'vendor_rfq' && (
                <FormField control={approveForm.control} name="po_vendor" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Vendor on PO{' '}
                      <span className="text-gray-400 font-normal">(optional — leave as original if unchanged)</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Use original vendor from invoice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_VENDOR_VALUE}>Use original vendor from invoice</SelectItem>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value !== NO_VENDOR_VALUE && (
                      <p className="text-xs text-amber-600 mt-1">PO will be raised against the alternative vendor selected above.</p>
                    )}
                  </FormItem>
                )} />
              )}

              {/* Quotation — estimate / approved (vendor) / client, per line */}
              <div className="border rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Quotation{' '}
                    <span className="text-gray-400 font-normal">
                      {fields.length > 0
                        ? `(${fields.length} ${fields.length === 1 ? 'line' : 'lines'} — ${totals.quantity} total qty)`
                        : '(optional — add priced line items)'}
                    </span>
                  </h4>
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={() => append({ description: '', quantity: '1', unit_cost_estimate: '', unit_cost_vendor: '', unit_cost_client: '', add_vat: false })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add line
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-2 bg-white p-3 rounded border">
                        {/* Description gets its own full-width row — room to
                            actually describe the item, not squeezed into a
                            narrow column alongside four number fields. */}
                        <FormField control={approveForm.control} name={`items.${index}.description`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-gray-500">Description</FormLabel>
                            <FormControl><Input {...field} className="h-9" placeholder="e.g. 25mm PVC conduit pipe" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-2">
                            <FormField control={approveForm.control} name={`items.${index}.quantity`} render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-gray-500">Qty</FormLabel>
                                <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="col-span-3">
                            <FormField control={approveForm.control} name={`items.${index}.unit_cost_estimate`} render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-gray-500">Unit price (estimate)</FormLabel>
                                <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="col-span-3">
                            <FormField control={approveForm.control} name={`items.${index}.unit_cost_vendor`} render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-gray-500">Unit price (approved)</FormLabel>
                                <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="col-span-3">
                            <FormField control={approveForm.control} name={`items.${index}.unit_cost_client`} render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-gray-500">Unit price (to client)</FormLabel>
                                <FormControl><Input type="number" {...field} className="h-9" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="col-span-1 flex flex-col items-center pt-6">
                            <FormField control={approveForm.control} name={`items.${index}.add_vat`} render={({ field }) => (
                              <FormItem className="flex flex-col items-center">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <span className="text-[10px] text-gray-400 mt-1">VAT</span>
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 h-7">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap justify-end gap-6 pt-2 border-t text-sm">
                      <div>
                        <span className="text-gray-500">Total Qty: </span>
                        <span className="font-semibold">{totals.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Estimated (ref only): </span>
                        <span className="font-medium text-gray-500">{formatCurrency(totals.estimate, currency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost to Alphamead: </span>
                        <span className="font-semibold">{formatCurrency(totals.vendor, currency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost to Client: </span>
                        <span className="font-semibold">{formatCurrency(totals.client, currency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Margin: </span>
                        <span className="font-semibold text-green-700">{formatCurrency(margin, currency)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PO — comes after the quotation because whether one is even
                  needed is derived from the Cost to Client total above. */}
              <div className="rounded-md border px-3 py-2 text-xs bg-gray-50 text-gray-600">
                {poRequired
                  ? <>PO required — Cost to Client {formatCurrency(totals.client, currency)} exceeds ₦{PO_THRESHOLD.toLocaleString()}.</>
                  : <>No PO needed — Cost to Client {currency === 'NGN' ? formatCurrency(totals.client, currency) : 'not yet priced'} is at or below ₦{PO_THRESHOLD.toLocaleString()}.</>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={approveForm.control} name="po_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      PO Number{poRequired && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. PO-2026-00123" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={approveForm.control} name="po_amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      PO Amount{poRequired && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 250000.00" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* PO Document — optional, kept outside the validated schema like the rest of the app's file inputs */}
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
                    className="h-10"
                  />
                  <Upload className="h-4 w-4 text-gray-400 shrink-0" />
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Quotation
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
