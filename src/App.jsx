import { useState } from 'react';
import data from './data/dashboard-data.json';
import { formatNumber } from './utils/format';
import OverviewTab from './tabs/OverviewTab';
import EconomicTab from './tabs/EconomicTab';
import SectorsTab from './tabs/SectorsTab';
import GeographyTab from './tabs/GeographyTab';
import HealthTab from './tabs/HealthTab';
import BenchmarksTab from './tabs/BenchmarksTab';
import ProspectsTab from './tabs/ProspectsTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'economic', label: 'Economic Impact', icon: '💰' },
  { id: 'sectors', label: 'Sectors', icon: '🏛️' },
  { id: 'geography', label: 'Geography', icon: '🗺️' },
  { id: 'health', label: 'Financial Health', icon: '❤️' },
  { id: 'benchmarks', label: 'Benchmarks', icon: '📈' },
  { id: 'prospects', label: 'Prospects', icon: '🎯' },
];

const tabComponents = {
  overview: OverviewTab,
  economic: EconomicTab,
  sectors: SectorsTab,
  geography: GeographyTab,
  health: HealthTab,
  benchmarks: BenchmarksTab,
  prospects: ProspectsTab,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const ActiveTabComponent = tabComponents[activeTab];
  const lastUpdated = new Date(data.last_updated).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">South Dakota Nonprofit Landscape</h1>
              <p className="text-gray-500 mt-1">Comprehensive sector analysis • Data from ProPublica Nonprofit Explorer</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Last updated: {lastUpdated}</p>
              <p>{formatNumber(data.overview.total_orgs)} organizations</p>
            </div>
          </div>
          <div className="flex gap-1 mt-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <ActiveTabComponent data={data} />
      </div>

      <div className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-8 py-6 text-center text-sm text-gray-400">
          <p>Data source: {data.data_source}</p>
          <p className="mt-1">Most recent filings: 2023-2024 • {formatNumber(data.overview.with_financials)} orgs with detailed financial data</p>
        </div>
      </div>
    </div>
  );
}
