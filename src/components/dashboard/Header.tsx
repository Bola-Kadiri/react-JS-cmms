// src/components/dashboard/Header.tsx
import { useState } from "react";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../auth/LogoutButton";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useTypedTranslation } from "@/hooks/useTypedTranslation";
import { useAuth } from "@/contexts/AuthContext";

export type ActiveTab = "WORK" | "INVENTORY" | "MATERIALS" | "PROCUREMENT" | "FACILITY" | "STAFF" | "CALL" | "PREDICTIVE";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTypedTranslation(['dashboard', 'common']);
  const [notificationItems] = useState([1, 2, 3, 4]);
  const [messageItems] = useState([1, 2, 3]);

  const {user} = useAuth()

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    // Navigate to the appropriate section based on the tab
    if (tab === "WORK") {
      navigate("/dashboard/calendar/ppms");
    } else if (tab === "INVENTORY") {
      navigate("/dashboard/work/requests");
    } else if (tab === "MATERIALS") {
      navigate("/dashboard/asset/assets");
    } else if (tab === "PROCUREMENT") {
      navigate("/dashboard/procurement/purchase-order");
    } else if (tab === "FACILITY") {
      navigate("/dashboard");
    } else if (tab === "STAFF") {
      navigate("/dashboard");
    } else if (tab === "CALL") {
      navigate("/dashboard");
    } else if (tab === "PREDICTIVE") {
      navigate("/dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-green-800 text-white px-4 shadow-md md:px-6">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4 md:hidden text-white" />
        <div className="hidden md:flex items-center space-x-4">
          {/* <Button 
            variant={activeTab === "WORK" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "WORK" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("WORK")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.work.line1')}</span>
            <span className="text-xs leading-tight">{t('dashboard:navigation.work.line2')}</span>
          </Button> */}
          {/* <Button 
            variant={activeTab === "INVENTORY" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "INVENTORY" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("INVENTORY")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.inventory.line1')}</span>
            <span className="text-xs leading-tight">{t('dashboard:navigation.inventory.line2')}</span>
          </Button> */}
          {/* <Button 
            variant={activeTab === "PROCUREMENT" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "PROCUREMENT" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("PROCUREMENT")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.procurement.line1')}</span>
            <span className="text-xs leading-tight">{t('dashboard:navigation.procurement.line2')}</span>
          </Button> */}
          {/* <Button 
            variant={activeTab === "MATERIALS" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "MATERIALS" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("MATERIALS")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.materials.line1')}</span>
            <span className="text-xs leading-tight">{t('dashboard:navigation.materials.line2')}</span>
          </Button> */}
          <Button 
            variant={activeTab === "FACILITY" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "FACILITY" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("FACILITY")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.facility.line1')}</span>
            <span className="text-xs leading-tight">{t('dashboard:navigation.facility.line2')}</span>
          </Button> 
          <Button 
            variant={activeTab === "STAFF" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "STAFF" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("STAFF")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.staff.line1')}</span>
            <span className="text-xs leading-tight">{t('dashboard:navigation.staff.line2')}</span>
          </Button> 
          <Button 
            variant={activeTab === "CALL" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "CALL" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("CALL")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.call.line1')}</span>
            {t('dashboard:navigation.call.line2') && (
              <span className="text-xs leading-tight">{t('dashboard:navigation.call.line2')}</span>
            )}
          </Button> 
          <Button 
            variant={activeTab === "PREDICTIVE" ? "secondary" : "ghost"} 
            className={`font-medium h-auto py-2 px-3 flex flex-col ${activeTab === "PREDICTIVE" ? "bg-green-700" : "hover:bg-green-700 text-green-100"}`}
            onClick={() => handleTabChange("PREDICTIVE")}
          >
            <span className="text-xs leading-tight">{t('dashboard:navigation.predictive.line1')}</span>
            <span className="text-xs leading-tight">{t('dashboard:navigation.predictive.line2')}</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          {/* <Button variant="ghost" size="icon" className="relative text-white hover:bg-green-700">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white" variant="destructive">
                {notificationItems.length}
              </Badge>
            </Button> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('common:notifications')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-auto">
              {notificationItems.map((item) => (
                <DropdownMenuItem key={item} className="flex flex-col items-start py-2">
                  <div className="font-medium">{t('dashboard:cards.title.new')} {t('dashboard:navigation.work')} {t('dashboard:cards.subtitle.request')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('dashboard:cards.subtitle.request')} #{43 + item} {t('common:requiresAttention')}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-green-700 font-medium">
              {t('common:viewAll')} {t('common:notifications')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          {/* <Button variant="ghost" size="icon" className="relative text-white hover:bg-green-700">
              <MessageSquare className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white">
                {messageItems.length}
              </Badge>
            </Button> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('common:messages')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-auto">
              {messageItems.map((item) => (
                <DropdownMenuItem key={item} className="flex flex-col items-start py-2">
                  <div className="font-medium">John Smith</div>
                  <div className="text-sm text-muted-foreground">
                    {t('common:updatedStatus')} {t('dashboard:cards.title.work')} {t('dashboard:cards.subtitle.order')} #{12 + item}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-green-700 font-medium">
              {t('common:viewAll')} {t('common:messages')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-green-700">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/lovable-uploads/ada4d7eb-1146-4719-a391-7c3b97c32b03.png" alt="Profile" />
                <AvatarFallback>{user?.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="hidden md:inline-flex text-sm font-medium">
                {user?.name}
              </span>
              <small className="text-[#e3e3e3]">{user?.role}</small>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('common:myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t('common:profile')}</DropdownMenuItem>
            <DropdownMenuItem>{t('common:settings')}</DropdownMenuItem>
            <DropdownMenuItem>{t('common:support')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogoutButton mode="fast" showOverlay={true} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;