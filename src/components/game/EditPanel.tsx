"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ROLE_MAP } from "@/lib/roles";
import type { RoleName } from "@/lib/types";

interface EditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: RoleName | null;
}

export function EditPanel({ open, onOpenChange, roleName }: EditPanelProps) {
  const roleConfig = roleName ? ROLE_MAP[roleName] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {roleConfig ? `Chỉnh sửa ${roleConfig.label}` : "Chỉnh sửa Role"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-8 text-center text-muted-foreground">
          <p>Sắp ra mắt...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
