import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import InsightCard from '../components/InsightCard';
import { formatNumber, formatCurrency } from '../utils/format';

export default function OverviewTab({ data }) {
  const ccodeSix = data.by_ccode.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Organizations" value={formatNumber(data.overview.total_orgs)} />
        <StatCard title="Priority Orgs" value={formatNumber(data.overview.priority_orgs)} subtitle="c3, c4, c6, c19" />
        <StatCard title="Total Revenue" value={formatCurrency(data.overview.total_revenue)} />
        <StatCard title="Total Assets" value={formatCurrency(data.overview.total_assets)} />
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InsightCard
          title="National Benchmark"
          value={`~${data.overview.national_nonprofit_gdp_pct}% of GDP`}
          description="Nonprofit sector nationally (BEA)"
          color="blue"
        />
        <InsightCard
          title="Rural Presence"
          value={formatNumber(data.overview.rural_orgs)}
          description="36% of orgs serve rural communities"
          color="green"
        />
        <InsightCard
          title="Revenue Concentration"
          value={`Top 10 = ${data.overview.top10_pct}%`}
          description="High concentration in largest orgs"
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Organizations by Type */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Organizations by Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ccodeSix} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
              <YAxis type="category" dataKey="code" width={85} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="count">
                {ccodeSix.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.priority ? '#1b4965' : '#94a3b8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 italic mt-3">Source: ProPublica Nonprofit Explorer, IRS Form 990</p>
          {/* Legend */}
          <div className="flex gap-4 mt-3 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#1b4965]"></div>
              <span>Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-400"></div>
              <span>Other</span>
            </div>
          </div>
        </div>

        {/* Data Freshness */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Data Freshness</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.by_freshness}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={100}
              >
                {data.by_freshness.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 italic mt-3">Source: ProPublica Nonprofit Explorer, IRS Form 990</p>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-sm text-slate-600">
            {data.by_freshness.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                <span>{entry.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data quality note */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-[#c17817] rounded-lg p-4 text-sm text-slate-700">
        <strong>Data Quality Note:</strong> {formatNumber(data.overview.no_financials)} organizations (80%) have no
        detailed financial data because they file Form 990-N (e-Postcard).
      </div>
    </div>
  );
}
