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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        <RoleSelector
          value={role}
          onValueChange={onRoleChange}
          className="flex-1"
          disabledValues={disabledValues}
        />
        <div className="hidden sm:flex items-center gap-2 text-muted-foreground">:</div>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Tên người chơi..."
          className="flex-1"
          aria-label={`Player name for role`}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive self-end sm:self-center"
        aria-label="Remove player"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
