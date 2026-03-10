export function SoundCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2 mb-4" />
      <div className="h-3 bg-muted rounded w-1/4 mb-4" />
      <div className="flex gap-2">
        <div className="w-9 h-9 rounded-full bg-muted" />
        <div className="w-9 h-9 rounded-full bg-muted" />
        <div className="w-9 h-9 rounded-full bg-muted" />
      </div>
    </div>
  );
}
