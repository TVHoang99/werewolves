"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/lib/store";
import { calculateDeadPlayerIds } from "@/lib/gameUtils";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface WolfActionProps {
  actorId: string;
}

export function WolfAction({ actorId }: WolfActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } = useGameStore();
  const [targetId, setTargetId] = useState("");

  // Calculate dead player IDs (only from previous days)
  const deadPlayerIds = useMemo(() => {
    return calculateDeadPlayerIds(players, timelines, currentDay);
  }, [players, timelines, currentDay]);

  // Exclude self and dead players from targets
  const availableTargets = useMemo(() => {
    return players.filter((p) => p.id !== actorId && !deadPlayerIds.has(p.id));
  }, [players, actorId, deadPlayerIds]);

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "can"
  );

  const handleSave = () => {
    if (!targetId) return;
    addAction({
      role: "soi",
      actor: actorId,
      action: "can",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  const handleRemove = () => {
    removeAction("soi", actorId, "can", currentDay);
    setTargetId("");
  };

  const targetPlayer = existingAction
    ? players.find((p) => p.id === existingAction.target)
    : null;

  return (
    <div className="space-y-3">
      {existingAction && (
        <div className="flex items-center justify-between rounded bg-muted/40 p-2 text-sm">
          <span>
            Đã cắn: <span className="font-semibold text-red-400">{targetPlayer?.name ?? "Không rõ"}</span>
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
          options={availableTargets.map((p) => ({ value: p.id, label: p.name }))}
          placeholder={existingAction ? "Chọn lại mục tiêu cắn..." : "Chọn mục tiêu..."}
        />
        <Button size="sm" onClick={handleSave} disabled={!targetId}>
          {existingAction ? "Cập nhật" : "Lưu"}
        </Button>
      </div>
    </div>
  );
}
