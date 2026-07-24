import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROLE_MAP } from "./roles";
import type { Player, RoleAction, Timeline } from "./types";

interface GameState {
  screen: "setup" | "controller";
  players: Player[];
  timelines: Timeline[];
  currentDay: number;
  roleStates: Record<string, Record<string, boolean>>;

  addPlayer: (role: string, name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, role: string, name: string) => void;
  startGame: () => void;
  addAction: (action: Omit<RoleAction, "used">) => void;
  setCurrentDay: (day: number) => void;
  advanceDay: () => void;
  newMatch: () => void;
  newGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "setup",
      players: [],
      timelines: [],
      currentDay: 1,
      roleStates: {},

      addPlayer: (role, name) =>
        set((state) => ({
          players: [
            ...state.players,
            { id: crypto.randomUUID(), name, role },
          ],
        })),

      removePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      updatePlayer: (id, role, name) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, role, name } : p
          ),
        })),

      startGame: () => {
        const { players } = get();
        if (players.length === 0) return;
        set({
          screen: "controller",
          timelines: [{ day: 1, actions: [] }],
          currentDay: 1,
          roleStates: {},
        });
      },

      addAction: (action) =>
        set((state) => {
          const roleConfig = ROLE_MAP[action.role as keyof typeof ROLE_MAP];
          const actionConfig = roleConfig?.actions.find(
            (a) => a.action === action.action
          );

          const isOneTime = !!(actionConfig && actionConfig.limit === 1);
          const newRoleStates = { ...state.roleStates };

          if (isOneTime) {
            if (!newRoleStates[action.role]) {
              newRoleStates[action.role] = {};
            }
            if (newRoleStates[action.role][action.action]) {
              return state;
            }
            newRoleStates[action.role] = {
              ...newRoleStates[action.role],
              [action.action]: true,
            };
          }

          const currentDay = state.currentDay;
          const dayIndex = state.timelines.findIndex(
            (t) => t.day === currentDay
          );

          let newTimelines;
          if (dayIndex >= 0) {
            newTimelines = state.timelines.map((t, i) => {
              if (i !== dayIndex) return t;
              const filtered = t.actions.filter(
                (a) =>
                  !(
                    a.role === action.role &&
                    a.actor === action.actor &&
                    a.action === action.action
                  )
              );
              return { ...t, actions: [...filtered, { ...action, used: isOneTime }] };
            });
          } else {
            newTimelines = [
              ...state.timelines,
              { day: currentDay, actions: [{ ...action, used: isOneTime }] },
            ];
          }

          return {
            timelines: newTimelines,
            roleStates: newRoleStates,
          };
        }),

      setCurrentDay: (day) => set({ currentDay: day }),

      advanceDay: () =>
        set((state) => {
          const nextDay = state.currentDay + 1;
          const exists = state.timelines.some((t) => t.day === nextDay);
          return {
            currentDay: nextDay,
            timelines: exists
              ? state.timelines
              : [...state.timelines, { day: nextDay, actions: [] }],
          };
        }),

      newMatch: () =>
        set({
          timelines: [{ day: 1, actions: [] }],
          currentDay: 1,
          roleStates: {},
        }),

      newGame: () =>
        set({
          screen: "setup",
          players: [],
          timelines: [],
          currentDay: 1,
          roleStates: {},
        }),
    }),
    { name: "ma-soi-game-storage" }
  )
);
