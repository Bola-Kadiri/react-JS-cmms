import { api } from './apiClient';

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/password-reset/', { email });
  return data;
};

export const confirmPasswordReset = async (payload: {
  uid: string;
  token: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/password-reset/confirm/', payload);
  return data;
};
