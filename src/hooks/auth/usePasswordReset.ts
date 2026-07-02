import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset, confirmPasswordReset } from '@/services/authApi';

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });

export const useConfirmPasswordReset = () =>
  useMutation({
    mutationFn: confirmPasswordReset,
  });
