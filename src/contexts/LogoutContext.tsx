// src/contexts/LogoutContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import LogoutOverlay from '@/components/auth/LogoutOverlay';

interface LogoutContextType {
  showLogoutOverlay: (show: boolean) => void;
  isLogoutOverlayVisible: boolean;
  setLogoutSuccess: (success: boolean) => void;
  isLogoutSuccess: boolean;
}

const LogoutContext = createContext<LogoutContextType>({
  showLogoutOverlay: () => {},
  isLogoutOverlayVisible: false,
  setLogoutSuccess: () => {},
  isLogoutSuccess: false,
});

export const LogoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLogoutOverlayVisible, setIsLogoutOverlayVisible] = useState(false);
  const [isLogoutSuccess, setIsLogoutSuccess] = useState(false);

  const showLogoutOverlay = (show: boolean) => {
    setIsLogoutOverlayVisible(show);
    if (!show) {
      // Reset success state when hiding overlay
      setTimeout(() => setIsLogoutSuccess(false), 300);
    }
  };

  const setLogoutSuccess = (success: boolean) => {
    setIsLogoutSuccess(success);
  };

  return (
    <LogoutContext.Provider 
      value={{
        showLogoutOverlay,
        isLogoutOverlayVisible,
        setLogoutSuccess,
        isLogoutSuccess
      }}
    >
      {children}
      <LogoutOverlay 
        isVisible={isLogoutOverlayVisible} 
        isSuccess={isLogoutSuccess}
      />
    </LogoutContext.Provider>
  );
};

export const useLogoutOverlay = () => {
  const context = useContext(LogoutContext);
  if (!context) {
    throw new Error('useLogoutOverlay must be used within a LogoutProvider');
  }
  return context;
};
