// import { StatusCategories, StatusItem } from '@/types/dashboard';
// import { getCardColor } from '@/utils/dashboardIcons';

// interface StatusGridProps {
//   statusCategories: StatusCategories;
//   activeTab: string;
// }

// const StatusGrid = ({ statusCategories, activeTab }: StatusGridProps) => {
//   // Determine which status items to show based on active tab
//   const getStatusItemsToDisplay = (): StatusItem[] => {
//     const tabKey = activeTab.toLowerCase().replace(/ /g, '_') as keyof StatusCategories;
//     return statusCategories[tabKey] || [];
//   };

//   const statusItems = getStatusItemsToDisplay();

//   if (statusItems.length === 0) {
//     return (
//       <div className="text-center py-8 text-gray-500">
//         {t('statusGrid.noData')} {displayTab}
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">
//         {displayTab} {t('statusGrid.overview')}
//       </h3>
      
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//         {statusItems.map((item, index) => {
//           const colorClass = getCardColor(item.label);
          
//           return (
//             <div
//               key={`${item.label}-${index}`}
//               className="flex flex-col items-center p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
//             >
//               <div className={`w-3 h-3 rounded-full ${colorClass} mb-2`}></div>
              
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-gray-800 mb-1">
//                   {item.count}
//                 </p>
//                 <p className="text-xs text-gray-600 text-center leading-tight">
//                   {item.label}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default StatusGrid; 

import { Link } from 'react-router-dom';
import { SummaryCards, SummaryCardItem } from '@/types/dashboard';
import { getIconByName, getColorClasses } from '@/utils/dashboardIcons';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

interface StatusGridProps {
  summaryCards: SummaryCards;
  activeTab: string;
  activeTabLabel?: string;
}

const StatusGrid = ({ summaryCards, activeTab, activeTabLabel }: StatusGridProps) => {
  const displayTab = activeTabLabel ?? activeTab;
  const { t } = useTypedTranslation('dashboard');

  const translateLabel = (label: string): string => {
    const map: Record<string, string> = {
      'New-Awaiting Work Request': t('statusLabels.newAwaiting'),
      'New-Awaiting Review': t('statusLabels.newAwaitingReview'),
      'Approved': t('statusLabels.approved'),
      'Rejected': t('statusLabels.rejected'),
      'Overdue': t('statusLabels.overdue'),
      'Awaiting Approval': t('statusLabels.awaitingApproval'),
      'CP Approved': t('statusLabels.cpApproved'),
      'Reviewed': t('statusLabels.reviewed'),
      'Completed': t('statusLabels.completed'),
      'Requested Payment': t('statusLabels.requestedPayment'),
      'Awaiting Processing': t('statusLabels.awaitingProcessing'),
      'Processed Payment': t('statusLabels.processedPayment'),
      'Open': t('statusLabels.open'),
      'Pending': t('statusLabels.pending'),
      'Part Paid': t('statusLabels.partPaid'),
    };
    return map[label] ?? label;
  };

  // Determine which status items to show based on active tab
  const getStatusItemsToDisplay = (): SummaryCardItem[] => {
    const tabKey = activeTab.toLowerCase().replace(/ /g, '_') as keyof SummaryCards;
    
    // Handle different tab name variations
    let key = tabKey;
    if (activeTab === 'WORK REQUEST') key = 'work_request';
    else if (activeTab === 'WORK ORDER') key = 'work_order';
    else if (activeTab === 'WORK COMPLETION' || activeTab === 'WORK COMPLETION CERTIFICATE') key = 'work_completion';
    else if (activeTab === 'INVOICES') key = 'invoices';
    else if (activeTab === 'PAYMENT REQUISITION') key = 'payment_requisition';
    
    return summaryCards[key] || [];
  };

  // Get the route with filters based on active tab and card label
  const getRouteForCard = (tab: string, label: string) => {
    let basePath = '/dashboard';
    let filterParam = '';

    // Determine base path
    switch (tab) {
      case 'WORK REQUEST':
        basePath = '/dashboard/work/requests';
        break;
      case 'WORK ORDER':
        basePath = '/dashboard/work/orders';
        break;
      case 'WORK COMPLETION':
      case 'WORK COMPLETION CERTIFICATE':
        basePath = '/dashboard/work/work-order-completions';
        break;
      case 'INVOICES':
        basePath = '/dashboard/work/invoice-items';
        break;
      case 'PAYMENT REQUISITION':
        basePath = '/dashboard/work/payment-requisitions';
        break;
      default:
        return basePath;
    }

    // Determine filter based on label
    if (label.includes('New-Awaiting Work Request')) {
      if (tab === 'WORK REQUEST') {
        filterParam = '?approval_status=awaiting';
      } else {
        filterParam = '?approval_status=Pending&is_reviewed=false';
      }
    } else if (label.includes('Awaiting Approval') || label.includes('CP Approved') || label.includes('Reviewed')) {
      if (tab === 'WORK REQUEST') {
        filterParam = `?approval_status=${encodeURIComponent(label)}`;
      } else {
        filterParam = '?approval_status=Pending&is_reviewed=true';
      }
    } else if (label.includes('Approved')) {
      if (tab === 'WORK REQUEST') {
        filterParam = '?approval_status=Fully Approved';
      } else {
        filterParam = '?approval_status=Approved';
      }
    } else if (label.includes('Rejected')) {
      if (tab === 'WORK REQUEST') {
        filterParam = '?approval_status=rejected';
      } else {
        filterParam = '?approval_status=Rejected';
      }
    } else if (label.includes('Overdue')) {
      filterParam = '?due_status=Overdue';
    } else if (label.includes('Completed')) {
      filterParam = '?status=Completed';
    } else if (label.includes('Requested Payment')) {
      filterParam = '?status=Requested';
    } else if (label.includes('Awaiting Processing')) {
      filterParam = '?status=Processing';
    } else if (label.includes('Processed Payment')) {
      filterParam = '?status=Processed';
    }

    return `${basePath}${filterParam}`;
  };

  const statusItems = getStatusItemsToDisplay();

  if (statusItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('statusGrid.noData')} {displayTab}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {displayTab} {t('statusGrid.overview')}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statusItems.map((item, index) => {
          const colorClasses = getColorClasses(item.color);
          const IconComponent = getIconByName(item.icon);
          const route = getRouteForCard(activeTab, item.label);
          const isClickable = item.count > 0;
          
          const cardContent = (
            <div
              className={`flex flex-col items-center p-4 rounded-lg border border-gray-100 transition-shadow ${
                isClickable 
                  ? 'hover:shadow-md cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className={`p-2.5 rounded-full ${colorClasses.bg} mb-3`}>
                <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {item.count}
                </p>
                <p className="text-xs text-gray-600 text-center leading-tight">
                  {translateLabel(item.label)}
                </p>
                {item.amount && item.amount !== "N 0" && (
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    {item.amount}
                  </p>
                )}
              </div>
            </div>
          );

          return isClickable ? (
            <Link
              key={`${item.label}-${index}`}
              to={route}
              className="block group"
            >
              {cardContent}
            </Link>
          ) : (
            <div key={`${item.label}-${index}`}>
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusGrid;