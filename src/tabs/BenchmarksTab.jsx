import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../components/SectionHeader';
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
        subtitle="How does your organization compare to peers?"
      />

      {/* Bar chart by size category */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Organizations by Size Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_size_category} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <XAxis dataKey="category" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 pb-3">
          <h3 className="font-semibold text-gray-900">Size Category Benchmarks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Size Category</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Count</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Avg Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Avg Assets</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Typical Expense Ratio</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Typical Officer Comp %</th>
              </tr>
            </thead>
            <tbody>
              {data.by_size_category.map((row, i) => {
                const bm = getBenchmarkForCategory(row.category, data.benchmarks);
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.category}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatNumber(row.count)}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(row.avg_revenue)}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(row.avg_assets)}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {bm ? bm.avg_expense_ratio.toFixed(2) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 mb-4">How to Use This Data</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="font-medium text-blue-700 mb-2">For Board Reports</p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Compare your expense ratio to peers in the same size tier</li>
              <li>• Benchmark officer compensation against typical ranges</li>
              <li>• Track asset growth relative to average for your category</li>
              <li>• Use revenue averages to contextualize your position</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-700 mb-2">For Strategic Planning</p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Identify size tier transitions as milestones</li>
              <li>• Set realistic revenue targets based on peer averages</li>
              <li>• Assess capacity relative to others in your category</li>
              <li>• Use benchmarks to justify budget and staffing decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
