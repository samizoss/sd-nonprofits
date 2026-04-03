import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../components/SectionHeader';
import { formatNumber, formatCurrency } from '../utils/format';

export default function SectorsTab({ data }) {
  const nteeData = data.by_ntee.slice(0, 8);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sector Analysis"
        subtitle="Breakdown by organization type and mission area"
      />

      {/* Two horizontal bar charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by NTEE Category */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue by NTEE Category</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={nteeData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#1b4965" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 italic mt-3">Source: ProPublica Nonprofit Explorer, IRS Form 990</p>
        </div>

        {/* Organization Count by Category */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Organization Count by Category</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={nteeData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
              <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="count" fill="#5b8c9e" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 italic mt-3">Source: ProPublica Nonprofit Explorer, IRS Form 990</p>
        </div>
      </div>

      {/* Sector Insights */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Sector Insights</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-white border border-slate-200 border-l-4 border-l-[#b91c1c] rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 mb-1">Health Care Dominance</p>
            <p className="text-2xl font-bold text-slate-900">78.3%</p>
            <p className="text-sm text-slate-600 mt-1">of total sector revenue</p>
            <p className="text-xs text-slate-400 mt-2">Driven by large systems like Sanford & Avera</p>
          </div>
          <div className="bg-white border border-slate-200 border-l-4 border-l-[#1b4965] rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 mb-1">Religion-Related</p>
            <p className="text-2xl font-bold text-slate-900">1,891</p>
            <p className="text-sm text-slate-600 mt-1">organizations (most by count)</p>
            <p className="text-xs text-slate-400 mt-2">Predominantly small congregations</p>
          </div>
          <div className="bg-white border border-slate-200 border-l-4 border-l-[#2d8659] rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 mb-1">Human Services</p>
            <p className="text-2xl font-bold text-slate-900">1,456</p>
            <p className="text-sm text-slate-600 mt-1">organizations</p>
            <p className="text-xs text-slate-400 mt-2">Critical for social safety net</p>
          </div>
        </div>
      </div>

      {/* 501(c) Type Table */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">501(c) Type Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Count</th>
                <th className="py-3 px-4 font-medium">Revenue</th>
                <th className="py-3 px-4 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.by_ccode.map((row, i) => (
                <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-900">{row.code}</td>
                  <td className="py-3 px-4 text-slate-600">{row.label}</td>
                  <td className="py-3 px-4 text-slate-900">{formatNumber(row.count)}</td>
                  <td className="py-3 px-4 text-slate-900">{formatCurrency(row.revenue)}</td>
                  <td className="py-3 px-4">
                    {row.priority ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#1b4965]/10 text-[#1b4965]">Priority</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Other</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
