"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_MAP } from "@/lib/roles";
import type { Player, Timeline as TimelineType, RoleName, RoleAction } from "@/lib/types";

interface TimelineProps {
  players: Player[];
  timelines: TimelineType[];
  currentDay: number;
  setCurrentDay: (day: number) => void;
  advanceDay: () => void;
}

function formatAction(
  action: RoleAction,
  players: Player[],
  timelines: TimelineType[] = [],
  day?: number
): string {
  const role = action.role as RoleName;
  const targetName = (id: string) =>
    players.find((p) => p.id === id)?.name ?? "???";

  switch (role) {
    case "soi":
      if (action.action === "can" && action.target)
        return `Cắn → ${targetName(action.target)}`;
      break;
    case "soi_nguyen":
      if (action.action === "nguyen" && action.target)
        return `Nguyền → ${targetName(action.target)}`;
      break;
    case "cupid":
      if (action.action === "ghep_doi" && action.target && action.target2)
        return `Ghép đôi: ${targetName(action.target)} & ${targetName(action.target2)}`;
      break;
    case "tho_san":
      if (action.action === "san_cung" && action.target)
        return `Săn cùng → ${targetName(action.target)}`;
      break;
    case "bao_ve":
      if (action.action === "bao_ve" && action.target)
        return `Bảo vệ → ${targetName(action.target)}`;
      break;
    case "phu_thuy":
      if (action.action === "cuu") {
        // Tìm người bị sói cắn trong ngày này
        const targetDay = day ?? action.day;
        const wolfBite = timelines
          .find((t) => t.day === targetDay)
          ?.actions.find((a) => a.role === "soi" && a.action === "can");
        if (wolfBite?.target) {
          return `Cứu → ${targetName(wolfBite.target)}`;
        }
        return "Cứu";
      }
      if (action.action === "giet" && action.target)
        return `Giết → ${targetName(action.target)}`;
      break;
    case "mo_coi":
      if (action.action === "nhan_me") {
        if (action.target) return `Nhận mẹ → ${targetName(action.target)}`;
        return "Nhận mẹ";
      }
      break;
    case "dan_lang":
      if (action.action === "vote" && action.target)
        return `Vote: ${targetName(action.target)}`;
      break;
    default:
      break;
  }

  const roleConfig = ROLE_MAP[role];
  const actionConfig = roleConfig?.actions.find((a) => a.action === action.action);
  const label = actionConfig?.label ?? action.action;
  if (action.target) return `${label} → ${targetName(action.target)}`;
  return label;
}

export function TimelineTable({
  players,
  timelines,
  currentDay,
  setCurrentDay,
  advanceDay,
}: TimelineProps) {
  const roles = useMemo(() => {
    const roleSet = new Set(players.map((p) => p.role));
    return Array.from(roleSet) as RoleName[];
  }, [players]);

  const days = useMemo(() => {
    return timelines.map((t) => t.day).sort((a, b) => a - b);
  }, [timelines]);

  // Map: "role|action" → first day it was used
  const firstUsedDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const timeline of timelines) {
      for (const action of timeline.actions) {
        const key = `${action.role}|${action.action}`;
        if (!map.has(key)) {
          map.set(key, timeline.day);
        }
      }
    }
    return map;
  }, [timelines]);

  // Set of one-time action keys
  const oneTimeActions = useMemo(() => {
    const set = new Set<string>();
    for (const role of Object.values(ROLE_MAP)) {
      for (const action of role.actions) {
        if (action.limit === 1) {
          set.add(`${role.name}|${action.action}`);
        }
      }
    }
    return set;
  }, []);

  // Build lookup: day → role → actions (formatted)
  const actionMap = useMemo(() => {
    const map: Record<number, Record<string, string[]>> = {};
    for (const timeline of timelines) {
      map[timeline.day] = {};
      for (const action of timeline.actions) {
        const roleName = action.role as RoleName;
        if (!map[timeline.day][roleName]) {
          map[timeline.day][roleName] = [];
        }
        map[timeline.day][roleName].push(formatAction(action, players, timelines, timeline.day));
      }
    }
    return map;
  }, [timelines, players]);

  const handlePrevDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  // Calculate deaths for a given day
  function getDeaths(day: number): string[] {
    const dayTimeline = timelines.find((t) => t.day === day);
    if (!dayTimeline) return [];

    const deaths: string[] = [];
    const targetName = (id: string) =>
      players.find((p) => p.id === id)?.name ?? "???";

    const actions = dayTimeline.actions;

    // Find wolf bite target
    const wolfBite = actions.find((a) => a.role === "soi" && a.action === "can");
    // Find guard protection
    const guardProtect = actions.find((a) => a.role === "bao_ve" && a.action === "bao_ve");
    // Find witch save
    const witchSave = actions.find((a) => a.role === "phu_thuy" && a.action === "cuu");
    // Find witch kill
    const witchKill = actions.find((a) => a.role === "phu_thuy" && a.action === "giet");
    // Find hunter shoot
    const hunterShoot = actions.find((a) => a.role === "tho_san" && a.action === "san_cung");

    // Wolf bite victim dies unless protected or saved
    if (wolfBite?.target) {
      const isProtected = guardProtect?.target === wolfBite.target;
      const isSaved = witchSave; // Witch save saves the wolf bite victim
      if (!isProtected && !isSaved) {
        deaths.push(targetName(wolfBite.target));
      }
    }

    // Witch kill victim dies
    if (witchKill?.target) {
      deaths.push(targetName(witchKill.target));
    }

    // Hunter shoot victim dies
    if (hunterShoot?.target) {
      deaths.push(targetName(hunterShoot.target));
    }

    // Vote results - most votes = death
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
        deaths.push(targetName(maxVotedId));
      }
    }

    return deaths;
  }

  // Determine text color based on action type
  function getActionColor(desc: string): string {
    if (desc.startsWith("Cắn") || desc.startsWith("Giết")) {
      return "text-red-400";
    }
    if (desc.startsWith("Nguyền")) {
      return "text-orange-400";
    }
    if (desc.startsWith("Cứu")) {
      return "text-green-400";
    }
    if (desc.startsWith("Bảo vệ")) {
      return "text-blue-400";
    }
    if (desc.startsWith("Săn cùng")) {
      return "text-yellow-400";
    }
    if (desc.startsWith("Ghép đôi")) {
      return "text-pink-400";
    }
    if (desc.startsWith("Nhận mẹ")) {
      return "text-purple-400";
    }
    if (desc.startsWith("Vote")) {
      return "text-red-400";
    }
    return "text-muted-foreground";
  }

  // For a given day and role, get the cell content including one-time lock logic
  function getCellContent(day: number, roleName: RoleName): string[] {
    const roleConfig = ROLE_MAP[roleName];
    if (!roleConfig || roleConfig.actions.length === 0) return [];

    const dayActions = actionMap[day]?.[roleName] || [];
    const result: string[] = [];

    for (const actionConfig of roleConfig.actions) {
      const key = `${roleName}|${actionConfig.action}`;
      const isOneTime = actionConfig.limit === 1;

      if (isOneTime) {
        const usedDay = firstUsedDay.get(key);
        if (usedDay !== undefined) {
          if (usedDay === day) {
            // This day has the action - show formatted description
            const found = timelines
              .find((t) => t.day === day)
              ?.actions.find(
                (a) => a.role === roleName && a.action === actionConfig.action
              );
            if (found) {
              result.push(formatAction(found, players, timelines, day));
            }
          } else {
            // Used on a previous day - show lock
            result.push("Đã dùng");
          }
        }
        // If not used yet on any day, don't show anything (will be triggered by action panel)
      } else {
        // Unlimited actions - show existing actions for this role
        // For vote action, show on all days after it was first used
        if (actionConfig.action === "vote") {
          const usedDay = firstUsedDay.get(key);
          if (usedDay !== undefined) {
            if (usedDay === day) {
              // This day has the action - show formatted description
              const found = timelines
                .find((t) => t.day === day)
                ?.actions.find(
                  (a) => a.role === roleName && a.action === actionConfig.action
                );
              if (found) {
                result.push(formatAction(found, players, timelines, day));
              }
            } else {
              // Used on a previous day - show with strikethrough
              const found = timelines
                .find((t) => t.day === usedDay)
                ?.actions.find(
                  (a) => a.role === roleName && a.action === actionConfig.action
                );
              if (found) {
                result.push(formatAction(found, players, timelines, usedDay));
              }
            }
          }
        } else {
          // Other unlimited actions - show existing actions for this role
          const matching = timelines
            .find((t) => t.day === day)
            ?.actions.filter(
              (a) => a.role === roleName && a.action === actionConfig.action
            );
          if (matching) {
            for (const m of matching) {
              const desc = formatAction(m, players, timelines, day);
              if (!result.includes(desc)) {
                result.push(desc);
              }
            }
          }
        }
      }
    }

    // For roles with no configured actions (dan_lang, role_tuy_chinh), show existing actions
    if (roleConfig.actions.length === 0 && dayActions.length > 0) {
      return dayActions;
    }

    // If no one-time used and no unlimited actions, return what we have
    if (result.length === 0 && roleConfig.actions.length > 0) {
      return dayActions;
    }

    return result.length > 0 ? result : dayActions;
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden">
      <div className="p-3 sm:p-4 border-b flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold">Timeline</h2>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevDay}
            disabled={currentDay <= 1}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm font-medium px-1 sm:px-2">Ngày {currentDay}</span>
          <Button variant="outline" size="icon" onClick={advanceDay} className="h-8 w-8 sm:h-10 sm:w-10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px] sm:max-h-[500px]">
        <table className="w-full text-xs sm:text-sm">
          <thead className="sticky top-0 bg-card z-20">
            <tr className="border-b">
              <th className="text-left p-2 sm:p-3 font-medium text-muted-foreground w-20 sm:w-24 sticky left-0 bg-card z-30 border-r">
                Ngày
              </th>
              {roles.map((roleName) => {
                const roleConfig = ROLE_MAP[roleName];
                if (!roleConfig) return null;
                return (
                  <th
                    key={roleName}
                    className="text-left p-2 sm:p-3 font-medium text-muted-foreground whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <roleConfig.icon className="h-3 w-3 sm:h-4 sm:w-4" />
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
                  className="text-center p-6 sm:p-8 text-muted-foreground"
                >
                  Chưa có hoạt động nào
                </td>
              </tr>
            ) : (
              days.map((day) => {
                const isCurrentDay = day === currentDay;
                return (
                  <tr
                    key={day}
                    onClick={() => setCurrentDay(day)}
                    className={`border-b last:border-0 cursor-pointer transition-colors duration-150 ${
                      isCurrentDay
                        ? "bg-primary/10 font-medium"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <td
                      className={`p-2 sm:p-3 font-medium sticky left-0 z-10 border-r ${
                        isCurrentDay ? "bg-primary/10" : "bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        {isCurrentDay && (
                          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary inline-block" />
                        )}
                        <span className="hidden sm:inline">Ngày {day}</span>
                        <span className="sm:hidden">N{day}</span>
                      </div>
                    </td>
                    {roles.map((roleName) => {
                      const cellContent = getCellContent(day, roleName);
                      return (
                        <td key={roleName} className="p-2 sm:p-3">
                          {cellContent.length > 0 ? (
                            <ul className="space-y-0.5 sm:space-y-1">
                              {cellContent.map((desc, i) => (
                                <li
                                  key={i}
                                  className={`text-[10px] sm:text-xs ${
                                    desc === "Đã dùng"
                                      ? "text-muted-foreground/60 italic"
                                      : desc.startsWith("Vote:")
                                        ? "text-red-400 font-medium line-through"
                                        : getActionColor(desc)
                                  }`}
                                >
                                  {desc}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[10px] sm:text-xs text-muted-foreground/50">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      {(() => {
                        const deaths = getDeaths(day);
                        if (deaths.length === 0) return null;
                        return (
                          <span className="text-[10px] sm:text-xs text-red-400 font-medium">
                            Chết: {deaths.join(", ")}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
