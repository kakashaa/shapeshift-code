export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1.5 px-3 py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card/50 p-3 space-y-2">
          <div className="h-3 w-2/3 rounded skeleton-shimmer" />
          <div className="h-2.5 w-1/2 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 px-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card/50 p-3 space-y-2">
          <div className="h-6 w-6 rounded-lg skeleton-shimmer" />
          <div className="h-5 w-12 rounded skeleton-shimmer" />
          <div className="h-2 w-16 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
