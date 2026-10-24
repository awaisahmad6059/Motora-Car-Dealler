export function CarCardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-card border border-ink/[0.06] bg-white">
          <div className="skeleton h-52 w-full rounded-none" />
          <div className="space-y-4 p-5">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
            <div className="flex gap-3 pt-2">
              <div className="skeleton h-10 flex-1" />
              <div className="skeleton h-10 w-10" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton h-16 w-full" />
      ))}
    </div>
  );
}

export function PageSpinner({ label = 'Loading showroom…' }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-ink/10 border-t-racing" />
        <span className="font-display text-sm font-extrabold tracking-widest">M</span>
      </span>
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink/45">{label}</span>
    </div>
  );
}
