import { cn } from '@/lib/utils';

interface NavigationTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationTabs = ({ tabs, activeTab, onTabChange }: NavigationTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab;
        
        return (
          <button
            key={`${tab}-${index}`}
            onClick={() => onTabChange(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
              'hover:text-blue-600 hover:border-blue-300',
              isActive
                ? 'text-blue-600 border-blue-600 bg-blue-50'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default NavigationTabs; 