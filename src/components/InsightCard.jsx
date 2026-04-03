const colorStyles = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
  red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
};

export default function InsightCard({ icon, title, value, description, color = 'blue' }) {
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-5`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className={`text-2xl font-bold ${styles.text} my-1`}>{value}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
