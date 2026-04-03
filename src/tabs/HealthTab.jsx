import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../components/SectionHeader';
import InfoTip from '../components/InfoTip';
import { formatNumber, formatCurrency } from '../utils/format';

export default function HealthTab({ data }) {
  const expensesExceedCount = data.financial_health.find(h => h.status === 'Expenses > Revenue')?.count || 0;
  const negativeNetCount = data.financial_health.find(h => h.status === 'Negative Net Assets')?.count || 0;
  const highDebtCount = data.financial_health.find(h => h.status === 'High Debt')?.count || 0;
  const withFinancials = data.overview.with_financials || 1;
  const expenseRatioPct = 100 - Math.round((expensesExceedCount / withFinancials) * 100);
  const positiveNetPct = 100 - Math.round((negativeNetCount / withFinancials) * 100);
  const lowDebtPct = 100 - Math.round((highDebtCount / withFinancials) * 100);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Financial Health"
        subtitle="Assessing the fiscal stability of SD nonprofits"
        info="Financial health indicators computed from Form 990 data. Only includes organizations with available financial filings (990 or 990-EZ)."
      />

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.financial_health.map((item, i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-slate-600">{item.status}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatNumber(item.count)}</p>
            <p className="text-sm text-slate-400 mt-1">{formatCurrency(item.revenue)}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Health Distribution pie */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Health Distribution<InfoTip text="Classification based on: expense-to-revenue ratio, net asset position, and debt-to-asset ratio from most recent filing." /></h3>
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
          <p className="text-xs text-slate-400 italic mt-3">Source: ProPublica Nonprofit Explorer, IRS Form 990</p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-slate-600">
            {data.financial_health.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                <span>{entry.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Financial Health Indicators<InfoTip text="Percentage of reporting organizations meeting each health threshold. Based on Form 990 Part I (revenue/expenses) and Part X (assets/liabilities)." /></h3>
          <div className="space-y-5">
            {/* Expense Ratio */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">Expense Ratio<InfoTip text="Percentage of organizations where total functional expenses (Form 990 Part IX) do not exceed total revenue (Part I, Line 12)." /></span>
                <span className="text-slate-400">{expenseRatioPct}%</span>
              </div>
              <p className="text-xs text-slate-400 mb-1">Orgs spending within revenue</p>
              <div className="bg-slate-100 rounded-full h-3">
                <div className="bg-[#2d8659] h-3 rounded-full" style={{ width: `${expenseRatioPct}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{expenseRatioPct}% of orgs have expenses below revenue</p>
            </div>
            {/* Positive Net Assets */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">Positive Net Assets<InfoTip text="Percentage of organizations where total net assets (Part X, Line 32) are greater than zero." /></span>
                <span className="text-slate-400">{positiveNetPct}%</span>
              </div>
              <p className="text-xs text-slate-400 mb-1">Orgs with positive balance sheet</p>
              <div className="bg-slate-100 rounded-full h-3">
                <div className="bg-[#2d8659] h-3 rounded-full" style={{ width: `${positiveNetPct}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{positiveNetPct}% of orgs report positive net assets</p>
            </div>
            {/* Low Debt Burden */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">Low Debt Burden<InfoTip text="Percentage of organizations where total liabilities (Part X, Line 26) are less than 80% of total assets." /></span>
                <span className="text-slate-400">{lowDebtPct}%</span>
              </div>
              <p className="text-xs text-slate-400 mb-1">Orgs with manageable liabilities</p>
              <div className="bg-slate-100 rounded-full h-3">
                <div className="bg-[#2d8659] h-3 rounded-full" style={{ width: `${lowDebtPct}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{lowDebtPct}% of orgs have low debt-to-asset ratios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stress signals callout */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-[#b91c1c] rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-1">Financial Stress Signals</h3>
        <p className="text-sm text-slate-600 mb-4">
          {formatNumber(data.overview.financial_stress)} organizations show one or more financial stress indicators
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-2xl font-bold text-[#b91c1c]">{formatNumber(data.financial_health.find(h => h.status === 'Expenses > Revenue')?.count || 0)}</p>
            <p className="text-sm text-slate-600 mt-0.5">Expenses &gt; Revenue</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-2xl font-bold text-[#b91c1c]">{formatNumber(data.financial_health.find(h => h.status === 'High Debt')?.count || 0)}</p>
            <p className="text-sm text-slate-600 mt-0.5">High Debt</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-2xl font-bold text-[#b91c1c]">{formatNumber(data.financial_health.find(h => h.status === 'Negative Net Assets')?.count || 0)}</p>
            <p className="text-sm text-slate-600 mt-0.5">Negative Net Assets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
