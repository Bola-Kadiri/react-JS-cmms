// src/features/work/workrequests/components/JobStrip.tsx
// The whole job's five stages (Request → Work Order → Certificate → Invoice → Payment) and where it is now.
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { JobStage } from '@/services/workRequestFlowApi';

const StageBox = ({ stage, index }: { stage: JobStage; index: number }) => {
  const styles = {
    done: 'border-green-300 bg-green-50 text-green-800',
    current: 'border-2 border-amber-500 bg-amber-50 text-amber-900 font-semibold',
    next: 'border-gray-200 bg-white text-gray-600',
    stopped: 'border-red-300 bg-red-50 text-red-800',
  }[stage.state];
  const marker = stage.state === 'done'
    ? <Check className="h-3.5 w-3.5 text-green-700" strokeWidth={3} />
    : stage.state === 'stopped'
      ? <X className="h-3.5 w-3.5 text-red-700" strokeWidth={3} />
      : <span className={`h-3 w-3 rounded-full ${stage.state === 'current' ? 'border-[3px] border-amber-500' : 'border-2 border-gray-400'}`} />;
  const body = (
    <>
      {marker}
      <span>{index + 1} · {stage.label}</span>
      {stage.note && <span className="font-normal">· {stage.note}</span>}
    </>
  );
  const className = `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${styles}`;
  return stage.link
    ? <Link to={stage.link} className={`${className} hover:underline`}>{body}</Link>
    : <span className={className}>{body}</span>;
};

const JobStrip = ({ stages }: { stages: JobStage[] }) => (
  <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Whole job</p>
    <div className="flex flex-wrap items-center gap-2">
      {stages.map((stage, index) => (
        <span key={stage.key} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-400" aria-hidden="true">→</span>}
          <StageBox stage={stage} index={index} />
        </span>
      ))}
    </div>
    <p className="text-xs text-gray-600">Each stage opens its own page once it exists.</p>
  </section>
);

export default JobStrip;
