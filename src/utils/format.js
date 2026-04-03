export const formatCurrency = (value) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
};

export const formatNumber = (value) => value?.toLocaleString() || '0';

export const formatPct = (value) => `${value.toFixed(1)}%`;
