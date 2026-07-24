"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameStore } from "@/lib/store";
import { ROLE_MAP } from "@/lib/roles";
import type { RoleName } from "@/lib/types";
import { WolfAction } from "./RoleActions/WolfAction";
import { AlphaWolfAction } from "./RoleActions/AlphaWolfAction";

interface EditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: RoleName | null;
}

export function EditPanel({ open, onOpenChange, roleName }: EditPanelProps) {
  const roleConfig = roleName ? ROLE_MAP[roleName] : null;
  const players = useGameStore((s) => s.players);

  const actors = roleName
    ? players.filter((p) => p.role === roleName)
    : [];

  const renderAction = (actorId: string) => {
    switch (roleName) {
      case "soi":
        return <WolfAction actorId={actorId} />;
      case "soi_nguyen":
        return <AlphaWolfAction actorId={actorId} />;
      default:
        return (
          <p className="text-sm text-muted-foreground">Sắp ra mắt...</p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {roleConfig ? `Chỉnh sửa ${roleConfig.label}` : "Chỉnh sửa Role"}
          </DialogTitle>
        </DialogHeader>

        {actors.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Không có người chơi nào đảm nhận vai trò này.</p>
          </div>
        ) : actors.length === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Người chơi: <span className="font-medium text-foreground">{actors[0].name}</span>
            </p>
            {renderAction(actors[0].id)}
          </div>
        ) : (
          <div className="space-y-4">
            {actors.map((actor) => (
              <div key={actor.id} className="space-y-2">
                <p className="text-sm font-medium">{actor.name}</p>
                {renderAction(actor.id)}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
