"use client";

import { useState, useMemo } from "react";
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

  // Calculate all dead player IDs from timelines
  const deadPlayerIds = useMemo(() => {
    const dead = new Set<string>();
    for (const timeline of timelines) {
      const actions = timeline.actions;

      // Wolf bite victim
      const wolfBite = actions.find((a) => a.role === "soi" && a.action === "can");
      const guardProtect = actions.find((a) => a.role === "bao_ve" && a.action === "bao_ve");
      const witchSave = actions.find((a) => a.role === "phu_thuy" && a.action === "cuu");

      if (wolfBite?.target) {
        const isProtected = guardProtect?.target === wolfBite.target;
        const isSaved = witchSave;
        if (!isProtected && !isSaved) {
          dead.add(wolfBite.target);
        }
      }

      // Witch kill
      const witchKill = actions.find((a) => a.role === "phu_thuy" && a.action === "giet");
      if (witchKill?.target) {
        dead.add(witchKill.target);
      }

      // Hunter shoot
      const hunterShoot = actions.find((a) => a.role === "tho_san" && a.action === "san_cung");
      if (hunterShoot?.target) {
        dead.add(hunterShoot.target);
      }
    }
    return dead;
  }, [timelines]);

  const handleEditRole = (roleName: RoleName) => {
    setEditRole(roleName);
    setEditPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[82rem] mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Game Controller</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={newMatch} size="sm">
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Trận mới</span>
              <span className="sm:hidden">Mới</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("Bạn có chắc muốn reset toàn bộ trò chơi?")) {
                  newGame();
                }
              }}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Trò chơi mới</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        </div>

        {/* Main Content - 2 columns on desktop, stacked on tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Role List - Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RoleList players={players} deadPlayerIds={deadPlayerIds} onEditRole={handleEditRole} />
          </div>

          {/* Timeline - Main area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
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
