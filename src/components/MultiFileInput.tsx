// src/components/MultiFileInput.tsx
// Pick several files, one or many at a time; each picked file can be removed before saving.
import { useRef, useState } from 'react';
import { FileText, Paperclip, X } from 'lucide-react';

// The server refuses any submission over 1 MB, so all attachments together must stay under it.
// A little headroom is left for the rest of the form.
const MAX_TOTAL_BYTES = 1_000_000;

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

interface Props {
  id: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  invalid?: boolean;
  hint?: string;
}

const MultiFileInput = ({ id, files, onChange, accept, disabled, invalid, hint }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState<File[]>([]);
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={`flex items-center gap-2 rounded-md border border-dashed px-3 py-2.5 text-sm cursor-pointer transition-colors
          ${invalid ? 'border-red-500 bg-red-50/40' : 'border-gray-300 bg-gray-50 hover:bg-green-50 hover:border-green-400'}
          ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <Paperclip className="h-4 w-4 text-green-700 shrink-0" />
        <span className="text-gray-700">{files.length ? 'Add more files' : 'Choose files'}</span>
        <span className="text-xs text-gray-500">(you can select several)</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          const accepted: File[] = [];
          const refused: File[] = [];
          let running = totalBytes;
          picked.forEach((file) => {
            if (running + file.size <= MAX_TOTAL_BYTES) {
              accepted.push(file);
              running += file.size;
            } else {
              refused.push(file);
            }
          });
          setRejected(refused);
          if (accepted.length) onChange([...files, ...accepted]);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      {hint && !files.length && <p className="text-xs text-gray-500">{hint}</p>}
      <p className="text-xs text-amber-700">
        Maximum 1 MB for all attachments combined. Files larger than 1 MB cannot be uploaded. Reduce photo size or
        save PDFs at a lower quality before attaching.
      </p>
      {rejected.length > 0 && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <p className="font-medium">Not attached, over the 1 MB limit:</p>
          <ul className="mt-1 list-disc pl-4">
            {rejected.map((file, index) => (
              <li key={`${file.name}-${index}`} className="break-all">
                {file.name} ({formatSize(file.size)})
              </li>
            ))}
          </ul>
          <p className="mt-1">Make the file smaller, or remove another attachment to free up space, then try again.</p>
        </div>
      )}
      {files.length > 0 && (
        <>
          <ul className="space-y-1.5">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                <span className="flex items-center gap-2 min-w-0 text-sm text-gray-700">
                  <FileText className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{formatSize(file.size)}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  disabled={disabled}
                  onClick={() => {
                    onChange(files.filter((_, i) => i !== index));
                    setRejected([]);
                  }}
                  className="text-gray-400 hover:text-red-600 shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500">{formatSize(totalBytes)} of 1 MB used</p>
        </>
      )}
    </div>
  );
};

export default MultiFileInput;
