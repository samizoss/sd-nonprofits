import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../components/SectionHeader';
import { formatNumber, formatCurrency } from '../utils/format';

export default function GeographyTab({ data }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Geographic Distribution"
        subtitle="Where nonprofits are located across South Dakota"
      />

      {/* Community Size Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.by_community.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">{item.size}</p>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(item.count)}</p>
            <p className="text-sm text-gray-500 mt-1">{item.pct_orgs}% of orgs</p>
            <div className="border-t border-gray-100 mt-3 pt-3">
              <p className="text-sm font-semibold text-gray-800">{formatCurrency(item.revenue)}</p>
              <p className="text-xs text-gray-500">{item.pct_revenue}% of revenue</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two horizontal bar charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 10 Cities by Organization Count */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Top 10 Cities by Organization Count</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.by_city} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
              <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Cities by Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Top 10 Cities by Revenue</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.by_city} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rural Spotlight */}
      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
        <h3 className="font-semibold text-green-900 mb-4">Rural Spotlight</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xl font-bold text-green-900">3,082 rural organizations</p>
            <p className="text-sm text-green-700 mt-1">Serving communities under 2,500 people</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-900">{formatCurrency(881244290)} in revenue</p>
            <p className="text-sm text-green-700 mt-1">5.5% of total sector revenue</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-900">383 cities represented</p>
            <p className="text-sm text-green-700 mt-1">Nonprofits in every corner of SD</p>
          </div>
        </div>
      </div>
    </div>
  );
}
