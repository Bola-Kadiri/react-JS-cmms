// src/components/auth/LogoutOverlay.tsx
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoutOverlayProps {
  isVisible: boolean;
  isSuccess?: boolean;
}

const LogoutOverlay = ({ isVisible, isSuccess = false }: LogoutOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm",
      "flex items-center justify-center transition-all duration-300",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="flex flex-col items-center gap-4">
        {/* Simple Loader */}
        <div className="relative">
          {isSuccess ? (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Simple Text */}
        <div className="text-center">
          <p className="text-white text-lg font-medium">
            {isSuccess ? 'Logged Out Successfully' : 'Logging Out...'}
          </p>
          {!isSuccess && (
            <p className="text-white/70 text-sm mt-1">
              Please wait
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoutOverlay;
