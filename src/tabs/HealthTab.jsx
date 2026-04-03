import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../components/SectionHeader';
import { formatNumber, formatCurrency } from '../utils/format';

export default function HealthTab({ data }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Financial Health"
        subtitle="Assessing the fiscal stability of SD nonprofits"
      />

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.financial_health.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-600">{item.status}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(item.count)}</p>
            <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.revenue)}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Health Distribution pie */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Health Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.financial_health} dataKey="count" nameKey="status" outerRadius={80}>
                {data.financial_health.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
            {data.financial_health.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                <span>{entry.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Financial Health Indicators</h3>
          <div className="space-y-5">
            {/* Expense Ratio */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Expense Ratio</span>
                <span className="text-gray-500">74%</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">Orgs spending within revenue</p>
              <div className="bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '74%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">74% of orgs have expenses below revenue</p>
            </div>
            {/* Positive Net Assets */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Positive Net Assets</span>
                <span className="text-gray-500">95%</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">Orgs with positive balance sheet</p>
              <div className="bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '95%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">95% of orgs report positive net assets</p>
            </div>
            {/* Low Debt Burden */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Low Debt Burden</span>
                <span className="text-gray-500">87%</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">Orgs with manageable liabilities</p>
              <div className="bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">87% of orgs have low debt-to-asset ratios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stress signals callout */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-800 mb-1">Financial Stress Signals</h3>
        <p className="text-sm text-red-700 mb-4">
          {formatNumber(data.overview.financial_stress)} organizations show one or more financial stress indicators
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-red-600">312</p>
            <p className="text-sm text-gray-600 mt-0.5">Expenses &gt; Revenue</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-red-600">45</p>
            <p className="text-sm text-gray-600 mt-0.5">High Debt</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-red-600">78</p>
            <p className="text-sm text-gray-600 mt-0.5">Negative Net Assets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
