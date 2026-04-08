import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  text?: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

export const Spinner = ({ className, size = "medium", text }: SpinnerProps) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-10 w-10",
  };

  return (
    <div className="flex justify-center items-center gap-1">
      <Loader2
      className={cn(
        "animate-spin text-[#fff]",
        sizeClasses[size],
        className
      )}
    />
    {text}
    </div>
  );
};