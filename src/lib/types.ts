import type { LucideIcon } from "lucide-react";

export interface Player {
  id: string;
  name: string;
  role: string;
}

export interface RoleAction {
  role: string;
  actor: string;
  action: string;
  target?: string;
  target2?: string;
  day: number;
  used: boolean;
}

export interface Timeline {
  day: number;
  actions: RoleAction[];
}

export type RoleName =
  | "soi"
  | "soi_nguyen"
  | "cupid"
  | "tho_san"
  | "bao_ve"
  | "phu_thuy"
  | "mo_coi"
  | "dan_lang"
  | "role_tuy_chinh";

export interface RoleActionConfig {
  action: string;
  label: string;
  limit: number; // 0 = unlimited, 1 = one-time, etc.
  targetCount: number; // 0 = no target, 1 = single target, 2 = two targets
}

export interface RoleConfig {
  name: RoleName;
  label: string;
  icon: LucideIcon;
  actions: RoleActionConfig[];
  isWolf: boolean;
}
