"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface HunterActionProps {
  actorId: string;
}

export function HunterAction({ actorId }: HunterActionProps) {
  const { players, currentDay, timelines, addAction } = useGameStore();
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

  if (existingAction) {
    const targetPlayer = players.find((p) => p.id === existingAction.target);
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Đã chọn: <span className="font-medium text-foreground">{targetPlayer?.name ?? "Không rõ"}</span>
        </p>
        <Button variant="outline" size="sm" onClick={handleSave} disabled={!targetId}>
          Cập nhật
        </Button>
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