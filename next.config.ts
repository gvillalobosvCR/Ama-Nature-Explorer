import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components + Partial Prefetching: prefetch and cache the static shell
  // of each species <Link> card when it enters viewport on /explore.
  // This makes /explore/[id] routes available offline immediately.
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
