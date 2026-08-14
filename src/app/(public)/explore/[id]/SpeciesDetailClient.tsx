'use client';

import { useParams, useRouter } from 'next/navigation';
import SpeciesDetailView from '@/app/components/SpeciesDetailView';

export default function SpeciesDetailPage() {
  const params = useParams();
  const router = useRouter();

  const idParam = params.id as string;
  const pointNumber = parseInt(idParam, 10);

  return (
    <SpeciesDetailView
      pointNumber={pointNumber}
      onClose={() => router.push('/explore')}
    />
  );
}
