"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RoleSelector } from "./RoleSelector";

interface PlayerRowProps {
  id: string;
  role: string;
  name: string;
  onRoleChange: (role: string) => void;
  onNameChange: (name: string) => void;
  onDelete: () => void;
  disabledValues?: Set<string>;
}

export function PlayerRow({
  id,
  role,
  name,
  onRoleChange,
  onNameChange,
  onDelete,
  disabledValues,
}: PlayerRowProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 animate-in slide-in-from-top-2 duration-200">
      <RoleSelector
        value={role}
        onValueChange={onRoleChange}
        className="w-[135px] sm:w-[160px] shrink-0 min-w-0"
        disabledValues={disabledValues}
      />
      <div className="hidden sm:flex items-center text-muted-foreground">:</div>
      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Tên người chơi..."
        className="flex-1 min-w-0"
        aria-label={`Player name for role`}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label="Remove player"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
