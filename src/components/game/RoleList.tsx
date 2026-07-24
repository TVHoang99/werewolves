"use client";

import { useMemo } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_MAP } from "@/lib/roles";
import type { Player, RoleName } from "@/lib/types";

interface RoleListProps {
  players: Player[];
  deadPlayerIds: Set<string>;
  onEditRole: (roleName: RoleName) => void;
}

export function RoleList({ players, deadPlayerIds, onEditRole }: RoleListProps) {
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
        groups["soi"].push(player);
      }
    }
    return groups;
  }, [players]);

  const roleNames = Object.keys(grouped);

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

            return (
              <div
                key={roleName}
                className="rounded-lg border bg-secondary/50 p-3 sm:p-4 transition-colors duration-150 hover:bg-secondary/70"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="font-medium text-sm sm:text-base">
                      {roleConfig.label}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ({rolePlayers.length})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRole(roleName as RoleName)}
                    className="h-8"
                  >
                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Sửa
                  </Button>
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
