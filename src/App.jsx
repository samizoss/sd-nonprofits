import { useState, useMemo } from 'react';
import data from '@state-data';
import { formatNumber } from './utils/format';
import { aggregateData, nteeCategory, communitySize } from './utils/aggregate';
import FilterBar from './components/FilterBar';
import OverviewTab from './tabs/OverviewTab';
import EconomicTab from './tabs/EconomicTab';
import SectorsTab from './tabs/SectorsTab';
import GeographyTab from './tabs/GeographyTab';
import HealthTab from './tabs/HealthTab';
import BenchmarksTab from './tabs/BenchmarksTab';
import DirectoryTab from './tabs/DirectoryTab';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'economic', label: 'Economic Impact' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'geography', label: 'Geography' },
  { id: 'health', label: 'Financial Health' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'directory', label: 'Directory' },
];

const tabComponents = {
  overview: OverviewTab,
  economic: EconomicTab,
  sectors: SectorsTab,
  geography: GeographyTab,
  health: HealthTab,
  benchmarks: BenchmarksTab,
  directory: DirectoryTab,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    freshness: 'all',
    excludeHealth: false,
    excludeCongregations: false,
    excludeFoundations: false,
    community: 'all',
    subsection: 'all',
    sector: 'all',
  });

  const filtersEnabled = data.orgs && data.orgs.length > 0;

  const filteredData = useMemo(() => {
    if (!filtersEnabled) return data;

    let orgs = data.orgs;

    // Apply freshness filter
    if (filters.freshness === '2023') {
      orgs = orgs.filter(o => o.yr == null || o.yr >= 2023);
    } else if (filters.freshness === '2022') {
      orgs = orgs.filter(o => o.yr == null || o.yr >= 2022);
    }

    // Apply health system exclusion
    if (filters.excludeHealth) {
      orgs = orgs.filter(o => !('EFGH'.includes(o.nt) && o.rev > 50000000));
    }

    // Apply congregation exclusion (NTEE X + revenue under $250K or no filings)
    if (filters.excludeCongregations) {
      orgs = orgs.filter(o => !(o.nt === 'X' && (o.rev == null || o.rev < 250000)));
    }

    // Apply private foundation exclusion (formtype 2 = 990-PF)
    if (filters.excludeFoundations) {
      orgs = orgs.filter(o => o.ft !== 2);
    }

    // Apply community filter
    if (filters.community !== 'all') {
      orgs = orgs.filter(o => communitySize(o) === filters.community);
    }

    // Apply subsection code filter
    if (filters.subsection !== 'all') {
      const sub = Number(filters.subsection);
      orgs = orgs.filter(o => o.sub === sub);
    }

    // Apply sector filter
    if (filters.sector !== 'all') {
      orgs = orgs.filter(o => nteeCategory(o.nt) === filters.sector);
    }

    return aggregateData(orgs, data);
  }, [filters, filtersEnabled]);

  const ActiveTabComponent = tabComponents[activeTab];
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const years = [...new Set((data.sources?.extracts || []).map(e => e.year))].sort();
  const extractYears = years.length ? `${years[0]}\u2013${years[years.length - 1]}` : null;
  const lastUpdated = new Date(data.last_updated).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Teal accent bar */}
      <div className="h-1 bg-[#1b4965]"></div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{data.state_name} Nonprofit Landscape</h1>
              <p className="text-slate-500 text-sm mt-1">Comprehensive sector analysis from IRS Form 990 filings</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Updated {lastUpdated}</p>
              <p>{formatNumber(data.overview.total_orgs)} organizations</p>
            </div>
          </div>

          {/* Tab navigation — underline style */}
          <nav className="flex gap-6 mt-5 -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#1b4965] text-[#1b4965]'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            disabled={!filtersEnabled}
            orgCount={filteredData.overview.total_orgs}
            totalCount={data.overview?.total_orgs || data.orgs?.length || 0}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <ActiveTabComponent data={filteredData} />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-400">
            <div>
              <p className="font-medium text-slate-500">Data Sources</p>
              <p className="mt-1">
                Organizations: <a className="underline" href={data.sources?.bmf?.url}>IRS Exempt Organizations Business Master File</a>
                {data.sources?.bmf?.last_modified && <> (IRS file dated {fmtDate(data.sources.bmf.last_modified)})</>}
              </p>
              <p className="mt-1">
                Financials: <a className="underline" href="https://www.irs.gov/statistics/soi-tax-stats-annual-extract-of-tax-exempt-organization-financial-data">IRS SOI annual extracts of Form 990, 990-EZ and 990-PF</a>
                {extractYears && <> (returns processed {extractYears})</>}
              </p>
              <p className="mt-1">
                Community size: <a className="underline" href={data.sources?.census?.url}>U.S. Census Bureau {data.sources?.census?.vintage} population estimates</a>
              </p>
              <p className="mt-1">{formatNumber(filteredData.overview.with_financials)} organizations with financial data; most recent filing year {data.latest_tax_year}.</p>
            </div>
            <div className="md:text-right">
              <p className="font-medium text-slate-500">Methodology</p>
              <p className="mt-1">Revenue and asset figures from most recent available filing.</p>
              <p>Organizations filing 990-N (under $50K revenue) excluded from financial analysis.</p>
              <p>Filing year is the year an organization's fiscal year ends.</p>
              <p>Related entities that file separately (e.g., a health system and its group return) are each counted.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
