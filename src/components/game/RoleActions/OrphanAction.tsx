"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface OrphanActionProps {
  actorId: string;
}

export function OrphanAction({ actorId }: OrphanActionProps) {
  const { players, currentDay, timelines, roleStates, addAction } = useGameStore();
  const [target, setTarget] = useState("");
  const used = roleStates["mo_coi"]?.["nhan_me"] ?? false;

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "nhan_me"
  );

  const otherPlayers = players.filter((p) => p.id !== actorId);

  const handleSave = () => {
    if (used || !target) return;
    addAction({
      role: "mo_coi",
      actor: actorId,
      action: "nhan_me",
      target,
      day: currentDay,
    });
  };

  if (used || existingAction) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Đã dùng</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Chọn mẹ</label>
        <Select
          value={target}
          onValueChange={setTarget}
          options={otherPlayers.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Chọn người chơi"
          className="mt-1"
        />
      </div>
      <Button size="sm" onClick={handleSave} disabled={!target}>
        Nhận mẹ
      </Button>
    </div>
  );
}
