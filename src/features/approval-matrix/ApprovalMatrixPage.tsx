// src/features/approval-matrix/ApprovalMatrixPage.tsx
// Super Admin: who raises, reviews and approves at each stage of the five-stage flow, per facility.
import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Loader2, Power, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/contexts/PermissionsContext';
import {
  CompanySlot, FacilitySlot, MatrixDetail, MatrixSlot, TeamSlot,
  fetchCandidates, fetchMatrix, fetchMatrixList, goLive, switchOff, updateCompanySlots, updateFacilitySlots,
} from '@/services/approvalMatrixApi';

// Named signers, chosen here. Everyone else works as a team, by role.
const FACILITY_SLOTS: FacilitySlot[] = ['approver', 'client_rep'];
const COMPANY_SLOTS: CompanySlot[] = ['head_of_finance'];
const TEAM_SLOTS: TeamSlot[] = ['requester', 'procurement', 'central_operation', 'ap_officer', 'reviewer'];
const NONE = '__none__';

// As on the design canvas (screen #01): evidence per stage, and how each step is filled.
const EVIDENCE = ['—', 'Quotation and PO recorded', 'Before/after photos, signed checklist', 'Approved WCC attached', 'Payment voucher'];
const scopeOf = (slot: MatrixSlot) =>
  slot === 'contractor' ? "team · the job's vendor"
    : slot === 'requester' ? 'team · this facility'
    : (TEAM_SLOTS as MatrixSlot[]).includes(slot) ? 'team · company'
    : slot === 'client_rep' ? "named · facility's client"
    : (COMPANY_SLOTS as MatrixSlot[]).includes(slot) ? 'named · company' : 'named · this facility';

type Draft = Partial<Record<MatrixSlot, number | null>>;
type FieldErrors = Partial<Record<MatrixSlot, string>>;

const keys = {
  list: ['approval-matrix', 'list'] as const,
  detail: (id: number) => ['approval-matrix', 'detail', id] as const,
  candidates: (id: number) => ['approval-matrix', 'candidates', id] as const,
};

// DRF returns {slot: ["message"]} for field errors, or {error, problems} for go-live / live-facility blocks.
const readError = (error: any): { message: string; fields: FieldErrors; problems: string[] } => {
  const data = error?.response?.data ?? {};
  const fields: FieldErrors = {};
  for (const slot of [...FACILITY_SLOTS, ...COMPANY_SLOTS]) {
    if (data[slot]) fields[slot] = Array.isArray(data[slot]) ? data[slot].join(' ') : String(data[slot]);
  }
  const problems: string[] = Array.isArray(data.problems) ? data.problems : [];
  const message = data.error || Object.values(fields)[0] || data.detail || 'Something went wrong. Please try again.';
  return { message, fields, problems };
};

const draftFrom = (detail: MatrixDetail, slots: MatrixSlot[]): Draft =>
  Object.fromEntries(slots.map((slot) => [slot, detail.slots[slot]?.id ?? null]));

const ApprovalMatrixPage = () => {
  const { userRole } = usePermissions();
  const queryClient = useQueryClient();
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [facilityDraft, setFacilityDraft] = useState<Draft>({});
  const [companyDraft, setCompanyDraft] = useState<Draft>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [blockers, setBlockers] = useState<string[]>([]);

  const { data: rows = [], isLoading: isLoadingList } = useQuery({ queryKey: keys.list, queryFn: fetchMatrixList });
  const { data: detail, isLoading: isLoadingDetail } = useQuery({
    queryKey: keys.detail(facilityId ?? 0), queryFn: () => fetchMatrix(facilityId!), enabled: facilityId !== null,
  });
  const { data: candidates } = useQuery({
    queryKey: keys.candidates(facilityId ?? 0), queryFn: () => fetchCandidates(facilityId!), enabled: facilityId !== null,
  });

  useEffect(() => {
    if (facilityId === null && rows.length) setFacilityId(rows[0].facility.id);
  }, [rows, facilityId]);

  useEffect(() => {
    if (!detail) return;
    setFacilityDraft(draftFrom(detail, FACILITY_SLOTS));
    setCompanyDraft(draftFrom(detail, COMPANY_SLOTS));
    setFieldErrors({});
    setBlockers([]);
  }, [detail]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['approval-matrix'] });
  const onError = (error: any) => {
    const { message, fields, problems } = readError(error);
    setFieldErrors(fields);
    setBlockers(problems);
    toast.error(message);
  };

  const saveFacility = useMutation({
    mutationFn: () => updateFacilitySlots(facilityId!, facilityDraft as Record<FacilitySlot, number | null>),
    onSuccess: () => { toast.success('Facility signers saved'); refresh(); },
    onError,
  });
  const saveCompany = useMutation({
    mutationFn: () => updateCompanySlots(companyDraft as Record<CompanySlot, number | null>),
    onSuccess: () => { toast.success('Head of Finance & Treasury saved for every facility'); refresh(); },
    onError,
  });
  const goLiveMutation = useMutation({
    mutationFn: () => goLive(facilityId!),
    onSuccess: () => { toast.success('Facility switched on for the five-stage flow'); refresh(); },
    onError,
  });
  const switchOffMutation = useMutation({
    mutationFn: () => switchOff(facilityId!),
    onSuccess: () => { toast.success('Facility switched off'); refresh(); },
    onError,
  });

  const facilityDirty = useMemo(
    () => !!detail && FACILITY_SLOTS.some((slot) => (detail.slots[slot]?.id ?? null) !== (facilityDraft[slot] ?? null)),
    [detail, facilityDraft],
  );
  const companyDirty = useMemo(
    () => !!detail && COMPANY_SLOTS.some((slot) => (detail.slots[slot]?.id ?? null) !== (companyDraft[slot] ?? null)),
    [detail, companyDraft],
  );

  if (userRole && userRole !== 'SUPER ADMIN') return <Navigate to="/unauthorized" replace />;

  const peopleText = (people: number) => `${people} ${people === 1 ? 'person' : 'people'}`;

  const nameFor = (slot: MatrixSlot) => {
    const role = detail?.slot_labels[slot] ?? slot;
    if (slot === 'contractor') return { role, name: "The Work Order's vendor staff" };
    if ((TEAM_SLOTS as MatrixSlot[]).includes(slot)) {
      const people = detail?.teams[slot as TeamSlot].people ?? 0;
      return { role, name: people ? `Team · ${peopleText(people)}` : null };
    }
    const named = slot as FacilitySlot | CompanySlot;
    const draft = (FACILITY_SLOTS as MatrixSlot[]).includes(named) ? facilityDraft : companyDraft;
    const id = draft[named];
    const person = candidates?.[named]?.find((p) => p.id === id) ?? (detail?.slots[named]?.id === id ? detail?.slots[named] : null);
    return { role, name: person?.name ?? null };
  };

  const slotSelect = (slot: FacilitySlot | CompanySlot, draft: Draft, setDraft: (d: Draft) => void, disabled: boolean) => {
    const options = candidates?.[slot] ?? [];
    const current = detail?.slots[slot];
    // Keep the saved person visible even if they no longer qualify, so the problem is shown, not hidden.
    const withCurrent = current && !options.some((p) => p.id === current.id) ? [current, ...options] : options;
    return (
      <div key={slot} className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {detail?.slot_labels[slot]}<span className="text-red-500 ml-1">*</span>
        </label>
        <Select
          value={draft[slot] ? String(draft[slot]) : NONE}
          onValueChange={(value) => {
            setDraft({ ...draft, [slot]: value === NONE ? null : Number(value) });
            setFieldErrors({ ...fieldErrors, [slot]: undefined });
          }}
          disabled={disabled}
        >
          <SelectTrigger className={fieldErrors[slot] ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a person" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Not set</SelectItem>
            {withCurrent.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name} · {p.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors[slot] ? (
          <p className="text-sm text-red-600">{fieldErrors[slot]}</p>
        ) : !options.length ? (
          <p className="text-xs text-gray-500">Nobody can be chosen yet. Check the role and facility on the user's profile.</p>
        ) : null}
      </div>
    );
  };

  const problems = blockers.length ? blockers : detail?.problems ?? [];
  const busy = saveFacility.isPending || saveCompany.isPending || goLiveMutation.isPending || switchOffMutation.isPending;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Matrix</h1>
          <p className="mt-2 text-gray-600">
            Who raises, reviews and approves at each stage. Jobs are routed to these people automatically.
          </p>
        </div>
        <div className="w-full sm:w-80 space-y-2">
          <label className="text-sm font-medium text-gray-700">Facility</label>
          <Select value={facilityId ? String(facilityId) : undefined} onValueChange={(value) => setFacilityId(Number(value))}>
            <SelectTrigger><SelectValue placeholder={isLoadingList ? 'Loading facilities…' : 'Select a facility'} /></SelectTrigger>
            <SelectContent>
              {rows.map((row) => (
                <SelectItem key={row.facility.id} value={String(row.facility.id)}>
                  {row.facility.name} · {row.is_live ? 'Live' : row.ready ? 'Ready' : `${row.problem_count} missing`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingDetail || !detail ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
      ) : (
        <>
          {detail.is_live ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>
                <strong>Live.</strong> {detail.facility.name} uses the five-stage flow
                {detail.went_live_at ? ` since ${new Date(detail.went_live_at).toLocaleString()}` : ''}
                {detail.went_live_by ? `, switched on by ${detail.went_live_by.name}` : ''}.
              </span>
            </div>
          ) : problems.length ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-5 w-5" />
                {detail.facility.name} cannot go live yet. Fix these {problems.length} items:</div>
              <ul className="mt-2 list-disc pl-8 space-y-1">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /><span><strong>Ready to go live.</strong> Every signer is named and every team has people.</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <Table>
              <TableHeader className="bg-green-50">
                <TableRow>
                  <TableHead className="text-green-800">Stage</TableHead>
                  <TableHead className="text-green-800">Raises</TableHead>
                  <TableHead className="text-green-800">Reviews</TableHead>
                  <TableHead className="text-green-800">Approves</TableHead>
                  <TableHead className="text-green-800">Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.chain.map((row, index) => (
                  <TableRow key={row.stage}>
                    <TableCell className="font-semibold whitespace-nowrap">{index + 1} · {row.stage}</TableCell>
                    {[row.raises, row.reviews, row.approves].map((slot, i) => {
                      const { role, name } = nameFor(slot);
                      return (
                        <TableCell key={i}>
                          <div className="font-medium">{role}</div>
                          <div className={`text-sm ${name ? 'text-gray-600' : 'text-red-600'}`}>{name ?? 'Not set'}</div>
                          <Badge variant="outline" className={`mt-1 ${scopeOf(slot).startsWith('team') ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
                            {scopeOf(slot)}
                          </Badge>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-sm text-gray-600">{EVIDENCE[index]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <div className="p-6 bg-green-50 border-b border-green-100 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-green-800">{detail.facility.name} · signers</h2>
                <Badge variant="outline">client: {detail.facility.client ?? 'none'}</Badge>
              </div>
              <div className="p-6 space-y-4">
                {FACILITY_SLOTS.map((slot) => slotSelect(slot, facilityDraft, setFacilityDraft, busy))}
                <div className="flex justify-end">
                  <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={!facilityDirty || busy}
                          onClick={() => saveFacility.mutate()}>
                    {saveFacility.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save facility signers
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <div className="p-6 bg-green-50 border-b border-green-100 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-green-800">Company-wide signer</h2>
                <Badge variant="outline">applies to every facility</Badge>
              </div>
              <div className="p-6 space-y-4">
                {COMPANY_SLOTS.map((slot) => slotSelect(slot, companyDraft, setCompanyDraft, busy))}
                <div className="flex justify-end">
                  <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={!companyDirty || busy}
                          onClick={() => saveCompany.mutate()}>
                    {saveCompany.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <div className="p-6 bg-green-50 border-b border-green-100 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-green-800">Teams</h2>
                <Badge variant="outline">by role · nobody to choose</Badge>
              </div>
              <ul className="p-6 space-y-3">
                {TEAM_SLOTS.map((slot) => {
                  const team = detail.teams[slot];
                  return (
                    <li key={slot} className="flex items-start justify-between gap-3 text-sm">
                      <span className="flex items-start gap-2">
                        <Users className="h-4 w-4 mt-0.5 text-green-700" />
                        <span>
                          <span className="font-medium">{detail.slot_labels[slot]}</span>
                          <span className="block text-xs text-gray-500">
                            {team.scope === 'facility' ? `assigned to ${detail.facility.name}` : 'all facilities'}
                          </span>
                        </span>
                      </span>
                      <span className={team.people ? 'text-gray-700' : 'text-red-600 font-medium'}>
                        {team.people ? peopleText(team.people) : 'nobody'}
                      </span>
                    </li>
                  );
                })}
                <li className="pt-2 text-xs text-gray-500">
                  Add someone to a team by giving them the role (and, for Site Managers, the facility) on their user profile.
                </li>
              </ul>
            </section>
          </div>

          <div className="rounded-lg border bg-white p-4 text-sm">
            <strong className="text-green-800">Raise Payment bills (separate flow)</strong>
            <p className="mt-1 text-gray-600">
              Requester → Approver → Reviewer → Wole Olufore (₦1,000,000 or more) → HEAD OF FINANCE &amp; TREASURY pays.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3 rounded-lg border bg-white p-5">
            {detail.is_live ? (
              <Button variant="outline" disabled={busy} onClick={() => switchOffMutation.mutate()}>
                <Power className="mr-2 h-4 w-4" />Switch off
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={busy || facilityDirty || companyDirty || detail.problems.length > 0}
                      onClick={() => goLiveMutation.mutate()}>
                {goLiveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Power className="mr-2 h-4 w-4" />}
                Go live
              </Button>
            )}
          </div>
          {(facilityDirty || companyDirty) && !detail.is_live && (
            <p className="text-right text-sm text-gray-500">Save your changes before going live.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovalMatrixPage;
