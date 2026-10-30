// src/features/work/workorders/components/RaisePaymentTrail.tsx
// Approval trail, shared by Raise Payment bills and five-stage Work Requests: who has it now,
// who did each step (name, email, time), and who is next.
import { useState } from 'react';
import { Check, Clock, Copy, Mail, X, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { RaisePaymentTrail as Trail, TrailPerson } from '@/types/workorder';

interface Props {
  trail: Trail;
  currentUserId: number;
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';

const when = (iso: string | null) => (iso ? format(new Date(iso), 'd MMM, HH:mm') : '');

const took = (seconds: number | null) => {
  if (!seconds || seconds < 60) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours >= 48) return `took ${Math.floor(hours / 24)} days`;
  return hours ? `took ${hours} h ${minutes} m` : `took ${minutes} m`;
};

const waitingFor = (iso: string) => {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return 'Waiting less than an hour';
  if (hours >= 48) return `Waiting ${Math.floor(hours / 24)} days`;
  return `Waiting ${hours} h`;
};

const Avatar = ({ name, tone }: { name: string; tone: 'green' | 'amber' | 'grey' | 'red' }) => {
  const tones = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-200 text-amber-900',
    grey: 'bg-gray-100 text-gray-600',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${tones[tone]}`}>
      {initials(name)}
    </span>
  );
};

const EmailLink = ({ email }: { email: string }) =>
  email ? <a href={`mailto:${email}`} className="text-xs text-green-700 underline break-all">{email}</a> : null;

const PersonLine = ({ person, tone, role }: { person: TrailPerson; tone: 'green' | 'amber' | 'grey' | 'red'; role?: string }) => (
  <span className="flex items-center gap-3 min-w-0">
    <Avatar name={person.name} tone={tone} />
    <span className="flex flex-col min-w-0">
      <span className="text-sm font-semibold text-gray-900">
        {person.name}{role && <span className="font-normal text-gray-600"> · {role}</span>}
      </span>
      <EmailLink email={person.email} />
    </span>
  </span>
);

const Dot = ({ kind }: { kind: 'done' | 'now' | 'next' | 'returned' | 'rejected' }) => {
  if (kind === 'done') {
    return <span className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-white" strokeWidth={3} /></span>;
  }
  if (kind === 'rejected') {
    return <span className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center shrink-0"><X className="h-3 w-3 text-white" strokeWidth={3} /></span>;
  }
  if (kind === 'returned') return <span className="h-5 w-5 rounded-full bg-amber-600 shrink-0" />;
  if (kind === 'now') return <span className="h-5 w-5 rounded-full border-4 border-amber-500 bg-white shrink-0" />;
  return <span className="h-5 w-5 rounded-full border-2 border-gray-400 bg-white shrink-0" />;
};

const RaisePaymentTrail = ({ trail, currentUserId }: Props) => {
  const [copied, setCopied] = useState('');
  const waiting = trail.waiting;
  const yourTurn = !!waiting?.people.some((p) => p.id === currentUserId);
  const copy = (email: string) => {
    navigator.clipboard?.writeText(email).then(() => { setCopied(email); setTimeout(() => setCopied(''), 1500); }).catch(() => undefined);
  };

  return (
    <section className="rounded-lg border bg-white shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 bg-green-50 border-b border-green-100 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-green-800">Approval trail</h2>
        <span className="text-xs text-gray-600">Route: {trail.route.join(' → ')}</span>
      </div>

      <div className="p-5 space-y-6">
        {/* Who has it now */}
        {waiting && (
          <div className={`rounded-lg border-2 p-4 flex flex-wrap items-center justify-between gap-4 ${yourTurn ? 'border-green-600 bg-green-50' : 'border-amber-500 bg-amber-50'}`}>
            <div className="flex flex-col gap-2 min-w-0">
              <span className={`text-xs font-bold tracking-wider ${yourTurn ? 'text-green-800' : 'text-amber-800'}`}>
                {yourTurn ? `YOUR TURN · ${waiting.label.toUpperCase()}` : `WAITING ON · ${waiting.role.toUpperCase()}`}
              </span>
              {waiting.people.length === 0 && <span className="text-sm text-gray-700">Nobody is assigned to this step yet.</span>}
              {waiting.people.slice(0, 4).map((person) => (
                <span key={person.id} className="flex flex-wrap items-center gap-2">
                  <PersonLine person={person} tone={yourTurn ? 'green' : 'amber'} />
                  {person.email && (
                    <span className="flex gap-1">
                      <a href={`mailto:${person.email}`} aria-label={`Email ${person.name}`}
                         className="h-8 w-8 rounded-md border border-amber-300 bg-white flex items-center justify-center hover:bg-amber-100">
                        <Mail className="h-4 w-4 text-amber-800" />
                      </a>
                      <button type="button" onClick={() => copy(person.email)} aria-label={`Copy ${person.name}'s email address`}
                              className="h-8 w-8 rounded-md border border-amber-300 bg-white flex items-center justify-center hover:bg-amber-100">
                        <Copy className="h-4 w-4 text-amber-800" />
                      </button>
                      {copied === person.email && <span className="text-xs text-green-700 self-center">Copied</span>}
                    </span>
                  )}
                </span>
              ))}
              {waiting.people.length > 4 && <span className="text-xs text-gray-600">and {waiting.people.length - 4} more in the team</span>}
              {yourTurn && <span className="text-sm text-green-800">Use the buttons at the top of this page to act.</span>}
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className={`flex items-center gap-1.5 text-sm font-semibold ${yourTurn ? 'text-green-800' : 'text-amber-900'}`}>
                <Clock className="h-4 w-4" /> {waitingFor(waiting.since)}
              </span>
              <span className="text-xs text-gray-600">Since {when(waiting.since)}</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <ol className="space-y-4">
          {trail.events.map((event, index) => {
            const kind = event.state === 'rejected' ? 'rejected' : event.state === 'returned' ? 'returned' : 'done';
            const tone = kind === 'rejected' ? 'red' : 'green';
            return (
              <li key={index} className="grid grid-cols-[20px_minmax(0,1fr)] sm:grid-cols-[20px_150px_minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-start">
                <span className="mt-1"><Dot kind={kind} /></span>
                <span className={`text-sm font-semibold ${kind === 'rejected' ? 'text-red-800' : kind === 'returned' ? 'text-amber-800' : 'text-green-800'}`}>
                  {event.label}
                  {event.action === 'procured' && trail.po_number && <span className="block text-xs font-normal text-gray-600">{trail.po_number}</span>}
                </span>
                <span className="col-start-2 sm:col-start-auto flex flex-col gap-1 min-w-0">
                  {event.actor
                    ? <PersonLine person={event.actor} tone={tone} role={event.role} />
                    : event.assigned.map((person) => <PersonLine key={person.id} person={person} tone="grey" role={`Assigned ${event.role}`} />)}
                  {event.on_behalf_of && (
                    <span className="self-start text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                      on behalf of {event.on_behalf_of.name}
                    </span>
                  )}
                  {!event.recorded && <span className="text-xs italic text-gray-600">Who did this step was not recorded (before recording began)</span>}
                  {event.signature && <span className="text-xs text-gray-600">Signed “{event.signature}”</span>}
                  {event.note && (
                    <span className="text-sm rounded-md border px-3 py-2 bg-gray-50 border-gray-200 text-gray-800">Note: “{event.note}”</span>
                  )}
                  {event.reason && (
                    <span className={`text-sm rounded-md border px-3 py-2 ${kind === 'rejected' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                      “{event.reason}”
                    </span>
                  )}
                </span>
                <span className="col-start-2 sm:col-start-auto flex flex-col sm:items-end text-xs text-gray-600">
                  <span className="text-sm text-gray-900">{when(event.at)}</span>
                  {took(event.took_seconds) && <span>{took(event.took_seconds)}</span>}
                </span>
              </li>
            );
          })}

          {waiting && (
            <li className="grid grid-cols-[20px_minmax(0,1fr)] sm:grid-cols-[20px_150px_minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-start">
              <span className="mt-1"><Dot kind="now" /></span>
              <span className="text-sm font-bold text-amber-800">{waiting.label}</span>
              <span className="col-start-2 sm:col-start-auto text-sm text-gray-700">
                {waiting.people.length === 1 ? waiting.people[0].name : `${waiting.role} team`}
              </span>
              <span className="col-start-2 sm:col-start-auto text-sm font-semibold text-amber-800">Waiting…</span>
            </li>
          )}

          {trail.upcoming.map((step) => (
            <li key={step.step} className="grid grid-cols-[20px_minmax(0,1fr)] sm:grid-cols-[20px_150px_minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-start">
              <span className="mt-1"><Dot kind="next" /></span>
              <span className="text-sm font-semibold text-gray-600">{step.label}</span>
              <span className="col-start-2 sm:col-start-auto min-w-0">
                {step.step === 'payment' || step.people.length !== 1
                  ? <span className="flex items-center gap-3">
                      <span className="h-9 w-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-gray-600" />
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{step.role}</span>
                    </span>
                  : <PersonLine person={step.people[0]} tone="grey" role={step.role} />}
              </span>
              <span className="col-start-2 sm:col-start-auto text-sm text-gray-600">Next</span>
            </li>
          ))}
        </ol>

        {trail.closed === 'paid' && <p className="text-sm font-semibold text-green-800">Paid. This bill is closed.</p>}
        {trail.closed === 'approved' && (
          <p className="text-sm font-semibold text-green-800">Fully approved. The job has moved on to the Work Order (see Whole job).</p>
        )}
        {trail.closed === 'rejected' && (
          <p className="text-sm text-gray-700">This bill is closed. The Requester can raise it again with the same bill number.</p>
        )}

        <div className="flex flex-wrap gap-5 pt-4 border-t border-gray-100 text-xs text-gray-600">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-green-600" />Done</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-[3px] border-amber-500" />With them now</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-gray-400" />Next</span>
          <span>Each step shows who actually acted, time stamped.</span>
        </div>
      </div>
    </section>
  );
};

export default RaisePaymentTrail;
