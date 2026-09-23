import { useState, useMemo } from 'react';
import SectionHeader from '../components/SectionHeader';
import { formatNumber, formatCurrency } from '../utils/format';
import InfoTip from '../components/InfoTip';

const NTEE_MAP = {
  A: 'Arts & Culture', B: 'Education', C: 'Environment', D: 'Environment',
  E: 'Health Care', F: 'Health Care', G: 'Health Care', H: 'Health Care',
  I: 'Human Services', J: 'Human Services', K: 'Human Services', L: 'Human Services',
  M: 'Human Services', N: 'Human Services', O: 'Human Services', P: 'Human Services',
  Q: 'International', R: 'Public Benefit', S: 'Public Benefit', T: 'Public Benefit',
  U: 'Public Benefit', V: 'Public Benefit', W: 'Public Benefit',
  X: 'Religion', Y: 'Mutual/Membership',
};

const SUBSEC = { 3: '501(c)(3)', 4: '501(c)(4)', 5: '501(c)(5)', 6: '501(c)(6)', 7: '501(c)(7)', 8: '501(c)(8)', 10: '501(c)(10)', 12: '501(c)(12)', 13: '501(c)(13)', 19: '501(c)(19)' };

export default function DirectoryTab({ data }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rev');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const perPage = 25;

  const orgs = data.orgs || [];
  const hasData = orgs.length > 0;

  const filtered = useMemo(() => {
    if (!hasData) return [];
    let result = orgs;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(o =>
        o.nm?.toLowerCase().includes(q) || o.ct?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = a[sortBy] ?? -Infinity;
      const bv = b[sortBy] ?? -Infinity;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return result;
  }, [orgs, search, sortBy, sortDir, hasData]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageOrgs = filtered.slice(page * perPage, (page + 1) * perPage);

  function toggleSort(field) {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  }

  function SortHeader({ field, children, align }) {
    const active = sortBy === field;
    return (
      <th
        className={`py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-900 select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
        onClick={() => { toggleSort(field); setPage(0); }}
      >
        {children} {active ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
      </th>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Organization Directory" subtitle={`Searchable directory of ${data.state_name} nonprofits`} />
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400">
          Directory available when live data is loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Organization Directory"
        subtitle={`Searchable directory of ${data.state_name} nonprofits`}
        info={`All tax-exempt organizations registered in ${data.state_name} from the IRS Business Master File. Financial data from most recent Form 990/990-EZ/990-PF filing.`}
      />

      {/* Search + count */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="w-full sm:w-80 px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b4965]/20 focus:border-[#1b4965]"
        />
        <p className="text-sm text-slate-500">{formatNumber(filtered.length)} organizations</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <SortHeader field="nm">Organization</SortHeader>
                <SortHeader field="ct">City</SortHeader>
                <th className="py-3 px-4 font-medium text-slate-600 text-left">Sector</th>
                <th className="py-3 px-4 font-medium text-slate-600 text-left">Type</th>
                <SortHeader field="rev" align="right">Revenue</SortHeader>
                <SortHeader field="ast" align="right">Assets</SortHeader>
                <SortHeader field="yr" align="right">Filing Year</SortHeader>
              </tr>
            </thead>
            <tbody>
              {pageOrgs.map((org, i) => (
                <tr key={org.ein} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{org.nm}</td>
                  <td className="py-3 px-4 text-slate-600">{org.ct}</td>
                  <td className="py-3 px-4 text-slate-600">{NTEE_MAP[org.nt] || 'Unknown'}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-500">{SUBSEC[org.sub] || `501(c)(${org.sub})`}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900">{org.rev != null ? formatCurrency(org.rev) : '\u2014'}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{org.ast != null ? formatCurrency(org.ast) : '\u2014'}</td>
                  <td className="py-3 px-4 text-right text-slate-500">{org.yr || '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">
              Showing {page * perPage + 1}\u2013{Math.min((page + 1) * perPage, filtered.length)} of {formatNumber(filtered.length)}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 italic">Source: IRS Form 990, 990-EZ and 990-PF filings (SOI annual extracts). Revenue and assets from most recent available filing.</p>
    </div>
  );
}
