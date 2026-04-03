// City population lookup (same as server-side)
const cityPop = {
  'Sioux Falls': 200000, 'Rapid City': 80000, 'Aberdeen': 28000,
  'Brookings': 24000, 'Watertown': 22000, 'Mitchell': 16000,
  'Huron': 14000, 'Pierre': 14000, 'Yankton': 15000,
  'Spearfish': 13000, 'Vermillion': 12000, 'Brandon': 10000,
  'Sturgis': 7000, 'Madison': 7000, 'Belle Fourche': 6000,
  'Hot Springs': 3500, 'Mobridge': 3200, 'Winner': 2900,
  'Chamberlain': 2600, 'Custer': 2500,
};

export function communitySize(city) {
  const pop = cityPop[city?.trim()];
  if (pop == null) return 'Rural (<2.5K)';
  if (pop >= 50000) return 'Urban (50K+)';
  if (pop >= 10000) return 'Mid-Size (10-50K)';
  if (pop >= 2500) return 'Small Town (2.5-10K)';
  return 'Rural (<2.5K)';
}

const NTEE_MAP = {
  A: 'Arts & Culture', B: 'Education',
  C: 'Environment & Animals', D: 'Environment & Animals',
  E: 'Health Care', F: 'Health Care', G: 'Health Care', H: 'Health Care',
  I: 'Human Services', J: 'Human Services', K: 'Human Services', L: 'Human Services',
  M: 'Human Services', N: 'Human Services', O: 'Human Services', P: 'Human Services',
  Q: 'International',
  R: 'Public, Societal Benefit', S: 'Public, Societal Benefit', T: 'Public, Societal Benefit',
  U: 'Public, Societal Benefit', V: 'Public, Societal Benefit', W: 'Public, Societal Benefit',
  X: 'Religion-Related', Y: 'Mutual/Membership Benefit',
};

export function nteeCategory(code) { return (code && NTEE_MAP[code]) || 'Unknown'; }

const SUBSECTION_LABELS = {
  3: ['501(c)(3)', 'Charitable'], 4: ['501(c)(4)', 'Social Welfare'],
  5: ['501(c)(5)', 'Labor/Ag'], 6: ['501(c)(6)', 'Business Leagues'],
  7: ['501(c)(7)', 'Social Clubs'], 8: ['501(c)(8)', 'Fraternal'],
  10: ['501(c)(10)', 'Fraternal Domestic'], 12: ['501(c)(12)', 'Insurance/Co-op'],
  13: ['501(c)(13)', 'Cemetery'], 19: ['501(c)(19)', 'Veterans'],
};
const PRIORITY = new Set([3, 4, 6, 19]);

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function r2(n) { return Math.round(n * 100) / 100; }

export function aggregateData(orgs, baseData) {
  const total_orgs = orgs.length;
  const priority_orgs = orgs.filter(o => PRIORITY.has(o.sub)).length;
  const withFin = orgs.filter(o => o.yr != null);
  const with_financials = withFin.length;
  const no_financials = total_orgs - with_financials;

  const total_revenue = withFin.reduce((s, o) => s + (o.rev || 0), 0);
  const total_assets = withFin.reduce((s, o) => s + (o.ast || 0), 0);
  const total_net_assets = withFin.reduce((s, o) => s + (o.net || 0), 0);

  const citySet = new Set(orgs.map(o => o.ct).filter(Boolean));
  const cities = citySet.size;

  const rural_orgs = orgs.filter(o => communitySize(o.ct) === 'Rural (<2.5K)').length;

  // Top 10% / 50% revenue concentration
  const revsSorted = withFin.map(o => o.rev || 0).sort((a, b) => b - a);
  const top10Count = Math.max(1, Math.ceil(withFin.length * 0.1));
  const top50Count = Math.max(1, Math.ceil(withFin.length * 0.5));
  const top10Rev = revsSorted.slice(0, top10Count).reduce((s, v) => s + v, 0);
  const top50Rev = revsSorted.slice(0, top50Count).reduce((s, v) => s + v, 0);
  const top10_pct = total_revenue > 0 ? r2(top10Rev / total_revenue * 100) : 0;
  const top50_pct = total_revenue > 0 ? r2(top50Rev / total_revenue * 100) : 0;

  // Capacity building ready: 990 filers with rev $100K-$1M
  const capacity_building_ready = withFin.filter(o => o.ft === 0 && o.rev >= 100000 && o.rev <= 1000000).length;
  // Financial stress: expenses > revenue OR negative net assets
  const financial_stress = withFin.filter(o => (o.exp > o.rev) || (o.net != null && o.net < 0)).length;

  const overview = {
    total_orgs, priority_orgs, with_financials, no_financials,
    total_revenue, total_assets, total_net_assets, cities,
    national_nonprofit_gdp_pct: 5.4,
    nonprofit_employment_pct: null, nonprofit_wages: null,
    top10_pct, top50_pct, rural_orgs,
    capacity_building_ready, financial_stress,
  };

  // by_ccode
  const ccodeMap = {};
  for (const o of orgs) {
    const sub = o.sub;
    if (!ccodeMap[sub]) ccodeMap[sub] = { count: 0, revenue: 0 };
    ccodeMap[sub].count++;
    if (o.yr != null) ccodeMap[sub].revenue += (o.rev || 0);
  }
  const by_ccode = Object.entries(ccodeMap)
    .map(([sub, v]) => {
      const s = Number(sub);
      const labels = SUBSECTION_LABELS[s] || [`501(c)(${s})`, `Section ${s}`];
      return { code: labels[0], label: labels[1], count: v.count, revenue: v.revenue, priority: PRIORITY.has(s) };
    })
    .sort((a, b) => b.count - a.count);

  // by_ntee
  const nteeMap = {};
  for (const o of orgs) {
    const cat = nteeCategory(o.nt);
    if (!nteeMap[cat]) nteeMap[cat] = { count: 0, revenue: 0 };
    nteeMap[cat].count++;
    if (o.yr != null) nteeMap[cat].revenue += (o.rev || 0);
  }
  const by_ntee = Object.entries(nteeMap)
    .map(([category, v]) => ({
      category, count: v.count, revenue: v.revenue,
      pct_revenue: total_revenue > 0 ? r2(v.revenue / total_revenue * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // by_community
  const commMap = {};
  for (const o of orgs) {
    const sz = communitySize(o.ct);
    if (!commMap[sz]) commMap[sz] = { count: 0, revenue: 0 };
    commMap[sz].count++;
    if (o.yr != null) commMap[sz].revenue += (o.rev || 0);
  }
  const communityOrder = ['Urban (50K+)', 'Mid-Size (10-50K)', 'Small Town (2.5-10K)', 'Rural (<2.5K)'];
  const by_community = communityOrder
    .filter(sz => commMap[sz])
    .map(sz => ({
      size: sz, count: commMap[sz].count, revenue: commMap[sz].revenue,
      pct_orgs: total_orgs > 0 ? r2(commMap[sz].count / total_orgs * 100) : 0,
      pct_revenue: total_revenue > 0 ? r2(commMap[sz].revenue / total_revenue * 100) : 0,
    }));

  // by_city
  const cityMap = {};
  for (const o of orgs) {
    const c = o.ct || 'Unknown';
    if (!cityMap[c]) cityMap[c] = { count: 0, revenue: 0 };
    cityMap[c].count++;
    if (o.yr != null) cityMap[c].revenue += (o.rev || 0);
  }
  const by_city = Object.entries(cityMap)
    .map(([city, v]) => {
      const sz = communitySize(city);
      const label = sz.split(' ')[0]; // "Urban", "Mid-Size", "Small", "Rural"
      return { city, count: v.count, revenue: v.revenue, community: label };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // by_freshness
  const freshBuckets = { current: 0, recent: 0, older: 0, none: 0 };
  for (const o of orgs) {
    if (o.yr == null) freshBuckets.none++;
    else if (o.yr >= 2023) freshBuckets.current++;
    else if (o.yr >= 2021) freshBuckets.recent++;
    else freshBuckets.older++;
  }
  const by_freshness = [
    { status: 'Current (2023-24)', count: freshBuckets.current, color: '#22c55e' },
    { status: 'Recent (2021-22)', count: freshBuckets.recent, color: '#84cc16' },
    { status: 'Older (2018-20)', count: freshBuckets.older, color: '#eab308' },
    { status: 'No Filing Data', count: freshBuckets.none, color: '#e5e7eb' },
  ].filter(b => b.count > 0);

  // by_revenue_tier
  const tierDefs = [
    { tier: '$10M+', min: 10000000, max: Infinity },
    { tier: '$1M-$10M', min: 1000000, max: 10000000 },
    { tier: '$250K-$1M', min: 250000, max: 1000000 },
    { tier: '$100K-$250K', min: 100000, max: 250000 },
    { tier: '$50K-$100K', min: 50000, max: 100000 },
    { tier: 'Under $50K', min: -Infinity, max: 50000 },
  ];
  const by_revenue_tier = tierDefs.map(({ tier, min, max }) => {
    const match = withFin.filter(o => (o.rev || 0) >= min && (o.rev || 0) < max);
    return { tier, count: match.length, total_revenue: match.reduce((s, o) => s + (o.rev || 0), 0) };
  });

  // by_size_category
  const sizeCats = { large: [], medium: [], established: [], small: [], foundation: [] };
  for (const o of withFin) {
    if (o.ft === 2) sizeCats.foundation.push(o);
    else if (o.ft === 1) sizeCats.small.push(o);
    else if (o.ft === 0) {
      const rev = o.rev || 0;
      if (rev >= 10000000) sizeCats.large.push(o);
      else if (rev >= 1000000) sizeCats.medium.push(o);
      else sizeCats.established.push(o);
    }
  }
  function avgField(arr, field) {
    if (!arr.length) return 0;
    return Math.round(arr.reduce((s, o) => s + (o[field] || 0), 0) / arr.length);
  }
  const by_size_category = [
    { category: 'Large (990, $10M+)', count: sizeCats.large.length, avg_revenue: avgField(sizeCats.large, 'rev'), avg_assets: avgField(sizeCats.large, 'ast') },
    { category: 'Medium (990, $1M-$10M)', count: sizeCats.medium.length, avg_revenue: avgField(sizeCats.medium, 'rev'), avg_assets: avgField(sizeCats.medium, 'ast') },
    { category: 'Established (990, <$1M)', count: sizeCats.established.length, avg_revenue: avgField(sizeCats.established, 'rev'), avg_assets: avgField(sizeCats.established, 'ast') },
    { category: 'Small (990-EZ)', count: sizeCats.small.length, avg_revenue: avgField(sizeCats.small, 'rev'), avg_assets: avgField(sizeCats.small, 'ast') },
    { category: 'Private Foundation', count: sizeCats.foundation.length, avg_revenue: avgField(sizeCats.foundation, 'rev'), avg_assets: avgField(sizeCats.foundation, 'ast') },
  ];

  // concentration
  const thresholds = [0.25, 0.50, 0.75, 0.90, 0.95, 0.99];
  const thresholdLabels = ['25%', '50%', '75%', '90%', '95%', '99%'];
  const concentration = [];
  if (revsSorted.length > 0 && total_revenue > 0) {
    let cumulative = 0;
    let idx = 0;
    for (let t = 0; t < thresholds.length; t++) {
      const target = total_revenue * thresholds[t];
      while (idx < revsSorted.length && cumulative < target) {
        cumulative += revsSorted[idx];
        idx++;
      }
      concentration.push({
        threshold: thresholdLabels[t],
        orgs_needed: idx,
        pct_of_orgs: r2(idx / withFin.length * 100),
      });
    }
  } else {
    for (let t = 0; t < thresholds.length; t++) {
      concentration.push({ threshold: thresholdLabels[t], orgs_needed: 0, pct_of_orgs: 0 });
    }
  }

  // financial_health
  const healthBuckets = { healthy: { count: 0, revenue: 0 }, expGtRev: { count: 0, revenue: 0 }, highDebt: { count: 0, revenue: 0 }, negNet: { count: 0, revenue: 0 } };
  for (const o of withFin) {
    const rev = o.rev || 0;
    const exp = o.exp || 0;
    const net = o.net;
    const lib = o.lib || 0;
    const ast = o.ast || 0;
    if (net != null && net < 0) {
      healthBuckets.negNet.count++; healthBuckets.negNet.revenue += rev;
    } else if (ast > 0 && lib / ast > 0.5) {
      healthBuckets.highDebt.count++; healthBuckets.highDebt.revenue += rev;
    } else if (exp > rev) {
      healthBuckets.expGtRev.count++; healthBuckets.expGtRev.revenue += rev;
    } else {
      healthBuckets.healthy.count++; healthBuckets.healthy.revenue += rev;
    }
  }
  const financial_health = [
    { status: 'Healthy', count: healthBuckets.healthy.count, revenue: healthBuckets.healthy.revenue, color: '#22c55e' },
    { status: 'Expenses > Revenue', count: healthBuckets.expGtRev.count, revenue: healthBuckets.expGtRev.revenue, color: '#f97316' },
    { status: 'High Debt', count: healthBuckets.highDebt.count, revenue: healthBuckets.highDebt.revenue, color: '#ef4444' },
    { status: 'Negative Net Assets', count: healthBuckets.negNet.count, revenue: healthBuckets.negNet.revenue, color: '#dc2626' },
  ];

  // top_orgs
  const top_orgs = [...withFin]
    .sort((a, b) => (b.rev || 0) - (a.rev || 0))
    .slice(0, 10)
    .map(o => ({
      name: o.nm, city: o.ct, type: nteeCategory(o.nt),
      revenue: o.rev || 0, assets: o.ast || 0,
    }));

  // benchmarks
  function benchmarkGroup(arr) {
    if (!arr.length) return { avg_expense_ratio: 0, avg_officer_comp: 0, median_assets: 0 };
    const ratios = arr.filter(o => o.rev > 0).map(o => (o.exp || 0) / o.rev);
    const compRatios = arr.filter(o => o.rev > 0 && o.comp != null).map(o => o.comp / o.rev);
    const assets = arr.map(o => o.ast || 0);
    return {
      avg_expense_ratio: ratios.length > 0 ? r2(ratios.reduce((s, v) => s + v, 0) / ratios.length) : 0,
      avg_officer_comp: compRatios.length > 0 ? r2(compRatios.reduce((s, v) => s + v, 0) / compRatios.length) : 0,
      median_assets: median(assets),
    };
  }
  const benchmarks = {
    large: benchmarkGroup(sizeCats.large),
    medium: benchmarkGroup(sizeCats.medium),
    small: benchmarkGroup([...sizeCats.established, ...sizeCats.small]),
  };

  return {
    last_updated: baseData.last_updated,
    data_source: baseData.data_source,
    overview,
    by_ccode,
    by_ntee,
    by_community,
    by_city,
    by_freshness,
    by_revenue_tier,
    by_size_category,
    concentration,
    financial_health,
    top_orgs,
    benchmarks,
    orgs: baseData.orgs,
  };
}
