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
import { calculateDeadPlayerIds } from "@/lib/gameUtils";
import type { RoleName } from "@/lib/types";
import { WolfAction } from "./RoleActions/WolfAction";
import { AlphaWolfAction } from "./RoleActions/AlphaWolfAction";
import { CupidAction } from "./RoleActions/CupidAction";
import { HunterAction } from "./RoleActions/HunterAction";
import { GuardAction } from "./RoleActions/GuardAction";
import { WitchAction } from "./RoleActions/WitchAction";
import { OrphanAction } from "./RoleActions/OrphanAction";
import { SeerAction } from "./RoleActions/SeerAction";

interface EditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: RoleName | null;
}

export function EditPanel({ open, onOpenChange, roleName }: EditPanelProps) {
  const roleConfig = roleName ? ROLE_MAP[roleName] : null;
  const players = useGameStore((s) => s.players);
  const timelines = useGameStore((s) => s.timelines);
  const currentDay = useGameStore((s) => s.currentDay);

  // Calculate dead player IDs (only from previous days)
  const deadPlayerIds = useMemo(() => {
    return calculateDeadPlayerIds(players, timelines, currentDay);
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

  const actors = roleName
    ? players.filter((p) => {
        // Include soi_nguyen, orphan (if mother dead), and cursed players in soi group
        if (roleName === "soi") {
          if (p.role === "soi" || p.role === "soi_nguyen") return true;
          if (p.role === "mo_coi" && orphanMotherDead) return true;
          if (cursedPlayerIds.has(p.id)) return true;
          return false;
        }
        return p.role === roleName;
      })
    : [];

  // Check if there are any alive wolves
  const hasAliveWolves = useMemo(() => {
    return players.some(
      (p) =>
        !deadPlayerIds.has(p.id) &&
        (p.role === "soi" ||
          p.role === "soi_nguyen" ||
          (p.role === "mo_coi" && orphanMotherDead) ||
          cursedPlayerIds.has(p.id))
    );
  }, [players, deadPlayerIds, orphanMotherDead, cursedPlayerIds]);

  const renderAction = (actorId: string, isDead: boolean) => {
    // If player is dead and not villager, show dead message
    // Exception: wolves can still bite if other wolves are alive
    if (isDead && roleName !== "dan_lang" && roleName !== "soi_nguyen") {
      if (roleName === "soi" && hasAliveWolves) {
        return <WolfAction actorId={actorId} />;
      }
      return (
        <p className="text-sm text-red-400 italic">Đã chết - Không thể sử dụng kỹ năng</p>
      );
    }

    // If orphan's mother is dead, orphan becomes wolf
    if (roleName === "mo_coi" && orphanMotherDead && !isDead) {
      return <WolfAction actorId={actorId} />;
    }

    switch (roleName) {
      case "soi":
        return <WolfAction actorId={actorId} />;
      case "soi_nguyen":
        return <AlphaWolfAction actorId={actorId} />;
      case "tien_tri":
        return <SeerAction actorId={actorId} />;
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
      <DialogContent onClose={() => onOpenChange(false)} className="max-h-[85vh]">
        <DialogHeader className="mb-4">
          <DialogTitle>
            {roleConfig ? `Chỉnh sửa ${roleConfig.label}` : "Chỉnh sửa Role"}
          </DialogTitle>
        </DialogHeader>

        {actors.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Không có người chơi nào đảm nhận vai trò này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Người chơi:{" "}
              <span className="font-medium text-foreground">
                {actors.map((a, i) => {
                  const isDead = deadPlayerIds.has(a.id);
                  return (
                    <span key={a.id}>
                      {i > 0 && ", "}
                      <span className={isDead ? "line-through text-muted-foreground" : ""}>
                        {a.name}
                      </span>
                    </span>
                  );
                })}
              </span>
            </p>
            {/* Wolves share one bite action */}
            {(roleName === "soi" || roleName === "soi_nguyen") && actors.length > 1 ? (
              renderAction(actors[0].id, deadPlayerIds.has(actors[0].id))
            ) : actors.length === 1 ? (
              renderAction(actors[0].id, deadPlayerIds.has(actors[0].id))
            ) : (
              actors.map((actor) => (
                <div key={actor.id} className="space-y-2">
                  <p className="text-sm font-medium">{actor.name}</p>
                  {renderAction(actor.id, deadPlayerIds.has(actor.id))}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
