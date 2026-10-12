import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileUp, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/contexts/PermissionsContext';

interface RowResult {
  row: number;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message: string;
}

interface ImportResult {
  dry_run: boolean;
  saved: boolean;
  errors: number;
  counts: Record<string, number>;
  rows: RowResult[];
}

interface BulkUploadDialogProps {
  title: string;
  description: string;
  /** e.g. '/accounts/api/vendors' — the backend serves `${baseUrl}/bulk-import/` and `/bulk-import-template/`. */
  baseUrl: string;
  templateFilename: string;
  /** React Query keys to refresh after a successful upload. */
  refreshKeys: readonly (readonly unknown[])[];
}

const STATUS_STYLES: Record<RowResult['status'], string> = {
  created: 'bg-green-100 text-green-800 border-green-200',
  updated: 'bg-blue-100 text-blue-800 border-blue-200',
  skipped: 'bg-gray-100 text-gray-700 border-gray-200',
  error: 'bg-red-100 text-red-800 border-red-200',
};

/**
 * Super Admin CSV bulk upload: download template → choose file → Preview (nothing
 * saved) → Upload. The backend saves nothing if any row has an error.
 */
export const BulkUploadDialog = ({ title, description, baseUrl, templateFilename, refreshKeys }: BulkUploadDialogProps) => {
  const { userRole } = usePermissions();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (userRole !== 'SUPER ADMIN') return null;

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get(`${baseUrl}/bulk-import-template/`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = templateFilename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download the template.');
    }
  };

  const send = async (dryRun: boolean) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dry_run', dryRun ? 'true' : 'false');
    try {
      const { data } = await api.post<ImportResult>(`${baseUrl}/bulk-import/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      if (!dryRun && data.saved) {
        await Promise.all(refreshKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
        toast.success(`Upload complete: ${data.counts.created ?? 0} added, ${data.counts.skipped ?? 0} already existed.`);
        setOpen(false);
        reset();
      }
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.rows) {
        setResult(data);  // row errors — nothing was saved
      } else {
        setError(data?.detail || 'Upload failed. Please check the file and try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const canUpload = !!result && result.dry_run && result.errors === 0 && (result.counts.created || result.counts.updated);

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50">
          <FileUp className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <span className="text-sm text-green-800">1. Download the template and fill it in (save as CSV).</span>
            <Button type="button" size="sm" variant="outline" onClick={downloadTemplate} className="ml-auto">
              <Download className="mr-2 h-4 w-4" /> Template
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">2. Choose your CSV file</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(null); }}
              className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {result && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {Object.entries(result.counts).map(([key, count]) => (
                  <Badge key={key} variant="outline" className={STATUS_STYLES[key as RowResult['status']]}>
                    {count} {key}
                  </Badge>
                ))}
              </div>
              {result.errors > 0 && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {result.errors} row(s) have problems. Nothing has been saved — fix them in the file and preview again.
                </p>
              )}
              <div className="max-h-72 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead className="w-28">Result</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.map((r) => (
                      <TableRow key={r.row}>
                        <TableCell>{r.row}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_STYLES[r.status]}>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" disabled={!file || busy} onClick={() => send(true)}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            3. Preview
          </Button>
          <Button
            type="button"
            disabled={!canUpload || busy}
            onClick={() => send(false)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            4. Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;
