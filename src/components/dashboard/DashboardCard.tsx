import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  value: string;
  icon: ReactNode;
  className?: string;
}

const DashboardCard = ({
  title,
  subtitle,
  value,
  icon,
  className,
}: DashboardCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-lg">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className="rounded-full p-2">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;