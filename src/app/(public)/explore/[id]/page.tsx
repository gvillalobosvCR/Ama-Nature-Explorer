// Server Component wrapper for /explore/[id]
// Required pattern with cacheComponents: true — dynamic hooks like useParams()
// must be inside a <Suspense> boundary when used in Client Components.
// This server wrapper provides that boundary and exports instant=false so
// the prerender waits for the client component to be ready.
import { Suspense } from 'react';
import SpeciesDetailClient from './SpeciesDetailClient';

export const instant = false;

// Loading skeleton shown while the client component hydrates
function SpeciesLoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-emerald-950 min-h-screen">
      <div className="relative h-72 w-full bg-emerald-900/60 animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col p-5 gap-5">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-3/4 bg-emerald-800/50 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-emerald-800/30 rounded animate-pulse" />
        </div>
        <div className="h-20 w-full bg-emerald-900/25 rounded-2xl animate-pulse" />
        <div className="h-24 w-full bg-emerald-900/15 rounded-2xl animate-pulse" />
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-emerald-950 border-t border-emerald-900 h-16 z-30" />
    </div>
  );
}

export default function SpeciesDetailPage() {
  return (
    <Suspense fallback={<SpeciesLoadingSkeleton />}>
      <SpeciesDetailClient />
    </Suspense>
  );
}
