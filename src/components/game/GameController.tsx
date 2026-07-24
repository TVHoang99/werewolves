"use client";

import { useState } from "react";
import { RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleList } from "./RoleList";
import { TimelineTable } from "./Timeline";
import { EditPanel } from "./EditPanel";
import { useGameStore } from "@/lib/store";
import type { RoleName } from "@/lib/types";

export function GameController() {
  const players = useGameStore((s) => s.players);
  const timelines = useGameStore((s) => s.timelines);
  const currentDay = useGameStore((s) => s.currentDay);
  const setCurrentDay = useGameStore((s) => s.setCurrentDay);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const newMatch = useGameStore((s) => s.newMatch);
  const newGame = useGameStore((s) => s.newGame);

  const [editRole, setEditRole] = useState<RoleName | null>(null);
  const [editPanelOpen, setEditPanelOpen] = useState(false);

  const handleEditRole = (roleName: RoleName) => {
    setEditRole(roleName);
    setEditPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Game Controller</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={newMatch}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Trận mới
            </Button>
            <Button variant="outline" onClick={newGame}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Trò chơi mới
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role List - Sidebar */}
          <div className="lg:col-span-1">
            <RoleList players={players} onEditRole={handleEditRole} />
          </div>

          {/* Timeline - Main area */}
          <div className="lg:col-span-2">
            <TimelineTable
              players={players}
              timelines={timelines}
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              advanceDay={advanceDay}
            />
          </div>
        </div>
      </div>

      {/* Edit Panel */}
      <EditPanel
        open={editPanelOpen}
        onOpenChange={setEditPanelOpen}
        roleName={editRole}
      />
    </div>
  );
}
