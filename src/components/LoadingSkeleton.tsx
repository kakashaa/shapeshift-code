export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2 px-4 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-2.5">
          <div className="h-3.5 w-3/5 rounded-lg skeleton-shimmer" />
          <div className="h-2.5 w-2/5 rounded-lg skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-3">
          <div className="h-8 w-8 rounded-xl skeleton-shimmer" />
          <div className="h-6 w-14 rounded-lg skeleton-shimmer" />
          <div className="h-2.5 w-20 rounded-lg skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
