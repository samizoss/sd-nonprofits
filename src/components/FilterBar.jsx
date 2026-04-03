const FRESHNESS_OPTIONS = [
  { value: 'all', label: 'All Filing Years' },
  { value: '2022', label: '2022 or newer' },
  { value: '2023', label: '2023 or newer' },
];

const COMMUNITY_OPTIONS = [
  { value: 'all', label: 'All Communities' },
  { value: 'Urban (50K+)', label: 'Urban (50K+)' },
  { value: 'Mid-Size (10-50K)', label: 'Mid-Size (10-50K)' },
  { value: 'Small Town (2.5-10K)', label: 'Small Town (2.5-10K)' },
  { value: 'Rural (<2.5K)', label: 'Rural (<2.5K)' },
];

const SUBSECTION_OPTIONS = [
  { value: 'all', label: 'All 501(c) Types' },
  { value: '3', label: '501(c)(3) Charitable' },
  { value: '4', label: '501(c)(4) Social Welfare' },
  { value: '5', label: '501(c)(5) Labor/Ag' },
  { value: '6', label: '501(c)(6) Business Leagues' },
  { value: '7', label: '501(c)(7) Social Clubs' },
  { value: '8', label: '501(c)(8) Fraternal' },
  { value: '10', label: '501(c)(10) Fraternal Domestic' },
  { value: '12', label: '501(c)(12) Insurance/Co-op' },
  { value: '13', label: '501(c)(13) Cemetery' },
  { value: '19', label: '501(c)(19) Veterans' },
];

const SECTOR_OPTIONS = [
  { value: 'all', label: 'All Sectors' },
  { value: 'Arts & Culture', label: 'Arts & Culture' },
  { value: 'Education', label: 'Education' },
  { value: 'Environment & Animals', label: 'Environment & Animals' },
  { value: 'Health Care', label: 'Health Care' },
  { value: 'Human Services', label: 'Human Services' },
  { value: 'International', label: 'International' },
  { value: 'Public, Societal Benefit', label: 'Public, Societal Benefit' },
  { value: 'Religion-Related', label: 'Religion-Related' },
  { value: 'Mutual/Membership Benefit', label: 'Mutual/Membership Benefit' },
  { value: 'Unknown', label: 'Unknown' },
];

function SelectFilter({ value, onChange, options, disabled }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="text-sm border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#1b4965] focus:border-[#1b4965]"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function FilterBar({ filters, setFilters, disabled, orgCount, totalCount }) {
  const activeCount = [
    filters.freshness !== 'all',
    filters.excludeHealth,
    filters.excludeCongregations,
    filters.excludeFoundations,
    filters.community !== 'all',
    filters.sector !== 'all',
    filters.subsection !== 'all',
  ].filter(Boolean).length;

  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  if (disabled) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400 italic">
        Filters available when live data is loaded
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <SelectFilter
          value={filters.freshness}
          onChange={v => update('freshness', v)}
          options={FRESHNESS_OPTIONS}
          disabled={disabled}
        />
        <SelectFilter
          value={filters.subsection}
          onChange={v => update('subsection', v)}
          options={SUBSECTION_OPTIONS}
          disabled={disabled}
        />
        <SelectFilter
          value={filters.sector}
          onChange={v => update('sector', v)}
          options={SECTOR_OPTIONS}
          disabled={disabled}
        />
        <SelectFilter
          value={filters.community}
          onChange={v => update('community', v)}
          options={COMMUNITY_OPTIONS}
          disabled={disabled}
        />
        <span className="ml-auto text-xs text-slate-400">
          {activeCount > 0 ? (
            <>{orgCount.toLocaleString()} of {totalCount.toLocaleString()} orgs shown</>
          ) : (
            <>{orgCount.toLocaleString()} organizations</>
          )}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Exclude:</span>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.excludeHealth}
            onChange={e => update('excludeHealth', e.target.checked)}
            disabled={disabled}
            className="rounded border-slate-300 text-[#1b4965] focus:ring-[#1b4965] disabled:opacity-40"
          />
          Large health systems
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.excludeCongregations}
            onChange={e => update('excludeCongregations', e.target.checked)}
            disabled={disabled}
            className="rounded border-slate-300 text-[#1b4965] focus:ring-[#1b4965] disabled:opacity-40"
          />
          Small congregations
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.excludeFoundations}
            onChange={e => update('excludeFoundations', e.target.checked)}
            disabled={disabled}
            className="rounded border-slate-300 text-[#1b4965] focus:ring-[#1b4965] disabled:opacity-40"
          />
          Private foundations
        </label>
      </div>
    </div>
  );
}
