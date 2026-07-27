"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, History, Users, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { ROLE_MAP } from "@/lib/roles";
import type { MatchHistory, RoleName } from "@/lib/types";

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const history = useGameStore((s) => s.history) || [];
  const deleteHistoryItem = useGameStore((s) => s.deleteHistoryItem);
  const clearHistory = useGameStore((s) => s.clearHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getWinnerBadge = (winner: MatchHistory["winner"]) => {
    switch (winner) {
      case "wolves":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            🐺 Sói thắng
          </span>
        );
      case "villagers":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            🌾 Dân làng thắng
          </span>
        );
      case "couple":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/30">
            💕 Cặp đôi thắng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
            ⏳ Chưa có kết quả
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[85vh] overflow-y-auto" onClose={() => onOpenChange(false)}>
        <DialogHeader className="flex flex-row items-center justify-between pr-6 border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Lịch sử ván chơi
            {history.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                ({history.length} trận)
              </span>
            )}
          </DialogTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm("Bạn có chắc muốn xóa tất cả lịch sử ván chơi?")) {
                  clearHistory();
                }
              }}
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </DialogHeader>

        {history.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <History className="h-10 w-10 mx-auto opacity-40" />
            <p className="text-sm font-medium">Chưa có lịch sử ván chơi nào</p>
            <p className="text-xs">
              Các ván chơi sẽ tự động được lưu lại khi bạn nhấn &quot;Trận mới&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {history.map((match, index) => {
              const isExpanded = expandedId === match.id;
              const matchNumber = history.length - index;

              return (
                <div
                  key={match.id}
                  className="rounded-xl border bg-card/60 p-4 transition-all space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base">Trận #{matchNumber}</span>
                        {getWinnerBadge(match.winner)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 inline" />
                        {match.createdAt}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHistoryItem(match.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Xóa ván chơi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {match.players.length} người chơi
                      </span>
                      <span>{match.totalDays} ngày đấu</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(match.id)}
                      className="h-7 text-xs px-2 text-primary"
                    >
                      {isExpanded ? (
                        <>
                          Thu gọn <ChevronUp className="h-3.5 w-3.5 ml-1" />
                        </>
                      ) : (
                        <>
                          Chi tiết <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t pt-3 space-y-4 animate-in fade-in duration-200">
                      {/* Players & Roles */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          Người chơi & Vai trò
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.players.map((p) => {
                            const config = ROLE_MAP[p.role as RoleName];
                            const Icon = config?.icon;
                            return (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-md text-xs"
                              >
                                {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
                                <span className="font-medium">{p.name}</span>
                                <span className="text-muted-foreground text-[10px]">
                                  ({config?.label ?? p.role})
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Timelines summary per day */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          Diễn biến các ngày
                        </h4>
                        <div className="space-y-2">
                          {match.timelines.map((timeline) => (
                            <div
                              key={timeline.day}
                              className="rounded-lg border bg-background/50 p-2.5 text-xs space-y-1"
                            >
                              <p className="font-semibold text-primary">Ngày {timeline.day}</p>
                              {timeline.actions.length === 0 ? (
                                <p className="text-muted-foreground italic text-[11px]">
                                  Không có hành động nào
                                </p>
                              ) : (
                                <ul className="space-y-1 pl-2 border-l-2 border-primary/20">
                                  {timeline.actions.map((act, i) => {
                                    const roleConfig = ROLE_MAP[act.role as RoleName];
                                    const targetPlayer = match.players.find(
                                      (p) => p.id === act.target
                                    );
                                    const target2Player = match.players.find(
                                      (p) => p.id === act.target2
                                    );
                                    return (
                                      <li key={i} className="text-foreground/90">
                                        <span className="font-medium text-primary">
                                          [{roleConfig?.label ?? act.role}]
                                        </span>{" "}
                                        {act.action === "can" && targetPlayer && `Cắn ${targetPlayer.name}`}
                                        {act.action === "nguyen" && targetPlayer && `Nguyền ${targetPlayer.name}`}
                                        {act.action === "soi" && targetPlayer && `Soi ${targetPlayer.name}`}
                                        {act.action === "ghep_doi" &&
                                          targetPlayer &&
                                          target2Player &&
                                          `Ghép đôi ${targetPlayer.name} & ${target2Player.name}`}
                                        {act.action === "san_cung" && targetPlayer && `Săn cùng ${targetPlayer.name}`}
                                        {act.action === "bao_ve" && targetPlayer && `Bảo vệ ${targetPlayer.name}`}
                                        {act.action === "cuu" && "Cứu người bị cắn"}
                                        {act.action === "giet" && targetPlayer && `Giết ${targetPlayer.name}`}
                                        {act.action === "nhan_me" && targetPlayer && `Nhận ${targetPlayer.name} làm mẹ`}
                                        {act.action === "vote" && targetPlayer && `Vote loại ${targetPlayer.name}`}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
