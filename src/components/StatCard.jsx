export default function StatCard({ title, value, subtitle, large }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${large ? 'p-8' : 'p-5'}`}>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{title}</p>
      <p className={`${large ? 'text-4xl' : 'text-3xl'} font-bold text-slate-900 mt-2`}>{value}</p>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
