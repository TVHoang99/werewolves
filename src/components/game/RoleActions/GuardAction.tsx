"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface GuardActionProps {
  actorId: string;
}

export function GuardAction({ actorId }: GuardActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } = useGameStore();
  const [targetId, setTargetId] = useState("");

  const availablePlayers = players;

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "bao_ve"
  );

  const handleSave = () => {
    if (!targetId) return;
    addAction({
      role: "bao_ve",
      actor: actorId,
      action: "bao_ve",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  const handleRemove = () => {
    removeAction("bao_ve", actorId, "bao_ve", currentDay);
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
            Đã bảo vệ: <span className="font-semibold text-blue-400">{targetPlayer?.name ?? "Không rõ"}</span>
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
          options={availablePlayers.map((p) => ({
            value: p.id,
            label: p.id === actorId ? `${p.name} (Bản thân)` : p.name,
          }))}
          placeholder={existingAction ? "Chọn lại mục tiêu bảo vệ..." : "Chọn mục tiêu..."}
        />
        <Button size="sm" onClick={handleSave} disabled={!targetId}>
          {existingAction ? "Cập nhật" : "Lưu"}
        </Button>
      </div>
    </div>
  );
}