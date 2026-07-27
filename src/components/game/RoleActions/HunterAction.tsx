"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface HunterActionProps {
  actorId: string;
}

export function HunterAction({ actorId }: HunterActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } = useGameStore();
  const [targetId, setTargetId] = useState("");

  const otherPlayers = players.filter((p) => p.id !== actorId);

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "san_cung"
  );

  const handleSave = () => {
    if (!targetId) return;
    addAction({
      role: "tho_san",
      actor: actorId,
      action: "san_cung",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  const handleRemove = () => {
    removeAction("tho_san", actorId, "san_cung", currentDay);
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
            Đã chọn săn cùng: <span className="font-semibold text-yellow-400">{targetPlayer?.name ?? "Không rõ"}</span>
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
          options={otherPlayers.map((p) => ({ value: p.id, label: p.name }))}
          placeholder={existingAction ? "Chọn lại người săn cùng..." : "Chọn mục tiêu..."}
        />
        <Button size="sm" onClick={handleSave} disabled={!targetId}>
          {existingAction ? "Cập nhật" : "Lưu"}
        </Button>
      </div>
    </div>
  );
}