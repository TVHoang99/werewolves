"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface WitchActionProps {
  actorId: string;
}

export function WitchAction({ actorId }: WitchActionProps) {
  const { players, currentDay, timelines, roleStates, addAction } =
    useGameStore();
  const [targetId, setTargetId] = useState("");

  const otherPlayers = players.filter((p) => p.id !== actorId);
  const usedCuu = roleStates["phu_thuy"]?.["cuu"] ?? false;
  const usedGiet = roleStates["phu_thuy"]?.["giet"] ?? false;

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingCuu = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "cuu"
  );
  const existingGiet = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "giet"
  );

  // Check if guard protected the wolf bite victim
  const dayTimeline = timelines.find((t) => t.day === currentDay);
  const wolfBite = dayTimeline?.actions.find(
    (a) => a.role === "soi" && a.action === "can"
  );
  const guardProtect = dayTimeline?.actions.find(
    (a) => a.role === "bao_ve" && a.action === "bao_ve"
  );
  const guardProtectedWolfVictim =
    wolfBite?.target && guardProtect?.target === wolfBite.target;

  // Get wolf bite victim name
  const wolfBiteVictimName = wolfBite?.target
    ? players.find((p) => p.id === wolfBite.target)?.name
    : null;

  const handleCuu = () => {
    if (usedCuu || guardProtectedWolfVictim) return;
    addAction({
      role: "phu_thuy",
      actor: actorId,
      action: "cuu",
      day: currentDay,
    });
  };

  const handleGiet = () => {
    if (!targetId || usedGiet) return;
    addAction({
      role: "phu_thuy",
      actor: actorId,
      action: "giet",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  return (
    <div className="space-y-4">
      {/* Cứu action */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Cứu {wolfBiteVictimName && <span className="text-muted-foreground">→ {wolfBiteVictimName}</span>}
        </p>
        {usedCuu || existingCuu ? (
          <p className="text-sm text-muted-foreground">Đã dùng</p>
        ) : guardProtectedWolfVictim ? (
          <p className="text-sm text-green-400">Bảo vệ đã cứu</p>
        ) : wolfBiteVictimName ? (
          <Button size="sm" onClick={handleCuu}>
            Cứu {wolfBiteVictimName}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có người bị cắn</p>
        )}
      </div>

      {/* Giết action */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Giết</p>
        {usedGiet || existingGiet ? (
          <p className="text-sm text-muted-foreground">Đã dùng</p>
        ) : (
          <>
            <Select
              value={targetId}
              onValueChange={setTargetId}
              options={otherPlayers.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Chọn mục tiêu..."
            />
            <Button size="sm" onClick={handleGiet} disabled={!targetId}>
              Lưu
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
