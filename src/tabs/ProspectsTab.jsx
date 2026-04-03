import InsightCard from '../components/InsightCard';
import SectionHeader from '../components/SectionHeader';
import { formatNumber, formatCurrency } from '../utils/format';

export default function ProspectsTab({ data }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Membership Prospects"
        subtitle="Organizations with highest engagement potential"
      />

      {/* Insight cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InsightCard
          title="Top Prospects"
          value="500+"
          description="Organizations with high engagement potential based on size, data freshness, and financial health"
          color="blue"
          info="Organizations scoring highest on a composite index of revenue size, form type, data freshness, priority classification, filing history, and financial health."
        />
        <InsightCard
          title="Capacity Building Ready"
          value={formatNumber(data.overview.capacity_building_ready)}
          description="Organizations ready to grow with targeted support and resources"
          color="green"
          info="Organizations filing Form 990-EZ with annual revenue of $75,000 or more and healthy financials (expenses within revenue). These are poised for growth with targeted support."
        />
        <InsightCard
          title="Large Institutions"
          value="124"
          description="Major organizations with $10M+ in revenue — anchor members and strategic partners"
          color="purple"
          info="Organizations reporting total annual revenue of $10 million or more on their most recent Form 990."
        />
      </div>

      {/* Top 10 orgs table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 pb-3">
          <h3 className="font-semibold text-slate-900">Top Organizations by Revenue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Organization</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">City</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Assets</th>
              </tr>
            </thead>
            <tbody>
              {data.top_orgs.map((org, i) => (
                <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{org.name}</td>
                  <td className="py-3 px-4 text-slate-600">{org.city}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block bg-[#1b4965]/10 text-[#1b4965] text-xs font-medium px-2 py-0.5 rounded-full">
                      {org.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(org.revenue)}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(org.assets)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Callout cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Capacity Building Targets */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-[#2d8659] rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Capacity Building Targets</h3>
          <p className="text-sm text-slate-600 mb-3">
            {formatNumber(data.overview.capacity_building_ready)} organizations identified as capacity building ready — healthy 990-EZ filers with growth potential and demonstrated community presence.
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Recent filings with consistent revenue growth</li>
            <li>Positive net assets and low debt burden</li>
            <li>Active in underserved or rural communities</li>
            <li>Strong mission alignment with association priorities</li>
          </ul>
        </div>

        {/* Prospect Scoring Methodology */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Prospect Scoring Methodology</h3>
          <p className="text-sm text-slate-600 mb-3">
            Each organization is scored out of 100 points across six dimensions:
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li><span className="font-medium">Revenue</span> — 25 pts</li>
            <li><span className="font-medium">Form type</span> — 20 pts</li>
            <li><span className="font-medium">Data freshness</span> — 20 pts</li>
            <li><span className="font-medium">Priority tier</span> — 15 pts</li>
            <li><span className="font-medium">Filing history</span> — 10 pts</li>
            <li><span className="font-medium">Financial health</span> — 10 pts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
