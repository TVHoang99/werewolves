"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/lib/store";
import { ROLE_MAP } from "@/lib/roles";
import type { RoleName } from "@/lib/types";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SeerActionProps {
  actorId: string;
}

export function SeerAction({ actorId }: SeerActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } = useGameStore();
  const [targetId, setTargetId] = useState("");

  // Targets inspected in previous days (cannot be inspected again)
  const inspectedPreviousTargetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const timeline of timelines) {
      if (timeline.day >= currentDay) continue;
      for (const action of timeline.actions) {
        if (action.role === "tien_tri" && action.action === "soi" && action.target) {
          ids.add(action.target);
        }
      }
    }
    return ids;
  }, [timelines, currentDay]);

  // Players eligible to be inspected on current day
  const availablePlayers = useMemo(() => {
    return players.filter(
      (p) => p.id !== actorId && !inspectedPreviousTargetIds.has(p.id)
    );
  }, [players, actorId, inspectedPreviousTargetIds]);

  const currentDayActions =
    timelines.find((t) => t.day === currentDay)?.actions ?? [];
  const existingAction = currentDayActions.find(
    (a) => a.actor === actorId && a.action === "soi"
  );

  const handleSave = () => {
    if (!targetId) return;
    addAction({
      role: "tien_tri",
      actor: actorId,
      action: "soi",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  const handleRemove = () => {
    removeAction("tien_tri", actorId, "soi", currentDay);
    setTargetId("");
  };

  const cursedPlayerIds = useMemo(() => {
    const set = new Set<string>();
    for (const t of timelines) {
      if (t.day >= currentDay) continue;
      for (const a of t.actions) {
        if (a.role === "soi_nguyen" && a.action === "nguyen" && a.target) {
          set.add(a.target);
        }
      }
    }
    return set;
  }, [timelines, currentDay]);

  const getFactionText = (player: typeof players[0]) => {
    const roleConfig = ROLE_MAP[player.role as RoleName];
    const isWolf = roleConfig?.isWolf || cursedPlayerIds.has(player.id);
    return isWolf ? "Phe Sói" : "Phe Dân";
  };

  const selectedPreviewPlayer = targetId
    ? players.find((p) => p.id === targetId)
    : null;

  return (
    <div className="space-y-3">
      {existingAction && (
        <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Kết quả soi ngày hôm nay:</p>
            <Button variant="ghost" size="sm" onClick={handleRemove} className="h-6 text-xs text-destructive">
              Hủy soi
            </Button>
          </div>
          {(() => {
            const targetPlayer = players.find((p) => p.id === existingAction.target);
            if (!targetPlayer) return <p className="text-sm font-medium">Không rõ</p>;
            const faction = getFactionText(targetPlayer);
            const isWolf = faction === "Phe Sói";
            return (
              <p className="text-sm font-medium">
                {targetPlayer.name} →{" "}
                <span className={isWolf ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                  {faction}
                </span>
              </p>
            );
          })()}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {existingAction ? "Thay đổi người cần soi:" : "Chọn người chơi để soi:"}
        </p>

        {availablePlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Không còn người chơi nào chưa được soi.
          </p>
        ) : (
          <>
            <Select
              value={targetId}
              onValueChange={setTargetId}
              options={availablePlayers.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Chọn mục tiêu..."
            />

            {selectedPreviewPlayer && (
              <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded border">
                Xem trước: <span className="font-semibold text-foreground">{selectedPreviewPlayer.name}</span> là{" "}
                <span
                  className={
                    getFactionText(selectedPreviewPlayer) === "Phe Sói"
                      ? "text-red-400 font-bold"
                      : "text-green-400 font-bold"
                  }
                >
                  {getFactionText(selectedPreviewPlayer)}
                </span>
              </div>
            )}

            <Button size="sm" onClick={handleSave} disabled={!targetId}>
              {existingAction ? "Cập nhật" : "Lưu kết quả soi"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
