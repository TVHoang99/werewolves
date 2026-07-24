"use client";

import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface OrphanActionProps {
  actorId: string;
}

export function OrphanAction({ actorId }: OrphanActionProps) {
  const { currentDay, timelines, roleStates, addAction } = useGameStore();
  const used = roleStates["mo_coi"]?.["nhan_me"] ?? false;

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "nhan_me"
  );

  const handleSave = () => {
    if (used) return;
    addAction({
      role: "mo_coi",
      actor: actorId,
      action: "nhan_me",
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
    <div className="space-y-2">
      <Button size="sm" onClick={handleSave}>
        Nhận mẹ
      </Button>
    </div>
  );
}