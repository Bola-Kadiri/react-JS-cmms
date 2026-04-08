// src/components/auth/SimpleLogoutOverlay.tsx
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleLogoutOverlayProps {
  isVisible: boolean;
  isSuccess?: boolean;
  onComplete?: () => void;
}

const SimpleLogoutOverlay = ({ 
  isVisible, 
  isSuccess = false, 
  onComplete 
}: SimpleLogoutOverlayProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    console.log('SimpleLogoutOverlay: Starting logout animation...');
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          console.log('SimpleLogoutOverlay: Animation complete');
          return 100;
        }
        return newProgress;
      });
    }, 30); // Complete animation in ~0.6 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (isSuccess && onComplete) {
      const timer = setTimeout(() => {
        console.log('SimpleLogoutOverlay: Calling onComplete callback');
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onComplete]);

  if (!isVisible) {
    console.log('SimpleLogoutOverlay: Not visible, returning null');
    return null;
  }

  console.log('SimpleLogoutOverlay: Rendering overlay', { isVisible, isSuccess, progress });

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 min-w-[320px] relative">
        <div className="text-center">
          {/* Main Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-100 to-orange-100 flex items-center justify-center">
              {isSuccess ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
              )}
            </div>
          </div>

          {/* Main Message */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {isSuccess ? 'Successfully Logged Out' : 'Logging You Out'}
          </h3>

          {!isSuccess && (
            <>
              <p className="text-gray-600 mb-6">
                Please wait while we securely sign you out...
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% Complete</p>
              </div>

              {/* Security Message */}
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-800">
                  Clearing your session data securely
                </p>
              </div>
            </>
          )}

          {isSuccess && (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-2">
                You have been securely logged out
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleLogoutOverlay;
