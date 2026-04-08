import { 
  FilePlus, 
  Clock, 
  Folder, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  DollarSign,
  Calendar,
  HelpCircle,
  FolderOpen,
  File,
  Users,
  TrendingUp,
  BarChart3,
  XCircle
} from 'lucide-react';

// Icon mapping for dashboard cards
export const getIconByName = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'document-plus': FilePlus,
    'file-plus': FilePlus,
    'clock': Clock,
    'folder': Folder,
    'folder-open': FolderOpen,
    'document': FileText,
    'file-text': FileText,
    'file': File,
    'check-circle': CheckCircle,
    'alert-circle': AlertCircle,
    'x-circle': XCircle,
    'exclamation-triangle': AlertTriangle,
    'alert-triangle': AlertTriangle,
    'dollar-sign': DollarSign,
    'calendar': Calendar,
    'users': Users,
    'trending-up': TrendingUp,
    'bar-chart': BarChart3,
  };

  return iconMap[iconName] || HelpCircle; // Default to HelpCircle if icon not found
};

// Color mapping for different card types and statuses
export const getCardColor = (label: string): string => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('new')) return 'bg-blue-500';
  if (lowerLabel.includes('awaiting') || lowerLabel.includes('pending')) return 'bg-yellow-500';
  if (lowerLabel.includes('open')) return 'bg-green-500';
  if (lowerLabel.includes('quotation')) return 'bg-purple-500';
  if (lowerLabel.includes('approved')) return 'bg-emerald-500';
  if (lowerLabel.includes('overdue') || lowerLabel.includes('over-due')) return 'bg-red-500';
  if (lowerLabel.includes('due today')) return 'bg-orange-500';
  if (lowerLabel.includes('paid') || lowerLabel.includes('payment')) return 'bg-indigo-500';
  
  return 'bg-gray-500'; // Default color
};

// Get color classes from color name (light background with colored text)
export const getColorClasses = (color: string): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    'blue': { bg: 'bg-blue-100', text: 'text-blue-600' },
    'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    'green': { bg: 'bg-green-100', text: 'text-green-600' },
    'orange': { bg: 'bg-orange-100', text: 'text-orange-600' },
    'red': { bg: 'bg-red-100', text: 'text-red-600' },
    'purple': { bg: 'bg-purple-100', text: 'text-purple-600' },
    'indigo': { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    'emerald': { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  };

  return colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

// Get solid color classes from color name (solid background with white text)
export const getSolidColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    'blue': 'bg-blue-500',
    'yellow': 'bg-yellow-500',
    'green': 'bg-green-500',
    'orange': 'bg-orange-500',
    'red': 'bg-red-500',
    'purple': 'bg-purple-500',
    'indigo': 'bg-indigo-500',
    'emerald': 'bg-emerald-500',
  };

  return colorMap[color] || 'bg-gray-500';
}; 