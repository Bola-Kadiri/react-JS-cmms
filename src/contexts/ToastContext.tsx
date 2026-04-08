import React, { createContext, useContext, ReactNode } from 'react';
import { 
  Toast,
  ToastClose, 
  ToastDescription, 
  ToastProvider as UIToastProvider, 
  ToastTitle, 
  ToastViewport 
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

// Export the useToast hook directly for convenience
// export { useToast } from "@/components/ui/use-toast";

// Context to use the toast globally
const ToastContext = createContext<{
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  dismissToast: () => void;
}>({
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
  dismissToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, dismiss } = useToast();

  const showSuccess = (message: string, title = 'Success') => {
    toast({
      title,
      description: message,
      variant: 'default',
      className: 'bg-green-50 border-green-200 text-green-800',
    });
  };

  const showError = (message: string, title = 'Error') => {
    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  };

  const showInfo = (message: string, title = 'Information') => {
    toast({
      title,
      description: message,
      variant: 'default',
      className: 'bg-blue-50 border-blue-200 text-blue-800',
    });
  };

  const showWarning = (message: string, title = 'Warning') => {
    toast({
      title,
      description: message,
      variant: 'default',
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    });
  };

  return (
    <ToastContext.Provider value={{ 
      showSuccess, 
      showError, 
      showInfo,
      showWarning,
      dismissToast: dismiss 
    }}>
      <UIToastProvider>
        {children}
        <ToastViewport />
      </UIToastProvider>
    </ToastContext.Provider>
  );
}

// Hook to use the toast from any component
export function useToastMessages() {
  return useContext(ToastContext);
}