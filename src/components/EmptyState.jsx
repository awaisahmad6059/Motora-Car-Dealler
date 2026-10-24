import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  description = 'Try adjusting your filters or check back soon.',
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-card border border-dashed border-ink/15 bg-mist/60 px-6 py-16 text-center ${className}`}>
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-white text-ink/35 shadow-soft">
        <Icon size={26} />
      </span>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/55">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
