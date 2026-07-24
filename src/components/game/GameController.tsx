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
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Game Controller</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={newMatch} size="sm">
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Trận mới</span>
              <span className="sm:hidden">Mới</span>
            </Button>
            <Button variant="outline" onClick={newGame} size="sm">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Trò chơi mới</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        </div>

        {/* Main Content - 2 columns on desktop, stacked on tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Role List - Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RoleList players={players} onEditRole={handleEditRole} />
          </div>

          {/* Timeline - Main area */}
          <div className="lg:col-span-2 order-1 lg:order-2">
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
