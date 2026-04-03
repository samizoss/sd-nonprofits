import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const ORGS_FILE = 'raw/orgs.json';
const FINANCIALS_FILE = 'raw/financials.json';
const OUTPUT = 'src/data/dashboard-data.json';

// --- Mappings ---

const SUBSECTION_LABELS = {
  3:  '501(c)(3) Charitable',
  4:  '501(c)(4) Social Welfare',
  5:  '501(c)(5) Labor/Ag',
  6:  '501(c)(6) Business Leagues',
  7:  '501(c)(7) Social Clubs',
  8:  '501(c)(8) Fraternal',
  10: '501(c)(10) Fraternal Domestic',
  12: '501(c)(12) Insurance/Co-op',
  13: '501(c)(13) Cemetery',
  19: '501(c)(19) Veterans',
};

const PRIORITY_CODES = new Set([3, 4, 6, 19]);

function nteeCategory(nteeCode) {
  if (!nteeCode) return 'Unknown';
  const ch = nteeCode.charAt(0).toUpperCase();
  if (ch === 'A') return 'Arts & Culture';
  if (ch === 'B') return 'Education';
  if ('CD'.includes(ch)) return 'Environment & Animals';
  if ('EFGH'.includes(ch)) return 'Health Care';
  if ('IJKLMNOP'.includes(ch)) return 'Human Services';
  if (ch === 'Q') return 'International';
  if ('RSTUVW'.includes(ch)) return 'Public, Societal Benefit';
  if (ch === 'X') return 'Religion-Related';
  if (ch === 'Y') return 'Mutual/Membership Benefit';
  return 'Unknown';
}

const cityPopulations = {
  'Sioux Falls': 200000, 'Rapid City': 80000, 'Aberdeen': 28000,
  'Brookings': 24000, 'Watertown': 22000, 'Mitchell': 16000,
  'Huron': 14000, 'Pierre': 14000, 'Yankton': 15000,
  'Spearfish': 13000, 'Vermillion': 12000, 'Brandon': 10000,
  'Sturgis': 7000, 'Madison': 7000, 'Belle Fourche': 6000,
  'Hot Springs': 3500, 'Mobridge': 3200, 'Winner': 2900,
  'Chamberlain': 2600, 'Custer': 2500,
};

function communitySize(city) {
  const pop = cityPopulations[city?.trim()];
  if (pop == null) return 'Rural (<2.5K)';
  if (pop >= 50000) return 'Urban (50K+)';
  if (pop >= 10000) return 'Mid-Size (10-50K)';
  if (pop >= 2500) return 'Small Town (2.5-10K)';
  return 'Rural (<2.5K)';
}

function getLatestFiling(filings) {
  if (!filings || filings.length === 0) return null;
  return filings.reduce((best, f) => (f.tax_prd_yr > best.tax_prd_yr ? f : best), filings[0]);
}

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// --- Main ---

function main() {
  if (!existsSync(ORGS_FILE)) {
    console.error(`${ORGS_FILE} not found. Run fetch-orgs.js first.`);
    process.exit(1);
  }
  if (!existsSync(FINANCIALS_FILE)) {
    console.error(`${FINANCIALS_FILE} not found. Run fetch-financials.js first.`);
    process.exit(1);
  }

  const orgsData = JSON.parse(readFileSync(ORGS_FILE, 'utf-8'));
  const financialsData = JSON.parse(readFileSync(FINANCIALS_FILE, 'utf-8'));

  const allOrgs = orgsData.organizations;
  const financialsMap = financialsData.organizations; // keyed by EIN

  console.log(`Processing ${allOrgs.length} orgs, ${Object.keys(financialsMap).length} with financial details...`);

  // Build enriched org list: merge base org data with financials
  const enriched = allOrgs.map(org => {
    const fin = financialsMap[String(org.ein)];
    const latest = fin ? getLatestFiling(fin.filings) : null;
    return {
      ein: org.ein,
      name: fin?.name || org.name,
      city: (fin?.city || org.city || '').trim(),
      state: fin?.state || org.state,
      ntee_code: fin?.ntee_code || org.ntee_code,
      subseccd: fin?.subseccd ?? org.subseccd,
      hasFinancials: !!latest,
      latest,
      filings: fin?.filings || [],
    };
  });

  // --- Overview ---
  const totalOrgs = enriched.length;
  const priorityOrgs = enriched.filter(o => PRIORITY_CODES.has(o.subseccd)).length;
  const withFinancials = enriched.filter(o => o.hasFinancials).length;
  const noFinancials = totalOrgs - withFinancials;

  const orgsWithRevenue = enriched.filter(o => o.latest && o.latest.totrevenue != null);
  const totalRevenue = orgsWithRevenue.reduce((s, o) => s + (o.latest.totrevenue || 0), 0);
  const totalAssets = enriched.filter(o => o.latest?.totassetsend != null).reduce((s, o) => s + o.latest.totassetsend, 0);
  const totalNetAssets = enriched.filter(o => o.latest?.totnetassetend != null).reduce((s, o) => s + o.latest.totnetassetend, 0);

  const cities = new Set(enriched.map(o => o.city).filter(Boolean));

  // Top 10/50 pct
  const sortedByRev = orgsWithRevenue.map(o => o.latest.totrevenue).sort((a, b) => b - a);
  const top10Rev = sortedByRev.slice(0, 10).reduce((s, v) => s + v, 0);
  const top50Rev = sortedByRev.slice(0, 50).reduce((s, v) => s + v, 0);
  const top10Pct = totalRevenue > 0 ? round2(top10Rev / totalRevenue * 100) : 0;
  const top50Pct = totalRevenue > 0 ? round2(top50Rev / totalRevenue * 100) : 0;

  // Rural orgs
  const ruralOrgs = enriched.filter(o => communitySize(o.city) === 'Rural (<2.5K)').length;

  // Capacity building ready: 990-EZ filers with revenue >= 75000 and healthy
  const capacityBuildingReady = enriched.filter(o => {
    if (!o.latest) return false;
    if (o.latest.formtype !== 1) return false; // 990-EZ
    const rev = o.latest.totrevenue;
    const exp = o.latest.totfuncexpns;
    if (rev == null || rev < 75000) return false;
    if (exp != null && exp > rev) return false; // not healthy
    return true;
  }).length;

  // Financial stress
  const financialStress = enriched.filter(o => {
    if (!o.latest) return false;
    const { totrevenue, totfuncexpns, totnetassetend, totliabend, totassetsend } = o.latest;
    if (totfuncexpns != null && totrevenue != null && totfuncexpns > totrevenue) return true;
    if (totnetassetend != null && totnetassetend < 0) return true;
    if (totliabend != null && totassetsend != null && totassetsend > 0 && totliabend > 0.8 * totassetsend) return true;
    return false;
  }).length;

  const overview = {
    total_orgs: totalOrgs,
    priority_orgs: priorityOrgs,
    with_financials: withFinancials,
    no_financials: noFinancials,
    total_revenue: totalRevenue,
    total_assets: totalAssets,
    total_net_assets: totalNetAssets,
    cities: cities.size,
    national_nonprofit_gdp_pct: 5.4,
    nonprofit_employment_pct: null,
    nonprofit_wages: null,
    top10_pct: top10Pct,
    top50_pct: top50Pct,
    rural_orgs: ruralOrgs,
    capacity_building_ready: capacityBuildingReady,
    financial_stress: financialStress,
  };

  // --- by_ccode ---
  const ccodeMap = {};
  for (const o of enriched) {
    const code = o.subseccd;
    if (code == null) continue;
    if (!ccodeMap[code]) ccodeMap[code] = { count: 0, revenue: 0 };
    ccodeMap[code].count++;
    if (o.latest?.totrevenue != null) ccodeMap[code].revenue += o.latest.totrevenue;
  }
  const byCcode = Object.entries(ccodeMap)
    .filter(([code]) => SUBSECTION_LABELS[code])
    .map(([code, data]) => {
      const label = SUBSECTION_LABELS[code];
      const [codeStr, ...rest] = label.split(' ');
      return {
        code: codeStr,
        label: rest.join(' '),
        count: data.count,
        revenue: data.revenue,
        priority: PRIORITY_CODES.has(Number(code)),
      };
    })
    .sort((a, b) => b.count - a.count);

  // --- by_ntee ---
  const nteeMap = {};
  for (const o of enriched) {
    const cat = nteeCategory(o.ntee_code);
    if (!nteeMap[cat]) nteeMap[cat] = { count: 0, revenue: 0 };
    nteeMap[cat].count++;
    if (o.latest?.totrevenue != null) nteeMap[cat].revenue += o.latest.totrevenue;
  }
  const byNtee = Object.entries(nteeMap)
    .map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue,
      pct_revenue: totalRevenue > 0 ? round2(data.revenue / totalRevenue * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // --- by_community ---
  const communityMap = {};
  for (const o of enriched) {
    const size = communitySize(o.city);
    if (!communityMap[size]) communityMap[size] = { count: 0, revenue: 0 };
    communityMap[size].count++;
    if (o.latest?.totrevenue != null) communityMap[size].revenue += o.latest.totrevenue;
  }
  const byCommunity = Object.entries(communityMap)
    .map(([size, data]) => ({
      size,
      count: data.count,
      revenue: data.revenue,
      pct_orgs: round2(data.count / totalOrgs * 100),
      pct_revenue: totalRevenue > 0 ? round2(data.revenue / totalRevenue * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // --- by_city ---
  const cityMap = {};
  for (const o of enriched) {
    const city = o.city || 'Unknown';
    if (!cityMap[city]) cityMap[city] = { count: 0, revenue: 0 };
    cityMap[city].count++;
    if (o.latest?.totrevenue != null) cityMap[city].revenue += o.latest.totrevenue;
  }
  const byCity = Object.entries(cityMap)
    .map(([city, data]) => ({
      city,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.count - a.count);

  // --- by_freshness ---
  const freshnessMap = {
    'Current (2023-24)': { count: 0, color: '#22c55e' },
    'Recent (2021-22)': { count: 0, color: '#84cc16' },
    'Older (2018-20)': { count: 0, color: '#eab308' },
    'No Filing Data': { count: 0, color: '#e5e7eb' },
  };
  for (const o of enriched) {
    if (!o.latest) {
      freshnessMap['No Filing Data'].count++;
    } else {
      const yr = o.latest.tax_prd_yr;
      if (yr >= 2023) freshnessMap['Current (2023-24)'].count++;
      else if (yr >= 2021) freshnessMap['Recent (2021-22)'].count++;
      else if (yr >= 2018) freshnessMap['Older (2018-20)'].count++;
      else freshnessMap['No Filing Data'].count++; // very old treated as no data
    }
  }
  const byFreshness = Object.entries(freshnessMap).map(([status, data]) => ({
    status,
    count: data.count,
    color: data.color,
  }));

  // --- by_revenue_tier ---
  const revTiers = [
    { label: '$10M+', min: 10000000 },
    { label: '$1M-$10M', min: 1000000 },
    { label: '$250K-$1M', min: 250000 },
    { label: '$100K-$250K', min: 100000 },
    { label: '$50K-$100K', min: 50000 },
    { label: 'Under $50K', min: -Infinity },
  ];
  const revTierMap = {};
  for (const t of revTiers) revTierMap[t.label] = { count: 0, revenue: 0 };

  for (const o of enriched) {
    if (!o.latest || o.latest.totrevenue == null) continue;
    const rev = o.latest.totrevenue;
    for (const t of revTiers) {
      if (rev >= t.min) {
        revTierMap[t.label].count++;
        revTierMap[t.label].revenue += rev;
        break;
      }
    }
  }
  const byRevenueTier = revTiers.map(t => ({
    tier: t.label,
    count: revTierMap[t.label].count,
    revenue: revTierMap[t.label].revenue,
  }));

  // --- by_size_category ---
  function sizeCategory(filing) {
    if (!filing) return null;
    const rev = filing.totrevenue ?? 0;
    if (filing.formtype === 2) return 'Private Foundation';
    if (filing.formtype === 1) return 'Small (990-EZ)';
    // formtype === 0 (990)
    if (rev >= 10000000) return 'Large (990, $10M+)';
    if (rev >= 1000000) return 'Medium (990, $1M-$10M)';
    return 'Established (990, <$1M)';
  }

  const sizeCatMap = {};
  for (const o of enriched) {
    if (!o.latest) continue;
    const cat = sizeCategory(o.latest);
    if (!cat) continue;
    if (!sizeCatMap[cat]) sizeCatMap[cat] = { count: 0, revenues: [], assets: [] };
    sizeCatMap[cat].count++;
    if (o.latest.totrevenue != null) sizeCatMap[cat].revenues.push(o.latest.totrevenue);
    if (o.latest.totassetsend != null) sizeCatMap[cat].assets.push(o.latest.totassetsend);
  }
  const sizeOrder = ['Large (990, $10M+)', 'Medium (990, $1M-$10M)', 'Established (990, <$1M)', 'Small (990-EZ)', 'Private Foundation'];
  const bySizeCategory = sizeOrder
    .filter(cat => sizeCatMap[cat])
    .map(cat => {
      const d = sizeCatMap[cat];
      const avgRev = d.revenues.length > 0 ? Math.round(d.revenues.reduce((s, v) => s + v, 0) / d.revenues.length) : 0;
      const avgAssets = d.assets.length > 0 ? Math.round(d.assets.reduce((s, v) => s + v, 0) / d.assets.length) : 0;
      return {
        category: cat,
        count: d.count,
        avg_revenue: avgRev,
        avg_assets: avgAssets,
      };
    });

  // --- concentration ---
  const revsSorted = orgsWithRevenue.map(o => o.latest.totrevenue).sort((a, b) => b - a);
  const thresholds = [25, 50, 75, 90, 95, 99];
  const concentration = [];
  let cumulative = 0;
  let idx = 0;
  for (const pct of thresholds) {
    const target = totalRevenue * pct / 100;
    while (idx < revsSorted.length && cumulative < target) {
      cumulative += revsSorted[idx];
      idx++;
    }
    concentration.push({
      threshold: `${pct}%`,
      orgs_needed: idx,
      pct_of_orgs: withFinancials > 0 ? round2(idx / withFinancials * 100) : 0,
    });
  }

  // --- financial_health ---
  function healthCategory(filing) {
    if (!filing) return null;
    const { totrevenue, totfuncexpns, totnetassetend, totliabend, totassetsend } = filing;

    // Negative Net Assets first
    if (totnetassetend != null && totnetassetend <= 0) return 'Negative Net Assets';
    // High Debt
    if (totliabend != null && totassetsend != null && totassetsend > 0 && totliabend > 0.8 * totassetsend && totnetassetend != null && totnetassetend > 0) return 'High Debt';
    // Expenses > Revenue
    if (totfuncexpns != null && totrevenue != null && totfuncexpns > totrevenue && totnetassetend != null && totnetassetend > 0) return 'Expenses > Revenue';
    // Healthy
    return 'Healthy';
  }

  const healthColors = {
    'Healthy': '#22c55e',
    'Expenses > Revenue': '#f97316',
    'High Debt': '#ef4444',
    'Negative Net Assets': '#dc2626',
  };
  const healthMap = {};
  for (const label of Object.keys(healthColors)) healthMap[label] = 0;

  for (const o of enriched) {
    if (!o.latest) continue;
    const cat = healthCategory(o.latest);
    if (cat && healthMap[cat] !== undefined) healthMap[cat]++;
  }
  const financialHealth = Object.entries(healthColors).map(([status, color]) => ({
    status,
    count: healthMap[status],
    color,
  }));

  // --- top_orgs ---
  const topOrgs = [...enriched]
    .filter(o => o.latest?.totrevenue != null)
    .sort((a, b) => b.latest.totrevenue - a.latest.totrevenue)
    .slice(0, 10)
    .map(o => ({
      name: o.name,
      city: o.city,
      type: nteeCategory(o.ntee_code),
      revenue: o.latest.totrevenue,
      assets: o.latest.totassetsend,
    }));

  // --- benchmarks ---
  function benchmarkGroup(filing) {
    if (!filing) return null;
    const rev = filing.totrevenue ?? 0;
    if (filing.formtype === 0 && rev >= 10000000) return 'large';
    if (filing.formtype === 0 && rev >= 1000000) return 'medium';
    if ((filing.formtype === 0 || filing.formtype === 1) && rev < 1000000) return 'small';
    return null;
  }

  const benchGroups = { large: [], medium: [], small: [] };
  for (const o of enriched) {
    if (!o.latest) continue;
    const grp = benchmarkGroup(o.latest);
    if (grp) benchGroups[grp].push(o.latest);
  }

  const benchmarks = {};
  for (const [grp, filings] of Object.entries(benchGroups)) {
    const expenseRatios = filings
      .filter(f => f.totrevenue != null && f.totrevenue !== 0 && f.totfuncexpns != null)
      .map(f => f.totfuncexpns / f.totrevenue);
    const officerComps = filings
      .filter(f => f.totfuncexpns != null && f.totfuncexpns !== 0 && f.compnsatncurrofcr != null)
      .map(f => f.compnsatncurrofcr / f.totfuncexpns);
    const assetVals = filings
      .filter(f => f.totassetsend != null)
      .map(f => f.totassetsend);

    benchmarks[grp] = {
      count: filings.length,
      avg_expense_ratio: expenseRatios.length > 0 ? round2(expenseRatios.reduce((s, v) => s + v, 0) / expenseRatios.length) : null,
      avg_officer_comp: officerComps.length > 0 ? round2(officerComps.reduce((s, v) => s + v, 0) / officerComps.length) : null,
      median_assets: assetVals.length > 0 ? Math.round(median(assetVals)) : null,
    };
  }

  // --- Per-org array for client-side filtering ---
  const orgs = enriched.map(o => {
    const rec = {
      ein: o.ein,
      nm: o.name,
      ct: o.city,
      nt: o.ntee_code ? o.ntee_code.charAt(0).toUpperCase() : null,
      sub: o.subseccd,
      yr: o.latest?.tax_prd_yr ?? null,
      ft: o.latest?.formtype ?? null,
      rev: o.latest?.totrevenue ?? null,
      exp: o.latest?.totfuncexpns ?? null,
      ast: o.latest?.totassetsend ?? null,
      lib: o.latest?.totliabend ?? null,
      net: o.latest?.totnetassetend ?? null,
      comp: o.latest?.compnsatncurrofcr ?? null,
    };
    return rec;
  });

  // --- Assemble output ---
  const output = {
    last_updated: new Date().toISOString(),
    data_source: 'ProPublica Nonprofit Explorer API',
    overview,
    by_ccode: byCcode,
    by_ntee: byNtee,
    by_community: byCommunity,
    by_city: byCity,
    by_freshness: byFreshness,
    by_revenue_tier: byRevenueTier,
    by_size_category: bySizeCategory,
    concentration,
    financial_health: financialHealth,
    top_orgs: topOrgs,
    benchmarks,
    orgs,
  };

  mkdirSync('src/data', { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`Dashboard data written to ${OUTPUT}`);
  console.log(`  ${totalOrgs} total orgs, ${withFinancials} with financials`);
  console.log(`  ${cities.size} cities, ${byCcode.length} subsection codes, ${byNtee.length} NTEE categories`);
  console.log(`  Revenue: $${(totalRevenue / 1e9).toFixed(2)}B across ${orgsWithRevenue.length} reporting orgs`);
}

main();
