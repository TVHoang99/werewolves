"use client";

import { Plus, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerRow } from "./PlayerRow";
import { useGameStore } from "@/lib/store";

export function SetupGame() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const startGame = useGameStore((s) => s.startGame);

  const handleAddRole = () => {
    addPlayer("dan_lang", "");
  };

  const canStart = players.length >= 2 && players.every((p) => p.role && p.name.trim());

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              Thêm vai và người chơi
            </h1>
          </div>

          {/* Player Rows */}
          <div className="space-y-3 mb-6">
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                id={player.id}
                role={player.role}
                name={player.name}
                onRoleChange={(role) =>
                  updatePlayer(player.id, role, player.name)
                }
                onNameChange={(name) =>
                  updatePlayer(player.id, player.role, name)
                }
                onDelete={() => removePlayer(player.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Chưa có người chơi nào</p>
              <p className="text-xs mt-1">
                Nhấn &quot;+ Thêm Role&quot; để bắt đầu
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleAddRole}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Role
            </Button>

            <Button
              onClick={startGame}
              disabled={!canStart}
              className="w-full"
              size="lg"
            >
              <Swords className="h-4 w-4 mr-2" />
              Bắt đầu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
