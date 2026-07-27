"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface WitchActionProps {
  actorId: string;
}

export function WitchAction({ actorId }: WitchActionProps) {
  const { players, currentDay, timelines, addAction, removeAction } =
    useGameStore();
  const [targetId, setTargetId] = useState("");

  const otherPlayers = players.filter((p) => p.id !== actorId);

  const usedCuuInPreviousDay = timelines.some(
    (t) =>
      t.day < currentDay &&
      t.actions.some((a) => a.role === "phu_thuy" && a.action === "cuu")
  );

  const usedGietInPreviousDay = timelines.some(
    (t) =>
      t.day < currentDay &&
      t.actions.some((a) => a.role === "phu_thuy" && a.action === "giet")
  );

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
    if (usedCuuInPreviousDay || guardProtectedWolfVictim) return;
    addAction({
      role: "phu_thuy",
      actor: actorId,
      action: "cuu",
      day: currentDay,
    });
  };

  const handleRemoveCuu = () => {
    removeAction("phu_thuy", actorId, "cuu", currentDay);
  };

  const handleGiet = () => {
    if (!targetId || usedGietInPreviousDay) return;
    addAction({
      role: "phu_thuy",
      actor: actorId,
      action: "giet",
      target: targetId,
      day: currentDay,
    });
    setTargetId("");
  };

  const handleRemoveGiet = () => {
    removeAction("phu_thuy", actorId, "giet", currentDay);
    setTargetId("");
  };

  const currentGietTargetPlayer = existingGiet
    ? players.find((p) => p.id === existingGiet.target)
    : null;

  return (
    <div className="space-y-4">
      {/* Cứu action */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Bình cứu {wolfBiteVictimName && <span className="text-muted-foreground">→ {wolfBiteVictimName}</span>}
        </p>
        {usedCuuInPreviousDay ? (
          <p className="text-xs text-muted-foreground italic">Đã sử dụng ở ngày trước</p>
        ) : existingCuu ? (
          <div className="flex items-center justify-between rounded bg-muted/40 p-2 text-sm">
            <span>
              Đã cứu: <span className="font-semibold text-green-400">{wolfBiteVictimName ?? "Nạn nhân"}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleRemoveCuu} className="h-7 text-xs text-destructive">
              Hủy cứu
            </Button>
          </div>
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
        <p className="text-sm font-medium">Bình độc (Giết)</p>
        {usedGietInPreviousDay ? (
          <p className="text-xs text-muted-foreground italic">Đã sử dụng ở ngày trước</p>
        ) : (
          <div className="space-y-2">
            {existingGiet && (
              <div className="flex items-center justify-between rounded bg-muted/40 p-2 text-sm">
                <span>
                  Đã dùng bình độc: <span className="font-semibold text-red-400">{currentGietTargetPlayer?.name ?? "Không rõ"}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleRemoveGiet} className="h-7 text-xs text-destructive">
                  Hủy chọn
                </Button>
              </div>
            )}
            <Select
              value={targetId}
              onValueChange={setTargetId}
              options={otherPlayers.map((p) => ({ value: p.id, label: p.name }))}
              placeholder={existingGiet ? "Chọn lại người muốn dùng bình độc..." : "Chọn mục tiêu..."}
            />
            <Button size="sm" onClick={handleGiet} disabled={!targetId}>
              {existingGiet ? "Cập nhật" : "Lưu"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
