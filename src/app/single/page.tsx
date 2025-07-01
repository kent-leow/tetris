'use client';

import SinglePlayerGame from '@/components/game/SinglePlayerGame';

export default function SinglePlayerPage() {
  return <SinglePlayerGame onMainMenu={() => {
    // Use router to go back to main menu
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }} />;
}
