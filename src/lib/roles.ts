import {
  Skull,
  Crown,
  Heart,
  Crosshair,
  Shield,
  FlaskConical,
  Baby,
  Users,
  Pencil,
} from "lucide-react";

import type { RoleConfig, RoleName } from "./types";

export const ROLES: RoleConfig[] = [
  {
    name: "soi",
    label: "Sói",
    icon: Skull,
    isWolf: true,
    actions: [
      { action: "can", label: "Cắn", limit: 0, targetCount: 1 },
    ],
  },
  {
    name: "soi_nguyen",
    label: "Sói nguyên",
    icon: Crown,
    isWolf: true,
    actions: [
      { action: "nguyen", label: "Nguyền", limit: 1, targetCount: 1 },
    ],
  },
  {
    name: "cupid",
    label: "Cupid",
    icon: Heart,
    isWolf: false,
    actions: [
      { action: "ghep_doi", label: "Ghép đôi", limit: 1, targetCount: 2 },
    ],
  },
  {
    name: "tho_san",
    label: "Thợ săn",
    icon: Crosshair,
    isWolf: false,
    actions: [
      { action: "san_cung", label: "Săn cùng", limit: 0, targetCount: 1 },
    ],
  },
  {
    name: "bao_ve",
    label: "Bảo vệ",
    icon: Shield,
    isWolf: false,
    actions: [
      { action: "bao_ve", label: "Bảo vệ", limit: 0, targetCount: 1 },
    ],
  },
  {
    name: "phu_thuy",
    label: "Phù thủy",
    icon: FlaskConical,
    isWolf: false,
    actions: [
      { action: "cuu", label: "Cứu", limit: 1, targetCount: 0 },
      { action: "giet", label: "Giết", limit: 1, targetCount: 1 },
    ],
  },
  {
    name: "mo_coi",
    label: "Mồ côi",
    icon: Baby,
    isWolf: false,
    actions: [
      { action: "nhan_me", label: "Nhận mẹ", limit: 1, targetCount: 0 },
    ],
  },
  {
    name: "dan_lang",
    label: "Dân làng",
    icon: Users,
    isWolf: false,
    actions: [
      { action: "vote", label: "Vote", limit: 0, targetCount: 1 },
    ],
  },
  {
    name: "role_tuy_chinh",
    label: "Role tùy chỉnh",
    icon: Pencil,
    isWolf: false,
    actions: [],
  },
];

export const ROLE_MAP = Object.fromEntries(
  ROLES.map((r) => [r.name, r])
) as Record<RoleName, RoleConfig>;
