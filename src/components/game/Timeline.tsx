"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_MAP } from "@/lib/roles";
import type { Player, Timeline as TimelineType, RoleName } from "@/lib/types";

interface TimelineProps {
  players: Player[];
  timelines: TimelineType[];
  currentDay: number;
  setCurrentDay: (day: number) => void;
  advanceDay: () => void;
}

export function TimelineTable({
  players,
  timelines,
  currentDay,
  setCurrentDay,
  advanceDay,
}: TimelineProps) {
  // Get unique roles present in the game
  const roles = useMemo(() => {
    const roleSet = new Set(players.map((p) => p.role));
    return Array.from(roleSet);
  }, [players]);

  // Get all days sorted
  const days = useMemo(() => {
    return timelines.map((t) => t.day).sort((a, b) => a - b);
  }, [timelines]);

  // Build lookup: day -> role -> actions
  const actionMap = useMemo(() => {
    const map: Record<number, Record<string, string[]>> = {};
    for (const timeline of timelines) {
      map[timeline.day] = {};
      for (const action of timeline.actions) {
        const roleName = action.role as RoleName;
        const roleConfig = ROLE_MAP[roleName];
        if (!roleConfig) continue;

        const actionConfig = roleConfig.actions.find(
          (a) => a.action === action.action
        );
        const label = actionConfig?.label || action.action;
        const targetName =
          action.target ||
          (players.find((p) => p.id === action.target)?.name ?? "");
        const desc = targetName ? `${label} → ${targetName}` : label;

        if (!map[timeline.day][action.role]) {
          map[timeline.day][action.role] = [];
        }
        map[timeline.day][action.role].push(desc);
      }
    }
    return map;
  }, [timelines, players]);

  const handlePrevDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevDay}
            disabled={currentDay <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2">Ngày {currentDay}</span>
          <Button variant="outline" size="icon" onClick={advanceDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b">
              <th className="text-left p-3 font-medium text-muted-foreground w-20">
                Ngày
              </th>
              {roles.map((roleName) => {
                const roleConfig = ROLE_MAP[roleName as RoleName];
                if (!roleConfig) return null;
                return (
                  <th
                    key={roleName}
                    className="text-left p-3 font-medium text-muted-foreground"
                  >
                    <div className="flex items-center gap-1.5">
                      <roleConfig.icon className="h-4 w-4" />
                      <span>{roleConfig.label}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {days.length === 0 ? (
              <tr>
                <td
                  colSpan={roles.length + 1}
                  className="text-center p-8 text-muted-foreground"
                >
                  Chưa có hoạt động nào
                </td>
              </tr>
            ) : (
              days.map((day) => (
                <tr
                  key={day}
                  className={`border-b last:border-0 ${
                    day === currentDay ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="p-3 font-medium">Ngày {day}</td>
                  {roles.map((roleName) => {
                    const dayActions = actionMap[day]?.[roleName] || [];
                    return (
                      <td key={roleName} className="p-3">
                        {dayActions.length > 0 ? (
                          <ul className="space-y-1">
                            {dayActions.map((desc, i) => (
                              <li key={i} className="text-xs text-muted-foreground">
                                {desc}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
