// src/app/page.tsx

import React from 'react';
import { GameView } from '../UI/GameView';

export default function HomePage() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <GameView />
    </main>
  );
}
