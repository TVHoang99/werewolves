"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CupidActionProps {
  actorId: string;
}

export function CupidAction({ actorId }: CupidActionProps) {
  const { players, currentDay, timelines, roleStates, addAction } =
    useGameStore();
  const [targetA, setTargetA] = useState("");
  const [targetB, setTargetB] = useState("");

  const otherPlayers = players.filter((p) => p.id !== actorId);
  const used = roleStates["cupid"]?.["ghep_doi"] ?? false;

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "ghep_doi"
  );

  const handleSave = () => {
    if (!targetA || !targetB || used) return;
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

  if (used || existingAction) {
    const playerA = existingAction
      ? players.find((p) => p.id === existingAction.target)
      : null;
    const playerB = existingAction
      ? players.find((p) => p.id === existingAction.target2)
      : null;
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Đã dùng</p>
        {playerA && playerB && (
          <p className="text-sm text-muted-foreground">
            Đã ghép đôi:{" "}
            <span className="font-medium text-foreground">
              {playerA.name}
            </span>{" "}
            &{" "}
            <span className="font-medium text-foreground">
              {playerB.name}
            </span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={targetA}
        onValueChange={setTargetA}
        options={otherPlayers.map((p) => ({ value: p.id, label: p.name }))}
        placeholder="Chọn người chơi A..."
      />
      <Select
        value={targetB}
        onValueChange={setTargetB}
        options={otherPlayers.filter((p) => p.id !== targetA).map((p) => ({ value: p.id, label: p.name }))}
        placeholder="Chọn người chơi B..."
      />
      <Button size="sm" onClick={handleSave} disabled={!targetA || !targetB}>
        Lưu
      </Button>
    </div>
  );
}