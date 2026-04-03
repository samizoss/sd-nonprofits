const borderColors = {
  blue: 'border-l-[#1b4965]',
  green: 'border-l-emerald-600',
  purple: 'border-l-violet-600',
  red: 'border-l-red-600',
  amber: 'border-l-[#c17817]',
};

export default function InsightCard({ title, value, description, color = 'blue' }) {
  const borderClass = borderColors[color] || borderColors.blue;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 border-l-4 ${borderClass} p-5`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}
