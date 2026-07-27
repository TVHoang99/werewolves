"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CupidActionProps {
  actorId: string;
}

export function CupidAction({ actorId }: CupidActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } =
    useGameStore();
  const [targetA, setTargetA] = useState("");
  const [targetB, setTargetB] = useState("");

  const usedInPreviousDay = timelines.some(
    (t) =>
      t.day < currentDay &&
      t.actions.some((a) => a.role === "cupid" && a.action === "ghep_doi")
  );

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "ghep_doi"
  );

  const handleSave = () => {
    if (!targetA || !targetB || usedInPreviousDay) return;
    addAction({
      role: "cupid",
      actor: actorId,
      action: "ghep_doi",
      target: targetA,
      target2: targetB,
      day: currentDay,
    });
    setTargetA("");
    setTargetB("");
  };

  const handleRemove = () => {
    removeAction("cupid", actorId, "ghep_doi", currentDay);
    setTargetA("");
    setTargetB("");
  };

  if (usedInPreviousDay) {
    let pairNames = "";
    for (const t of timelines) {
      if (t.day >= currentDay) break;
      const found = t.actions.find((a) => a.role === "cupid" && a.action === "ghep_doi");
      if (found?.target && found?.target2) {
        const nameA = players.find((p) => p.id === found.target)?.name ?? "";
        const nameB = players.find((p) => p.id === found.target2)?.name ?? "";
        pairNames = `${nameA} & ${nameB}`;
      }
    }
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Đã sử dụng ở ngày trước</p>
        {pairNames && (
          <p className="text-xs text-muted-foreground">
            Đã ghép đôi: <span className="font-semibold text-foreground">{pairNames}</span>
          </p>
        )}
      </div>
    );
  }

  const playerA = existingAction
    ? players.find((p) => p.id === existingAction.target)
    : null;
  const playerB = existingAction
    ? players.find((p) => p.id === existingAction.target2)
    : null;

  return (
    <div className="space-y-3">
      {existingAction && playerA && playerB && (
        <div className="flex items-center justify-between rounded bg-muted/40 p-2 text-sm">
          <span>
            Đã ghép đôi: <span className="font-semibold text-pink-400">{playerA.name} & {playerB.name}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleRemove} className="h-7 text-xs text-destructive">
            Hủy chọn
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Select
          value={targetA}
          onValueChange={setTargetA}
          options={players.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Chọn người chơi A..."
        />
        <Select
          value={targetB}
          onValueChange={setTargetB}
          options={players.filter((p) => p.id !== targetA).map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Chọn người chơi B..."
        />
        <Button size="sm" onClick={handleSave} disabled={!targetA || !targetB}>
          {existingAction ? "Cập nhật" : "Lưu"}
        </Button>
      </div>
    </div>
  );
}