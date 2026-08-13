// Server component wrapper - exports generateStaticParams so Next.js pre-generates
// the static HTML shell for all /explore/[id] routes at build time.
// The actual rendering is done by the 'use client' SpeciesDetailPage component
// which reads all data from localStorage (offline-first, no server fetching).
import SpeciesDetailPage from './page';

export function generateStaticParams() {
  // Return empty array - the shell is generated without any specific IDs.
  // At runtime, the client reads the ID from the URL and loads data from localStorage.
  return [];
}

export default function ExploreDetailServerShell() {
  return <SpeciesDetailPage />;
}
