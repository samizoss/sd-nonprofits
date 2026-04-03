import InfoTip from './InfoTip';

export default function SectionHeader({ title, subtitle, info }) {
  return (
    <div className="mb-8 pb-4 border-b border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900">{title}{info && <InfoTip text={info} />}</h2>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
