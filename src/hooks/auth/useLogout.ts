import { cancelAllRequests, tokenManager } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';

export const useLogout = (_options?: { instant?: boolean }) => {
    const queryClient = useQueryClient();
    const { logout: authLogout } = useAuth();

    return useMutation({
        mutationFn: async () => {
            // Cancel all in-flight API requests immediately
            cancelAllRequests();
            // Wipe the entire React Query cache
            queryClient.clear();
            // Call auth context logout — clears tokens, sets isAuthenticated=false, navigates to /login
            authLogout();
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Logged out successfully', { duration: 3000 });
        },
        onError: (error) => {
            console.error('Logout error:', error);
            tokenManager.clearTokens();
            queryClient.clear();
            authLogout();
        },
    });
};