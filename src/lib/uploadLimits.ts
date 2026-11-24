// src/lib/uploadLimits.ts
// Attachment limits for the whole app. The backend refuses any single file over 15 MB, and the
// web server refuses a whole save over 100 MB; screens check first so people get a clear message.
import { toast } from 'sonner';

export const MAX_FILE_MB = 15;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
// All files in one save together. Kept under the server's 100 MB to leave room for the form itself.
export const MAX_SAVE_MB = 95;
export const MAX_SAVE_BYTES = MAX_SAVE_MB * 1024 * 1024;

export const UPLOAD_HINT = `Up to ${MAX_FILE_MB} MB per file.`;

export const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const isTooLarge = (file: File) => file.size > MAX_FILE_BYTES;

export const tooLargeMessage = (file: File) =>
  `${file.name} is ${formatFileSize(file.size)}. Each file can be at most ${MAX_FILE_MB} MB.`;

/**
 * Split picked files into those that can be attached and those that cannot, with the reason.
 * `alreadyBytes` is the size of files already attached in the same save.
 */
export const checkFiles = (picked: File[], alreadyBytes = 0) => {
  const accepted: File[] = [];
  const refused: { file: File; reason: string }[] = [];
  let running = alreadyBytes;
  picked.forEach((file) => {
    if (isTooLarge(file)) {
      refused.push({ file, reason: `over the ${MAX_FILE_MB} MB limit per file` });
    } else if (running + file.size > MAX_SAVE_BYTES) {
      refused.push({ file, reason: `all files together would be over ${MAX_SAVE_MB} MB for one save` });
    } else {
      accepted.push(file);
      running += file.size;
    }
  });
  return { accepted, refused };
};

/** One message for the files that could not be attached, or '' when all are fine. */
export const refusedMessage = (refused: { file: File; reason: string }[]) =>
  refused.map(({ file, reason }) => `${file.name} (${formatFileSize(file.size)}) was not attached: ${reason}.`).join(' ');

/**
 * For a screen's file picker: returns the files that can be attached and shows one message
 * naming any that cannot (and why). Files that are fine are never dropped.
 */
export const keepUploadable = (picked: File[], alreadyBytes = 0): File[] => {
  const { accepted, refused } = checkFiles(picked, alreadyBytes);
  if (refused.length) toast.error(refusedMessage(refused));
  return accepted;
};
