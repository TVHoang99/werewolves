"use client";

import { useMemo } from "react";
import { ROLES, ROLE_MAP } from "@/lib/roles";
import type { Player, RoleName, Timeline } from "@/lib/types";

interface RoleListProps {
  players: Player[];
  deadPlayerIds: Set<string>;
  timelines: Timeline[];
  currentDay: number;
  onEditRole: (roleName: RoleName) => void;
}

export function RoleList({ players, deadPlayerIds, timelines, currentDay, onEditRole }: RoleListProps) {
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

  const grouped = useMemo(() => {
    const groups: Record<string, Player[]> = {};
    for (const player of players) {
      // Add to original role group
      if (!groups[player.role]) {
        groups[player.role] = [];
      }
      groups[player.role].push(player);

      // Also add soi_nguyen players to soi group
      if (player.role === "soi_nguyen") {
        if (!groups["soi"]) {
          groups["soi"] = [];
        }
        if (!groups["soi"].some((p) => p.id === player.id)) {
          groups["soi"].push(player);
        }
      }

      // If orphan's mother is dead, orphan becomes wolf
      if (player.role === "mo_coi" && orphanMotherDead) {
        if (!groups["soi"]) {
          groups["soi"] = [];
        }
        if (!groups["soi"].some((p) => p.id === player.id)) {
          groups["soi"].push(player);
        }
      }

      // If cursed on a previous day, player gets added to wolf group as well
      if (cursedPlayerIds.has(player.id)) {
        if (!groups["soi"]) {
          groups["soi"] = [];
        }
        if (!groups["soi"].some((p) => p.id === player.id)) {
          groups["soi"].push(player);
        }
      }
    }
    return groups;
  }, [players, orphanMotherDead, cursedPlayerIds]);

  const roleNames = useMemo(() => {
    const definedOrder = ROLES.map((r) => r.name);
    return Object.keys(grouped).sort(
      (a, b) => definedOrder.indexOf(a as RoleName) - definedOrder.indexOf(b as RoleName)
    );
  }, [grouped]);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold mb-4">Danh sách Role</h2>

      {roleNames.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có người chơi nào
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {roleNames.map((roleName) => {
            const roleConfig = ROLE_MAP[roleName as RoleName];
            if (!roleConfig) return null;
            const Icon = roleConfig.icon;
            const rolePlayers = grouped[roleName];
            const aliveCount = rolePlayers.filter((p) => !deadPlayerIds.has(p.id)).length;

            return (
              <div
                key={roleName}
                className="rounded-lg border bg-secondary/50 p-3 sm:p-4 transition-colors duration-150 hover:bg-secondary/70 cursor-pointer"
                onClick={() => onEditRole(roleName as RoleName)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="font-medium text-sm sm:text-base">
                      {roleConfig.label}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ({aliveCount})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {rolePlayers.map((player) => {
                    const isDead = deadPlayerIds.has(player.id);
                    return (
                      <span
                        key={player.id}
                        className={`inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-xs sm:text-sm font-medium ${
                          isDead
                            ? "text-muted-foreground line-through opacity-60"
                            : "text-primary"
                        }`}
                      >
                        {player.name || "Chưa đặt tên"}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
