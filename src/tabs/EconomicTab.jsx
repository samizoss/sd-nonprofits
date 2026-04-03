import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import InfoTip from '../components/InfoTip';
import { formatNumber, formatCurrency } from '../utils/format';

export default function EconomicTab({ data }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Economic Impact"
        subtitle="The nonprofit sector's contribution to South Dakota's economy"
      />

      {/* Large stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Sector Revenue" value={formatCurrency(data.overview.total_revenue)} large info="Sum of total revenue from most recent Form 990/990-EZ/990-PF filings for all reporting South Dakota nonprofits." />
        <StatCard title="National Benchmark" value="~5.4% of GDP" subtitle="Nonprofit sector nationally (BEA)" large info="Bureau of Economic Analysis NPISH satellite account. This is a national figure — state-level nonprofit GDP contribution data is not published by BEA." />
        <StatCard title="Total Assets" value={formatCurrency(data.overview.total_assets)} large info="Sum of total assets at year-end from most recent filings. Includes cash, investments, property, and other assets reported on Form 990 Part X." />
      </div>

      {/* Two cards: concentration + revenue by tier */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Concentration */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue Concentration<InfoTip text="Shows how many organizations are needed to account for a given percentage of total sector revenue. Organizations are ranked by revenue from largest to smallest." /></h3>
          <div className="space-y-3">
            {data.concentration.map((row, index) => {
              const barWidth = Math.min(row.pct_of_orgs * 3, 100);
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-slate-600 font-medium flex-shrink-0">{row.threshold}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 relative">
                    <div
                      className="bg-[#1b4965] h-6 rounded-full flex items-center px-2"
                      style={{ width: `${barWidth}%`, minWidth: '2.5rem' }}
                    >
                      <span className="text-xs text-white font-medium whitespace-nowrap">
                        {formatNumber(row.orgs_needed)} orgs
                      </span>
                    </div>
                  </div>
                  <span className="w-20 text-sm text-slate-600 text-right flex-shrink-0">
                    {row.pct_of_orgs}% of orgs
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
            Just 5 organizations generate 50% of all nonprofit revenue in South Dakota.
          </div>
        </div>

        {/* Revenue by Organization Size */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue by Organization Size<InfoTip text="Count of organizations in each revenue tier based on total revenue from their most recent Form 990 filing." /></h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.by_revenue_tier} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="count" fill="#c17817" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 italic mt-3">Source: ProPublica Nonprofit Explorer, IRS Form 990</p>
          <p className="text-sm text-slate-600 mt-2">
            The largest organizations (revenue $10M+) drive the vast majority of sector revenue despite representing
            less than 2% of all organizations.
          </p>
        </div>
      </div>

      {/* Advocacy talking points */}
      <div className="bg-[#1b4965] rounded-lg p-6 text-white">
        <h3 className="font-semibold text-lg mb-4">Advocacy Talking Points</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-2">For Policymakers</h4>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li>Nonprofits are among the largest employers and service providers across South Dakota</li>
              <li>Over 8,500 registered nonprofits operating in 383 communities statewide</li>
              <li>36% of organizations serve rural communities with limited alternative providers</li>
              <li>Sector holds {formatCurrency(data.overview.total_assets)} in total assets — a permanent community endowment</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">For Funders</h4>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li>Capacity building in mid-size organizations ($1M-$10M) offers highest leverage</li>
              <li>153 organizations identified as capacity-building ready</li>
              <li>High revenue concentration creates systemic risk — diversifying the base strengthens resilience</li>
              <li>435 organizations show signs of financial stress and may benefit from targeted support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
