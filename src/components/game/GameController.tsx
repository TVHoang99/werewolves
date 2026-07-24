"use client";

import { useGameStore } from "@/lib/store";

export function GameController() {
  const players = useGameStore((s) => s.players);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-4">
            Game Controller
          </h1>
          <p className="text-muted-foreground">
            {players.length} người chơi đã sẵn sàng
          </p>
        </div>
      </div>
    </div>
  );
}
