"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameStore } from "@/lib/store";
import { ROLE_MAP } from "@/lib/roles";
import type { RoleName } from "@/lib/types";
import { WolfAction } from "./RoleActions/WolfAction";
import { AlphaWolfAction } from "./RoleActions/AlphaWolfAction";
import { CupidAction } from "./RoleActions/CupidAction";
import { HunterAction } from "./RoleActions/HunterAction";
import { GuardAction } from "./RoleActions/GuardAction";
import { WitchAction } from "./RoleActions/WitchAction";
import { OrphanAction } from "./RoleActions/OrphanAction";

interface EditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: RoleName | null;
}

export function EditPanel({ open, onOpenChange, roleName }: EditPanelProps) {
  const roleConfig = roleName ? ROLE_MAP[roleName] : null;
  const players = useGameStore((s) => s.players);
  const timelines = useGameStore((s) => s.timelines);

  // Calculate dead player IDs
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
        }
      }
    }
    return dead;
  }, [timelines]);

  const actors = roleName
    ? players.filter((p) => p.role === roleName)
    : [];

  // Check if there are any alive wolves
  const hasAliveWolves = useMemo(() => {
    return players.some(
      (p) =>
        !deadPlayerIds.has(p.id) && (p.role === "soi" || p.role === "soi_nguyen")
    );
  }, [players, deadPlayerIds]);

  const renderAction = (actorId: string, isDead: boolean) => {
    // If player is dead and not villager, show dead message
    // Exception: wolves can still bite if other wolves are alive
    if (isDead && roleName !== "dan_lang") {
      if ((roleName === "soi" || roleName === "soi_nguyen") && hasAliveWolves) {
        // Dead wolf - still show bite action since other wolves are alive
        return <WolfAction actorId={actorId} />;
      }
      return (
        <p className="text-sm text-red-400 italic">Đã chết - Không thể sử dụng kỹ năng</p>
      );
    }

    switch (roleName) {
      case "soi":
        return <WolfAction actorId={actorId} />;
      case "soi_nguyen":
        return <AlphaWolfAction actorId={actorId} />;
      case "cupid":
        return <CupidAction actorId={actorId} />;
      case "tho_san":
        return <HunterAction actorId={actorId} />;
      case "bao_ve":
        return <GuardAction actorId={actorId} />;
      case "phu_thuy":
        return <WitchAction actorId={actorId} />;
      case "mo_coi":
        return <OrphanAction actorId={actorId} />;
      default:
        return (
          <p className="text-sm text-muted-foreground">Sắp ra mắt...</p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {roleConfig ? `Chỉnh sửa ${roleConfig.label}` : "Chỉnh sửa Role"}
          </DialogTitle>
        </DialogHeader>

        {actors.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Không có người chơi nào đảm nhận vai trò này.</p>
          </div>
        ) : actors.length === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Người chơi: <span className="font-medium text-foreground">{actors[0].name}</span>
            </p>
            {renderAction(actors[0].id, deadPlayerIds.has(actors[0].id))}
          </div>
        ) : (
          <div className="space-y-4">
            {actors.map((actor) => (
              <div key={actor.id} className="space-y-2">
                <p className="text-sm font-medium">{actor.name}</p>
                {renderAction(actor.id, deadPlayerIds.has(actor.id))}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
