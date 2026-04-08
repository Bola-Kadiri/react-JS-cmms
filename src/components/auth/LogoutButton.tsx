// src/components/LogoutButton.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/auth/useLogout';
import { useLogoutOverlay } from '@/contexts/LogoutContext';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { LogOut, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import SimpleLogoutOverlay from './SimpleLogoutOverlay';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showOverlay?: boolean; // Option to show full overlay or just button feedback
  mode?: 'fast' | 'instant'; // New mode option
}

const LogoutButton = ({ 
  className = '', 
  variant = 'default',
  showOverlay = true,
  mode = 'fast'
}: LogoutButtonProps) => {
  const { mutate: logout, isPending, isSuccess } = useLogout({ instant: mode === 'instant' });
  const { showLogoutOverlay, setLogoutSuccess } = useLogoutOverlay();
  const { t } = useTypedTranslation();
  const [countdown, setCountdown] = useState(0);
  const [showSimpleOverlay, setShowSimpleOverlay] = useState(false);
  const [simpleOverlaySuccess, setSimpleOverlaySuccess] = useState(false);

  // Handle overlay display - use both context overlay and simple overlay for reliability
  useEffect(() => {
    if (showOverlay) {
      if (isPending) {
        console.log('LogoutButton: Showing overlays for logout...', { mode, showOverlay });
        // Show context overlay (except for instant mode)
        if (mode !== 'instant') {
          showLogoutOverlay(true);
        }
        // Always show simple overlay for visual feedback
        setShowSimpleOverlay(true);
        setSimpleOverlaySuccess(false);
      }
      if (isSuccess) {
        console.log('LogoutButton: Logout successful, showing success state...');
        // Set success state for context overlay
        if (mode !== 'instant') {
          setLogoutSuccess(true);
        }
        // Set success state for simple overlay
        setSimpleOverlaySuccess(true);
        
        // Hide overlays after showing success (shorter for instant mode)
        const hideDelay = mode === 'instant' ? 600 : 1200;
        setTimeout(() => {
          console.log('LogoutButton: Hiding overlays after success...');
          if (mode !== 'instant') {
            showLogoutOverlay(false);
          }
          setShowSimpleOverlay(false);
          setSimpleOverlaySuccess(false);
        }, hideDelay);
      }
    }
  }, [isPending, isSuccess, showOverlay, showLogoutOverlay, setLogoutSuccess, mode]);

  // Simulate a countdown during logout process (for non-overlay mode)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending && !showOverlay) {
      setCountdown(1);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isPending, showOverlay]);

  const handleLogout = () => {
    logout();
  };

  const getButtonContent = () => {
    if (isSuccess) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Logged Out</span>
        </div>
      );
    }
    
    if (isPending) {
      return (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Loader2 className="h-4 w-4 animate-spin" />
            {/* Progress ring */}
            <svg className="absolute inset-0 h-4 w-4 -rotate-90" viewBox="0 0 16 16">
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(3 - countdown) * (37.7 / 3)} 37.7`}
                className="opacity-30"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm">{t('auth:messages.loggingOut')}...</span>
            {countdown > 0 && (
              <span className="text-xs opacity-70">
                {countdown}s
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        <span>{t('auth:logout')}</span>
      </div>
    );
  };

  return (
    <>
      <Button 
        onClick={handleLogout} 
        disabled={isPending || isSuccess}
        variant={variant}
        className={cn(
          "relative transition-all duration-200",
          isPending && "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
          isSuccess && "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
          className
        )}
      >
        {getButtonContent()}
        
        {/* Loading overlay effect */}
        {isPending && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded" />
        )}
      </Button>

      {/* Simple Logout Overlay - shown when showOverlay is enabled */}
      {showOverlay && (
        <SimpleLogoutOverlay
          isVisible={showSimpleOverlay}
          isSuccess={simpleOverlaySuccess}
          onComplete={() => {
            setShowSimpleOverlay(false);
            setSimpleOverlaySuccess(false);
          }}
        />
      )}
    </>
  );
};

export default LogoutButton;