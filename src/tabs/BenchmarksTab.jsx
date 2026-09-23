import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../components/SectionHeader';
import InfoTip from '../components/InfoTip';
import { formatNumber, formatCurrency } from '../utils/format';

function getBenchmarkForCategory(category, benchmarks) {
  if (category === 'Large (990, $10M+)') return benchmarks.large;
  if (category === 'Medium (990, $1M-$10M)') return benchmarks.medium;
  if (category === 'Established (990, <$1M)') return benchmarks.small;
  if (category === 'Small (990-EZ)') return benchmarks.small;
  return null;
}

export default function BenchmarksTab({ data }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Benchmarks by Size"
        subtitle={`Comparative benchmarks across ${data.state_name} nonprofits by size`}
        info="Benchmarks computed from Form 990 filers grouped by revenue size. Averages and medians help organizations compare their financial ratios to peers."
      />

      {/* Bar chart by size category */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Organizations by Size Category<InfoTip text="Size categories based on form type and revenue: 990 filers grouped by revenue tier, 990-EZ filers as 'Small', and 990-PF filers as 'Private Foundation'." /></h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_size_category} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <XAxis dataKey="category" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Bar dataKey="count" fill="#1b4965" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 italic mt-3">Source: IRS Form 990, 990-EZ and 990-PF filings (SOI annual extracts)</p>
      </div>

      {/* Benchmark table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 pb-3">
          <h3 className="font-semibold text-slate-900">Size Category Benchmarks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Size Category</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Count</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Avg Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Avg Assets</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Typical Expense Ratio<InfoTip text="Average of (total functional expenses ÷ total revenue) for organizations in this size category. A ratio under 1.0 means the organization is not spending more than it earns." /></th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Typical Officer Comp %<InfoTip text="Average of (officer compensation ÷ total expenses) for organizations in this category. Higher percentages are typical for smaller organizations with fewer staff." /></th>
              </tr>
            </thead>
            <tbody>
              {data.by_size_category.map((row, i) => {
                const bm = getBenchmarkForCategory(row.category, data.benchmarks);
                return (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{row.category}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatNumber(row.count)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(row.avg_revenue)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(row.avg_assets)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {bm ? bm.avg_expense_ratio.toFixed(2) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {bm ? `${Math.round(bm.avg_officer_comp * 100)}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Use callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-4">How to Use This Data</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="font-medium text-slate-700 mb-2">Understanding These Benchmarks</p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>Compare expense ratios across size tiers</li>
              <li>Officer compensation varies significantly by organization size</li>
              <li>Asset levels reflect organizational maturity and capacity</li>
              <li>Revenue averages provide context for organizational scale</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-2">Applications</p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>Size tier transitions mark organizational growth milestones</li>
              <li>Peer averages inform realistic growth expectations</li>
              <li>Capacity varies significantly within each size tier</li>
              <li>Benchmarks provide context for budget and staffing levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
