export default function StatCard({ title, value, subtitle, large }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${large ? 'p-8' : 'p-6'}`}>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className={`${large ? 'text-4xl' : 'text-3xl'} font-bold text-gray-900 mt-1`}>{value}</p>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
