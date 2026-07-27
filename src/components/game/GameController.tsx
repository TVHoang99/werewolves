"use client";

import { useState, useMemo } from "react";
import { RotateCcw, RefreshCw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleList } from "./RoleList";
import { TimelineTable } from "./Timeline";
import { EditPanel } from "./EditPanel";
import { HistoryModal } from "./HistoryModal";
import { useGameStore } from "@/lib/store";
import { calculateDeadPlayerIds, calculateDeadPlayerIdsForVote } from "@/lib/gameUtils";
import type { RoleName } from "@/lib/types";

export function GameController() {
  const players = useGameStore((s) => s.players);
  const timelines = useGameStore((s) => s.timelines);
  const currentDay = useGameStore((s) => s.currentDay);
  const setCurrentDay = useGameStore((s) => s.setCurrentDay);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const newMatch = useGameStore((s) => s.newMatch);
  const newGame = useGameStore((s) => s.newGame);
  const addAction = useGameStore((s) => s.addAction);

  const [editRole, setEditRole] = useState<RoleName | null>(null);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);
  const [voteTargetId, setVoteTargetId] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  // Calculate all dead player IDs from timelines (only from previous days, not current day)
  const deadPlayerIds = useMemo(() => {
    return calculateDeadPlayerIds(players, timelines, currentDay);
  }, [players, timelines, currentDay]);

  // Get living players eligible for vote (excluding previous dead & current night dead)
  const livingPlayers = useMemo(() => {
    const deadForVote = calculateDeadPlayerIdsForVote(players, timelines, currentDay);
    return players.filter((p) => !deadForVote.has(p.id));
  }, [players, timelines, currentDay]);

  // Check if orphan's mother is dead
  const orphanMotherDead = useMemo(() => {
    for (const timeline of timelines) {
      const orphanAction = timeline.actions.find(
        (a) => a.role === "mo_coi" && a.action === "nhan_me" && a.target
      );
      if (orphanAction?.target) {
        return deadPlayerIds.has(orphanAction.target);
      }
    }
    return false;
  }, [timelines, deadPlayerIds]);

  // Cursed players from previous days
  const cursedPlayerIds = useMemo(() => {
    const set = new Set<string>();
    for (const timeline of timelines) {
      if (timeline.day >= currentDay) continue;
      for (const action of timeline.actions) {
        if (action.role === "soi_nguyen" && action.action === "nguyen" && action.target) {
          set.add(action.target);
        }
      }
    }
    return set;
  }, [timelines, currentDay]);

  // Calculate win conditions
  const gameResult = useMemo(() => {
    const alivePlayers = players.filter((p) => !deadPlayerIds.has(p.id));
    const aliveWolves = alivePlayers.filter(
      (p) => p.role === "soi" || p.role === "soi_nguyen"
    );
    // Include orphan as wolf if mother is dead
    const aliveOrphan = alivePlayers.filter(
      (p) => p.role === "mo_coi" && orphanMotherDead
    );
    // Include cursed players as wolves if cursed on a previous day
    const aliveCursed = alivePlayers.filter(
      (p) =>
        cursedPlayerIds.has(p.id) &&
        p.role !== "soi" &&
        p.role !== "soi_nguyen" &&
        !(p.role === "mo_coi" && orphanMotherDead)
    );
    const totalAliveWolves =
      aliveWolves.length + aliveOrphan.length + aliveCursed.length;
    const aliveNonWolves = alivePlayers.filter(
      (p) =>
        p.role !== "soi" &&
        p.role !== "soi_nguyen" &&
        !(p.role === "mo_coi" && orphanMotherDead) &&
        !cursedPlayerIds.has(p.id)
    );

    // Check couple (third faction) win condition
    // Find Cupid's pair action from any timeline
    let cupidPair: { target: string; target2: string } | null = null;
    for (const timeline of timelines) {
      const cupidAction = timeline.actions.find(
        (a) => a.role === "cupid" && a.action === "ghep_doi" && a.target && a.target2
      );
      if (cupidAction?.target && cupidAction?.target2) {
        cupidPair = { target: cupidAction.target, target2: cupidAction.target2 };
        break;
      }
    }

    if (cupidPair) {
      const partner1 = players.find((p) => p.id === cupidPair!.target);
      const partner2 = players.find((p) => p.id === cupidPair!.target2);

      if (partner1 && partner2) {
        // Check if it's a third faction (one wolf + one non-wolf)
        const isWolf = (p: typeof partner1) =>
          p.role === "soi" ||
          p.role === "soi_nguyen" ||
          (p.role === "mo_coi" && orphanMotherDead) ||
          cursedPlayerIds.has(p.id);
        const oneIsWolf = isWolf(partner1) !== isWolf(partner2);

        if (oneIsWolf) {
          // Third faction: if both alive and they are the only 2 survivors
          const bothAlive = !deadPlayerIds.has(partner1.id) && !deadPlayerIds.has(partner2.id);
          if (bothAlive && alivePlayers.length === 2) {
            return "couple";
          }
        }
      }
    }

    // Wolves win if wolves >= non-wolves
    if (totalAliveWolves >= aliveNonWolves.length && totalAliveWolves > 0) {
      return "wolves";
    }
    // Villagers win if no wolves left
    if (totalAliveWolves === 0 && aliveNonWolves.length > 0) {
      return "villagers";
    }
    return null;
  }, [players, deadPlayerIds, orphanMotherDead, cursedPlayerIds, timelines]);

  const handleEditRole = (roleName: RoleName) => {
    setEditRole(roleName);
    setEditPanelOpen(true);
  };

  const handleVote = () => {
    if (!voteTargetId) return;
    addAction({
      role: "dan_lang",
      actor: "vote",
      action: "vote",
      target: voteTargetId,
      day: currentDay,
    });
    setVoteTargetId("");
    setVoteOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[82rem] mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Game Controller</h1>
          <div className="flex items-center gap-2">
            <Button variant="destructive" onClick={() => setVoteOpen(true)} size="sm">
              Vote
            </Button>
            <Button variant="outline" onClick={() => setHistoryOpen(true)} size="sm">
              <History className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Lịch sử</span>
              <span className="sm:hidden">Sử</span>
            </Button>
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

        {/* Win Condition Banner */}
        {gameResult && (
          <div
            className={`mb-6 p-4 rounded-lg text-center ${
              gameResult === "wolves"
                ? "bg-red-500/20 border border-red-500/50 text-red-400"
                : gameResult === "couple"
                ? "bg-pink-500/20 border border-pink-500/50 text-pink-400"
                : "bg-green-500/20 border border-green-500/50 text-green-400"
            }`}
          >
            <p className="text-lg font-bold">
              {gameResult === "wolves"
                ? "Sói thắng! Số sói >= Số người còn lại"
                : gameResult === "couple"
                ? "💕 Cặp đôi thắng! Phe thứ 3 là 2 người sống sót cuối cùng"
                : "Dân làng thắng! Không còn sói nào"}
            </p>
          </div>
        )}

        {/* Main Content - 2 columns on desktop, stacked on tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Role List - Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RoleList players={players} deadPlayerIds={deadPlayerIds} timelines={timelines} currentDay={currentDay} onEditRole={handleEditRole} />
          </div>

          {/* Timeline - Main area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <TimelineTable
              players={players}
              timelines={timelines}
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              advanceDay={advanceDay}
              deadPlayerIds={deadPlayerIds}
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

      {/* Vote Dialog */}
      <Dialog open={voteOpen} onOpenChange={setVoteOpen}>
        <DialogContent onClose={() => setVoteOpen(false)}>
          <DialogHeader>
            <DialogTitle>Vote loại người chơi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Chọn người chơi bị vote loại khỏi game
            </p>
            <Select
              value={voteTargetId}
              onValueChange={setVoteTargetId}
              options={livingPlayers.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Chọn người bị vote..."
            />
            <Button onClick={handleVote} disabled={!voteTargetId} className="w-full">
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
