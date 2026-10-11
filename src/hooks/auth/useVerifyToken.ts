import { api, tokenManager } from '@/services/apiClient'
import {useMutation} from '@tanstack/react-query'

export const useVerifyToken = () => {
    return useMutation({
      mutationFn: async () => {
        const token = tokenManager.getAccessToken();
        if (!token) throw new Error('No token found');
        const { data } = await api.post('auth/token/verify/', { token });
        return data;
      }
    });
};