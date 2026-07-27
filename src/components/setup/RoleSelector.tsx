"use client";

import { Select, type SelectOption } from "@/components/ui/select";
import { ROLES } from "@/lib/roles";

interface RoleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabledValues?: Set<string>;
}

const roleOptions: SelectOption[] = ROLES.map((role) => ({
  value: role.name,
  label: role.label,
  icon: <role.icon className="h-4 w-4" />,
}));

export function RoleSelector({
  value,
  onValueChange,
  className,
  disabledValues,
}: RoleSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      options={roleOptions}
      placeholder="Chọn vai..."
      className={className}
      disabledValues={disabledValues}
    />
  );
}
