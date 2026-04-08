import { SummaryCards as SummaryCardsType } from '@/types/dashboard';
import { getIconByName, getSolidColorClass } from '@/utils/dashboardIcons';
import DashboardCard from './DashboardCard';

interface SummaryCardsProps {
  summaryCards: SummaryCardsType;
  activeTab: string;
}

const SummaryCards = ({ summaryCards, activeTab }: SummaryCardsProps) => {
  // Determine which cards to show based on active tab
  const getCardsToDisplay = () => {
    switch (activeTab.toLowerCase().replace(' ', '_')) {
      case 'work_request':
        return summaryCards.work_request || [];
      case 'work_order':
        return summaryCards.work_order || [];
      default:
        // Show all cards if no specific tab is selected
        return [...(summaryCards.work_request || []), ...(summaryCards.work_order || [])];
    }
  };

  const cardsToDisplay = getCardsToDisplay();

  if (cardsToDisplay.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No summary data available for {activeTab}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardsToDisplay.map((card, index) => {
        const IconComponent = getIconByName(card.icon);
        const colorClass = getSolidColorClass(card.color);
        
        return (
          <DashboardCard
            key={`${card.label}-${index}`}
            title={card.label}
            value={card.count.toString()}
            icon={
              <div className={`p-3 rounded-full ${colorClass}`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            }
            className="hover:shadow-md transition-shadow"
          />
        );
      })}
    </div>
  );
};

export default SummaryCards; 