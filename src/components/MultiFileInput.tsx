// src/components/MultiFileInput.tsx
// Pick several files, one or many at a time; each picked file can be removed before saving.
import { useRef } from 'react';
import { FileText, Paperclip, X } from 'lucide-react';

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
          if (picked.length) onChange([...files, ...picked]);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      {hint && !files.length && <p className="text-xs text-gray-500">{hint}</p>}
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
              <span className="flex items-center gap-2 min-w-0 text-sm text-gray-700">
                <FileText className="h-4 w-4 text-green-600 shrink-0" />
                <span className="truncate">{file.name}</span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                className="text-gray-400 hover:text-red-600 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiFileInput;
