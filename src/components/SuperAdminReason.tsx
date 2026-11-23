// src/components/SuperAdminReason.tsx
// Shown when the Super Admin edits or submits someone else's work. The reason is required and
// goes in the record's history, and the people whose step it was are told.
import { ShieldAlert } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  forWhom: string;
  value: string;
  onChange: (value: string) => void;
}

const SuperAdminReason = ({ forWhom, value, onChange }: Props) => (
  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2 text-sm">
    <p className="font-semibold text-amber-900 flex items-center gap-2">
      <ShieldAlert className="h-4 w-4" /> You are acting as Super Admin for {forWhom}
    </p>
    <p className="text-amber-800">
      Give a reason. It is saved in the history, and {forWhom} will be told.
    </p>
    <Textarea
      aria-label="Reason for acting as Super Admin"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. Procurement officer on leave, job is urgent"
      rows={2}
      className="bg-white"
    />
  </div>
);

export default SuperAdminReason;
