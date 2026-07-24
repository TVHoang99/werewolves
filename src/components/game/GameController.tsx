"use client";

import { useState, useMemo } from "react";
import { RotateCcw, RefreshCw } from "lucide-react";
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
  const addAction = useGameStore((s) => s.addAction);

  const [editRole, setEditRole] = useState<RoleName | null>(null);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);
  const [voteTargetId, setVoteTargetId] = useState("");

  // Calculate all dead player IDs from timelines (only from previous days, not current day)
  const deadPlayerIds = useMemo(() => {
    const dead = new Set<string>();
    const deadThisRound = new Set<string>(); // Track deaths this round for hunter check

    for (const timeline of timelines) {
      // Only count deaths from previous days
      if (timeline.day >= currentDay) continue;

      deadThisRound.clear();
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
          deadThisRound.add(wolfBite.target);
        }
      }

      // Witch kill
      const witchKill = actions.find((a) => a.role === "phu_thuy" && a.action === "giet");
      if (witchKill?.target) {
        dead.add(witchKill.target);
        deadThisRound.add(witchKill.target);
      }

      // Vote results
      const voteActions = actions.filter((a) => a.role === "dan_lang" && a.action === "vote" && a.target);
      if (voteActions.length > 0) {
        const voteCounts: Record<string, number> = {};
        for (const vote of voteActions) {
          if (vote.target) {
            voteCounts[vote.target] = (voteCounts[vote.target] || 0) + 1;
          }
        }
        let maxVotes = 0;
        let maxVotedId = "";
        for (const [playerId, count] of Object.entries(voteCounts)) {
          if (count > maxVotes) {
            maxVotes = count;
            maxVotedId = playerId;
          }
        }
        if (maxVotedId && maxVotes > 0) {
          dead.add(maxVotedId);
          deadThisRound.add(maxVotedId);
        }
      }

      // Check Cupid pairs - if one dies, partner also dies
      const cupidAction = actions.find((a) => a.role === "cupid" && a.action === "ghep_doi");
      if (cupidAction?.target && cupidAction?.target2) {
        const partner1Dead = deadThisRound.has(cupidAction.target);
        const partner2Dead = deadThisRound.has(cupidAction.target2);
        if (partner1Dead && !dead.has(cupidAction.target2)) {
          dead.add(cupidAction.target2);
          deadThisRound.add(cupidAction.target2);
        }
        if (partner2Dead && !dead.has(cupidAction.target)) {
          dead.add(cupidAction.target);
          deadThisRound.add(cupidAction.target);
        }
      }

      // Check Hunter - if hunter dies, they can take someone with them
      const hunters = players.filter((p) => p.role === "tho_san");
      for (const hunter of hunters) {
        if (deadThisRound.has(hunter.id)) {
          // Find hunter's "săn cùng" target from any day
          for (const t of timelines) {
            const hunterAction = t.actions.find(
              (a) => a.actor === hunter.id && a.action === "san_cung" && a.target
            );
            if (hunterAction?.target && !dead.has(hunterAction.target)) {
              dead.add(hunterAction.target);
              deadThisRound.add(hunterAction.target);
            }
          }
        }
      }
    }
    return dead;
  }, [timelines, currentDay, players]);

  // Get living players for vote
  const livingPlayers = useMemo(() => {
    return players.filter((p) => !deadPlayerIds.has(p.id));
  }, [players, deadPlayerIds]);

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
    const totalAliveWolves = aliveWolves.length + aliveOrphan.length;
    const aliveNonWolves = alivePlayers.filter(
      (p) => p.role !== "soi" && p.role !== "soi_nguyen" && !(p.role === "mo_coi" && orphanMotherDead)
    );

    // Wolves win if wolves >= non-wolves
    if (totalAliveWolves >= aliveNonWolves.length && totalAliveWolves > 0) {
      return "wolves";
    }
    // Villagers win if no wolves left
    if (totalAliveWolves === 0 && aliveNonWolves.length > 0) {
      return "villagers";
    }
    return null;
  }, [players, deadPlayerIds, orphanMotherDead]);

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
                : "bg-green-500/20 border border-green-500/50 text-green-400"
            }`}
          >
            <p className="text-lg font-bold">
              {gameResult === "wolves"
                ? "Sói thắng! Số sói >= Số người còn lại"
                : "Dân làng thắng! Không còn sói nào"}
            </p>
          </div>
        )}

        {/* Main Content - 2 columns on desktop, stacked on tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Role List - Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RoleList players={players} deadPlayerIds={deadPlayerIds} timelines={timelines} onEditRole={handleEditRole} />
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
    </div>
  );
}
