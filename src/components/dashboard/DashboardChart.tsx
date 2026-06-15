import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartData } from '@/types/dashboard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartProps {
  chartData: ChartData;
}

const DashboardChart = ({ chartData }: DashboardChartProps) => {
  const { t } = useTypedTranslation('dashboard');

  const translateDatasetLabel = (label: string): string => {
    const map: Record<string, string> = {
      'Work Requests': t('chart.datasetLabels.workRequests'),
      'Work Orders': t('chart.datasetLabels.workOrders'),
    };
    return map[label] ?? label;
  };

  // Convert the API chart data to Chart.js format
  const data = {
    labels: chartData.labels || [],
    datasets: chartData.datasets.map((dataset) => ({
      label: translateDatasetLabel(dataset.label),
      data: dataset.data,
      backgroundColor: dataset.backgroundColor,
      borderColor: dataset.backgroundColor,
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        }
      },
      title: {
        display: true,
        text: t('chart.monthlyTrends'),
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 30
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      }
    }
  };

  if (!chartData.labels?.length || !chartData.datasets?.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{t('chart.noData')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default DashboardChart; 