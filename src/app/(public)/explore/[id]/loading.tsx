// This loading.tsx defines the prefetchable shell for /explore/[id] routes.
// With partialPrefetching: true in next.config.ts, Next.js automatically
// prefetches and caches this shell when the species <Link> cards enter the
// viewport on /explore. This makes the route available offline immediately.
export default function SpeciesDetailLoading() {
  return (
    <div className="flex-1 flex flex-col bg-emerald-950 min-h-screen">
      {/* Hero placeholder */}
      <div className="relative h-72 w-full bg-emerald-900/60 animate-pulse flex-shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col p-5 gap-5">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-3/4 bg-emerald-800/50 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-emerald-800/30 rounded animate-pulse" />
          <div className="h-3 w-1/3 bg-emerald-800/20 rounded animate-pulse" />
        </div>
        <div className="h-20 w-full bg-emerald-900/25 rounded-2xl animate-pulse" />
        <div className="h-10 w-full bg-emerald-900/20 rounded-xl animate-pulse" />
        <div className="h-24 w-full bg-emerald-900/15 rounded-2xl animate-pulse" />
      </div>

      {/* Bottom tab bar placeholder */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-emerald-950 border-t border-emerald-900 h-16 z-30" />
    </div>
  );
}
