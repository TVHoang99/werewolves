"use client";

import { useGameStore } from "@/lib/store";
import { SetupGame } from "@/components/setup/SetupGame";
import { GameController } from "@/components/game/GameController";

export default function Home() {
  const screen = useGameStore((s) => s.screen);

  if (screen === "controller") {
    return <GameController />;
  }

  return <SetupGame />;
}
