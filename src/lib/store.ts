import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROLE_MAP } from "./roles";
import { calculateGameResult } from "./gameUtils";
import type { Player, RoleAction, Timeline, MatchHistory } from "./types";

interface GameState {
  screen: "setup" | "controller";
  players: Player[];
  timelines: Timeline[];
  currentDay: number;
  roleStates: Record<string, Record<string, boolean>>;
  history: MatchHistory[];

  addPlayer: (role: string, name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, role: string, name: string) => void;
  startGame: () => void;
  addAction: (action: Omit<RoleAction, "used">) => void;
  removeAction: (role: string, actor: string, action: string, day: number) => void;
  setCurrentDay: (day: number) => void;
  advanceDay: () => void;
  newMatch: () => void;
  newGame: () => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "setup",
      players: [],
      timelines: [],
      currentDay: 1,
      roleStates: {},
      history: [],

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

          // Check if this action was ALREADY used on a PREVIOUS day
          const usedInPreviousDay = state.timelines.some(
            (t) =>
              t.day < state.currentDay &&
              t.actions.some(
                (a) => a.role === action.role && a.action === action.action
              )
          );

          if (isOneTime && usedInPreviousDay) {
            return state;
          }

          if (isOneTime) {
            if (!newRoleStates[action.role]) {
              newRoleStates[action.role] = {};
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

      removeAction: (role, actor, action, day) =>
        set((state) => {
          const newTimelines = state.timelines.map((t) => {
            if (t.day !== day) return t;
            return {
              ...t,
              actions: t.actions.filter(
                (a) => !(a.role === role && a.actor === actor && a.action === action)
              ),
            };
          });

          const roleConfig = ROLE_MAP[role as keyof typeof ROLE_MAP];
          const actionConfig = roleConfig?.actions.find((a) => a.action === action);
          const isOneTime = !!(actionConfig && actionConfig.limit === 1);

          const newRoleStates = { ...state.roleStates };
          if (isOneTime) {
            const stillUsed = newTimelines.some((t) =>
              t.actions.some((a) => a.role === role && a.action === action)
            );
            if (!stillUsed && newRoleStates[role]) {
              newRoleStates[role] = {
                ...newRoleStates[role],
                [action]: false,
              };
            }
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

      newMatch: () => {
        const { players, timelines, currentDay, history } = get();
        const hasActions = timelines.some((t) => t.actions.length > 0);

        let newHistory = history || [];
        if (hasActions) {
          const winner = calculateGameResult(players, timelines, currentDay + 1);
          const historyItem: MatchHistory = {
            id: crypto.randomUUID(),
            createdAt: new Date().toLocaleString("vi-VN", {
              dateStyle: "short",
              timeStyle: "short",
            }),
            players: [...players],
            timelines: JSON.parse(JSON.stringify(timelines)),
            winner,
            totalDays: timelines.length,
          };
          newHistory = [historyItem, ...newHistory];
        }

        set({
          timelines: [{ day: 1, actions: [] }],
          currentDay: 1,
          roleStates: {},
          history: newHistory,
        });
      },

      newGame: () => {
        const { players, timelines, currentDay, history } = get();
        const hasActions = timelines.some((t) => t.actions.length > 0);

        let newHistory = history || [];
        if (hasActions) {
          const winner = calculateGameResult(players, timelines, currentDay + 1);
          const historyItem: MatchHistory = {
            id: crypto.randomUUID(),
            createdAt: new Date().toLocaleString("vi-VN", {
              dateStyle: "short",
              timeStyle: "short",
            }),
            players: [...players],
            timelines: JSON.parse(JSON.stringify(timelines)),
            winner,
            totalDays: timelines.length,
          };
          newHistory = [historyItem, ...newHistory];
        }

        set({
          screen: "setup",
          players: [],
          timelines: [],
          currentDay: 1,
          roleStates: {},
          history: newHistory,
        });
      },

      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    { name: "ma-soi-game-storage" }
  )
);
