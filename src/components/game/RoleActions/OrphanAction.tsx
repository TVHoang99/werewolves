"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface OrphanActionProps {
  actorId: string;
}

export function OrphanAction({ actorId }: OrphanActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } = useGameStore();
  const [target, setTarget] = useState("");

  const usedInPreviousDay = timelines.some(
    (t) =>
      t.day < currentDay &&
      t.actions.some((a) => a.role === "mo_coi" && a.action === "nhan_me")
  );

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "nhan_me"
  );

  const otherPlayers = players.filter((p) => p.id !== actorId);

  const handleSave = () => {
    if (usedInPreviousDay || !target) return;
    addAction({
      role: "mo_coi",
      actor: actorId,
      action: "nhan_me",
      target,
      day: currentDay,
    });
    setTarget("");
  };

  const handleRemove = () => {
    removeAction("mo_coi", actorId, "nhan_me", currentDay);
    setTarget("");
  };

  if (usedInPreviousDay) {
    let motherName = "";
    for (const t of timelines) {
      if (t.day >= currentDay) break;
      const found = t.actions.find((a) => a.role === "mo_coi" && a.action === "nhan_me");
      if (found?.target) {
        motherName = players.find((p) => p.id === found.target)?.name ?? "";
      }
    }
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Đã sử dụng ở ngày trước</p>
        {motherName && (
          <p className="text-xs text-muted-foreground">
            Đã nhận mẹ: <span className="font-semibold text-foreground">{motherName}</span>
          </p>
        )}
      </div>
    );
  }

  const motherPlayer = existingAction
    ? players.find((p) => p.id === existingAction.target)
    : null;

  return (
    <div className="space-y-3">
      {existingAction && (
        <div className="flex items-center justify-between rounded bg-muted/40 p-2 text-sm">
          <span>
            Đã nhận mẹ: <span className="font-semibold text-purple-400">{motherPlayer?.name ?? "Không rõ"}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleRemove} className="h-7 text-xs text-destructive">
            Hủy chọn
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Select
          value={target}
          onValueChange={setTarget}
          options={otherPlayers.map((p) => ({ value: p.id, label: p.name }))}
          placeholder={existingAction ? "Chọn lại người làm mẹ..." : "Chọn người chơi làm mẹ..."}
        />
        <Button size="sm" onClick={handleSave} disabled={!target}>
          {existingAction ? "Cập nhật" : "Nhận mẹ"}
        </Button>
      </div>
    </div>
  );
}
