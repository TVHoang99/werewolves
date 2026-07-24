"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AlphaWolfActionProps {
  actorId: string;
}

export function AlphaWolfAction({ actorId }: AlphaWolfActionProps) {
  const { players, currentDay, timelines, roleStates, addAction } =
    useGameStore();
  const [targetId, setTargetId] = useState("");

  const otherPlayers = players.filter((p) => p.id !== actorId);
  const used = roleStates["soi_nguyen"]?.["nguyen"] ?? false;

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "nguyen"
  );

  const handleSave = () => {
    if (!targetId || used) return;
    addAction({
      role: "soi_nguyen",
      actor: actorId,
      action: "nguyen",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  if (used || existingAction) {
    const targetPlayer = existingAction
      ? players.find((p) => p.id === existingAction.target)
      : null;
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Đã dùng</p>
        {targetPlayer && (
          <p className="text-sm text-muted-foreground">
            Mục tiêu: <span className="font-medium text-foreground">{targetPlayer.name}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={targetId}
        onValueChange={setTargetId}
        options={otherPlayers.map((p) => ({ value: p.id, label: p.name }))}
        placeholder="Chọn mục tiêu..."
      />
      <Button size="sm" onClick={handleSave} disabled={!targetId}>
        Lưu
      </Button>
    </div>
  );
}
