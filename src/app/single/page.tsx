'use client';

import SinglePlayerGame from '@/components/game/SinglePlayerGame';
import RetroGameLayout from '@/components/game/RetroGameLayout';

export default function SinglePlayerPage() {
  return (
    <RetroGameLayout title="Single Player">
      <SinglePlayerGame />
    </RetroGameLayout>
  );
}
