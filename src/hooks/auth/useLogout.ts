import { tokenManager } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner'

// Logout hook with enhanced UX
export const useLogout = (options?: { instant?: boolean }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
  
    return useMutation({
      mutationFn: async () => {
        if (options?.instant) {
          // Instant logout for performance
          tokenManager.clearTokens();
          return { success: true };
        }

        // Minimal delay for smooth UI transition
        const logoutProcess = async () => {
          // Step 1: Secure session (quick)
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Step 2: Save preferences (quick)
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Step 3: Clear tokens and sign out
          tokenManager.clearTokens();
          await new Promise(resolve => setTimeout(resolve, 200));
          
          return { success: true };
        };

        return await logoutProcess();
      },
      onSuccess: () => {
        // Clear React Query cache
        queryClient.setQueryData(['auth'], { isAuthenticated: false, user: null });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        
        const redirectAndNotify = () => {
          // Navigate to login
          navigate('/login');
          
          toast.success('Logged out successfully', {
            description: 'You have been securely signed out',
            duration: 3000,
          });
        };

        if (options?.instant) {
          // Immediate redirect for instant mode
          redirectAndNotify();
        } else {
          // Show success state briefly before redirecting
          setTimeout(redirectAndNotify, 300);
        }
      },
      onError: (error) => {
        console.error('Logout error:', error);
        toast.error('Logout failed', {
          description: 'There was an issue signing you out. Please try again.',
        });
      }
    });
  };