"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/lib/store";
import { ROLE_MAP } from "@/lib/roles";
import type { RoleName } from "@/lib/types";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AlphaWolfActionProps {
  actorId: string;
}

export function AlphaWolfAction({ actorId }: AlphaWolfActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } =
    useGameStore();
  const [targetId, setTargetId] = useState("");

  const cursedPlayerIds = useMemo(() => {
    const set = new Set<string>();
    for (const t of timelines) {
      if (t.day >= currentDay) continue;
      for (const a of t.actions) {
        if (a.role === "soi_nguyen" && a.action === "nguyen" && a.target) {
          set.add(a.target);
        }
      }
    }
    return set;
  }, [timelines, currentDay]);

  const validTargets = players.filter((p) => {
    const roleConfig = ROLE_MAP[p.role as RoleName];
    if (roleConfig?.isWolf) return false;
    if (cursedPlayerIds.has(p.id)) return false;
    return true;
  });

  const usedInPreviousDay = timelines.some(
    (t) =>
      t.day < currentDay &&
      t.actions.some((a) => a.role === "soi_nguyen" && a.action === "nguyen")
  );

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "nguyen"
  );

  const handleSave = () => {
    if (!targetId || usedInPreviousDay) return;
    addAction({
      role: "soi_nguyen",
      actor: actorId,
      action: "nguyen",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  const handleRemove = () => {
    removeAction("soi_nguyen", actorId, "nguyen", currentDay);
    setTargetId("");
  };

  if (usedInPreviousDay) {
    // Find target from previous days
    let targetPlayerName = "";
    for (const t of timelines) {
      if (t.day >= currentDay) break;
      const found = t.actions.find((a) => a.role === "soi_nguyen" && a.action === "nguyen");
      if (found?.target) {
        targetPlayerName = players.find((p) => p.id === found.target)?.name ?? "";
      }
    }
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Đã sử dụng ở ngày trước</p>
        {targetPlayerName && (
          <p className="text-xs text-muted-foreground">
            Đã nguyền: <span className="font-semibold text-foreground">{targetPlayerName}</span>
          </p>
        )}
      </div>
    );
  }

  const currentTargetPlayer = existingAction
    ? players.find((p) => p.id === existingAction.target)
    : null;

  return (
    <div className="space-y-3">
      {existingAction && (
        <div className="flex items-center justify-between rounded bg-muted/40 p-2 text-sm">
          <span>
            Đã nguyền: <span className="font-semibold text-orange-400">{currentTargetPlayer?.name ?? "Không rõ"}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleRemove} className="h-7 text-xs text-destructive">
            Hủy chọn
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Select
          value={targetId}
          onValueChange={setTargetId}
          options={validTargets.map((p) => ({ value: p.id, label: p.name }))}
          placeholder={existingAction ? "Chọn lại mục tiêu nguyền..." : "Chọn mục tiêu..."}
        />
        <Button size="sm" onClick={handleSave} disabled={!targetId}>
          {existingAction ? "Cập nhật" : "Lưu"}
        </Button>
      </div>
    </div>
  );
}

