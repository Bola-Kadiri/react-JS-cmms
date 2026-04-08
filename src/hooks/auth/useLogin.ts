import { AxiosError } from 'axios';
import {useMutation, useQueryClient} from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api, tokenManager } from '@/services/apiClient';
import { AuthResponse, LoginCredentials } from '@/types/auth';
import {toast} from 'sonner'

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            const {data} = await api.post<AuthResponse>('/auth/token/', credentials);
            return data;
        },
        onSuccess: (data) => {
            // Store tokens in memory
            tokenManager.setTokens(data.access, data.refresh);

            // If user data is included in response, store it
            // if (data.user) {
            //     queryClient.setQueryData(['auth'], { 
            //     isAuthenticated: true,
            //     user: data.user
            //     });
            // }
            
            // Invalidate auth query to force refresh
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            
            // Show success message
            toast.success('Logged in successfully');
            
            // Redirect to dashboard
            navigate('/');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Login failed')
        }
    })
}