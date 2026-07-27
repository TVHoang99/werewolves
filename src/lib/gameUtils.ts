import { ROLE_MAP } from "./roles";
import type { Player, Timeline, RoleName } from "./types";

export function calculateDeadPlayerIds(
  players: Player[],
  timelines: Timeline[],
  currentDay: number
): Set<string> {
  const dead = new Set<string>();
  const deadThisRound = new Set<string>();

  // Find Cupid pair across all timelines
  let cupidPair: { target1: string; target2: string } | null = null;
  for (const t of timelines) {
    const cupidAction = t.actions.find(
      (a) => a.role === "cupid" && a.action === "ghep_doi" && a.target && a.target2
    );
    if (cupidAction?.target && cupidAction?.target2) {
      cupidPair = { target1: cupidAction.target, target2: cupidAction.target2 };
      break;
    }
  }

  for (const timeline of timelines) {
    if (timeline.day >= currentDay) continue;

    deadThisRound.clear();
    const actions = timeline.actions;

    // 1. Wolf bite victim
    const wolfBite = actions.find((a) => a.role === "soi" && a.action === "can");
    const guardProtect = actions.find((a) => a.role === "bao_ve" && a.action === "bao_ve");
    const witchSave = actions.find((a) => a.role === "phu_thuy" && a.action === "cuu");

    if (wolfBite?.target) {
      const isProtected = guardProtect?.target === wolfBite.target;
      const isSaved = witchSave;
      if (!isProtected && !isSaved) {
        dead.add(wolfBite.target);
        deadThisRound.add(wolfBite.target);
      }
    }

    // 2. Witch kill
    const witchKill = actions.find((a) => a.role === "phu_thuy" && a.action === "giet");
    if (witchKill?.target) {
      dead.add(witchKill.target);
      deadThisRound.add(witchKill.target);
    }

    // 3. Vote results
    const voteActions = actions.filter((a) => a.role === "dan_lang" && a.action === "vote" && a.target);
    if (voteActions.length > 0) {
      const voteCounts: Record<string, number> = {};
      for (const vote of voteActions) {
        if (vote.target) {
          voteCounts[vote.target] = (voteCounts[vote.target] || 0) + 1;
        }
      }
      let maxVotes = 0;
      let maxVotedId = "";
      for (const [playerId, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
          maxVotes = count;
          maxVotedId = playerId;
        }
      }
      if (maxVotedId && maxVotes > 0) {
        dead.add(maxVotedId);
        deadThisRound.add(maxVotedId);
      }
    }

    // Helper to process Cupid deaths in this round
    const processCupidDeaths = () => {
      if (!cupidPair) return;
      const partner1Dead = deadThisRound.has(cupidPair.target1);
      const partner2Dead = deadThisRound.has(cupidPair.target2);
      if (partner1Dead && !dead.has(cupidPair.target2)) {
        dead.add(cupidPair.target2);
        deadThisRound.add(cupidPair.target2);
      }
      if (partner2Dead && !dead.has(cupidPair.target1)) {
        dead.add(cupidPair.target1);
        deadThisRound.add(cupidPair.target1);
      }
    };

    // 4. Check Cupid pairs after initial deaths
    processCupidDeaths();

    // 5. Check Hunter - if hunter dies, take their LATEST active target on or before this day
    const hunters = players.filter((p) => p.role === "tho_san");
    for (const hunter of hunters) {
      if (deadThisRound.has(hunter.id)) {
        let activeHunterTarget: string | undefined;
        for (const t of timelines) {
          if (t.day > timeline.day) break;
          const hunterAction = t.actions.find(
            (a) => a.actor === hunter.id && a.action === "san_cung" && a.target
          );
          if (hunterAction?.target) {
            activeHunterTarget = hunterAction.target;
          }
        }
        if (activeHunterTarget && !dead.has(activeHunterTarget)) {
          dead.add(activeHunterTarget);
          deadThisRound.add(activeHunterTarget);
        }
      }
    }

    // 6. Re-check Cupid pairs in case Hunter shot a Cupid partner
    processCupidDeaths();
  }
  return dead;
}

export function calculateDeadPlayerIdsForVote(
  players: Player[],
  timelines: Timeline[],
  currentDay: number
): Set<string> {
  const dead = calculateDeadPlayerIds(players, timelines, currentDay);
  const deadThisRound = new Set<string>();

  const currentTimeline = timelines.find((t) => t.day === currentDay);
  if (!currentTimeline) return dead;

  const actions = currentTimeline.actions;

  // 1. Wolf bite victim on current day
  const wolfBite = actions.find((a) => a.role === "soi" && a.action === "can");
  const guardProtect = actions.find((a) => a.role === "bao_ve" && a.action === "bao_ve");
  const witchSave = actions.find((a) => a.role === "phu_thuy" && a.action === "cuu");

  if (wolfBite?.target) {
    const isProtected = guardProtect?.target === wolfBite.target;
    const isSaved = witchSave;
    if (!isProtected && !isSaved) {
      dead.add(wolfBite.target);
      deadThisRound.add(wolfBite.target);
    }
  }

  // 2. Witch kill on current day
  const witchKill = actions.find((a) => a.role === "phu_thuy" && a.action === "giet");
  if (witchKill?.target) {
    dead.add(witchKill.target);
    deadThisRound.add(witchKill.target);
  }

  // 3. Check Cupid pairs for night deaths on current day
  let cupidPair: { target1: string; target2: string } | null = null;
  for (const t of timelines) {
    const cupidAction = t.actions.find(
      (a) => a.role === "cupid" && a.action === "ghep_doi" && a.target && a.target2
    );
    if (cupidAction?.target && cupidAction?.target2) {
      cupidPair = { target1: cupidAction.target, target2: cupidAction.target2 };
      break;
    }
  }

  if (cupidPair) {
    const partner1Dead = deadThisRound.has(cupidPair.target1);
    const partner2Dead = deadThisRound.has(cupidPair.target2);
    if (partner1Dead && !dead.has(cupidPair.target2)) {
      dead.add(cupidPair.target2);
      deadThisRound.add(cupidPair.target2);
    }
    if (partner2Dead && !dead.has(cupidPair.target1)) {
      dead.add(cupidPair.target1);
      deadThisRound.add(cupidPair.target1);
    }
  }

  // 4. Check Hunter night deaths on current day
  const hunters = players.filter((p) => p.role === "tho_san");
  for (const hunter of hunters) {
    if (deadThisRound.has(hunter.id)) {
      let activeHunterTarget: string | undefined;
      for (const t of timelines) {
        if (t.day > currentDay) break;
        const hunterAction = t.actions.find(
          (a) => a.actor === hunter.id && a.action === "san_cung" && a.target
        );
        if (hunterAction?.target) {
          activeHunterTarget = hunterAction.target;
        }
      }
      if (activeHunterTarget && !dead.has(activeHunterTarget)) {
        dead.add(activeHunterTarget);
        deadThisRound.add(activeHunterTarget);
      }
    }
  }

  return dead;
}

export function getDeathsForDay(
  players: Player[],
  timelines: Timeline[],
  day: number
): string[] {
  const deadBeforeDay = calculateDeadPlayerIds(players, timelines, day);
  const deadAfterDay = calculateDeadPlayerIds(players, timelines, day + 1);

  const deathsToday: string[] = [];
  for (const id of Array.from(deadAfterDay)) {
    if (!deadBeforeDay.has(id)) {
      const p = players.find((pl) => pl.id === id);
      if (p) deathsToday.push(p.name);
    }
  }
  return deathsToday;
}

export function calculateOrphanMotherDead(
  timelines: Timeline[],
  deadPlayerIds: Set<string>
): boolean {
  for (const timeline of timelines) {
    const orphanAction = timeline.actions.find(
      (a) => a.role === "mo_coi" && a.action === "nhan_me" && a.target
    );
    if (orphanAction?.target) {
      return deadPlayerIds.has(orphanAction.target);
    }
  }
  return false;
}

export function calculateCursedPlayerIds(
  timelines: Timeline[],
  currentDay: number
): Set<string> {
  const set = new Set<string>();
  for (const timeline of timelines) {
    if (timeline.day >= currentDay) continue;
    for (const action of timeline.actions) {
      if (action.role === "soi_nguyen" && action.action === "nguyen" && action.target) {
        set.add(action.target);
      }
    }
  }
  return set;
}

export function calculateGameResult(
  players: Player[],
  timelines: Timeline[],
  currentDay: number
): "wolves" | "villagers" | "couple" | null {
  const deadPlayerIds = calculateDeadPlayerIds(players, timelines, currentDay);
  const orphanMotherDead = calculateOrphanMotherDead(timelines, deadPlayerIds);
  const cursedPlayerIds = calculateCursedPlayerIds(timelines, currentDay);

  const alivePlayers = players.filter((p) => !deadPlayerIds.has(p.id));
  const aliveWolves = alivePlayers.filter(
    (p) => p.role === "soi" || p.role === "soi_nguyen"
  );
  const aliveOrphan = alivePlayers.filter(
    (p) => p.role === "mo_coi" && orphanMotherDead
  );
  const aliveCursed = alivePlayers.filter(
    (p) =>
      cursedPlayerIds.has(p.id) &&
      p.role !== "soi" &&
      p.role !== "soi_nguyen" &&
      !(p.role === "mo_coi" && orphanMotherDead)
  );
  const totalAliveWolves =
    aliveWolves.length + aliveOrphan.length + aliveCursed.length;
  const aliveNonWolves = alivePlayers.filter(
    (p) =>
      p.role !== "soi" &&
      p.role !== "soi_nguyen" &&
      !(p.role === "mo_coi" && orphanMotherDead) &&
      !cursedPlayerIds.has(p.id)
  );

  // Check couple (third faction) win condition
  let cupidPair: { target: string; target2: string } | null = null;
  for (const timeline of timelines) {
    const cupidAction = timeline.actions.find(
      (a) => a.role === "cupid" && a.action === "ghep_doi" && a.target && a.target2
    );
    if (cupidAction?.target && cupidAction?.target2) {
      cupidPair = { target: cupidAction.target, target2: cupidAction.target2 };
      break;
    }
  }

  if (cupidPair) {
    const partner1 = players.find((p) => p.id === cupidPair!.target);
    const partner2 = players.find((p) => p.id === cupidPair!.target2);

    if (partner1 && partner2) {
      const isWolf = (p: Player) =>
        p.role === "soi" ||
        p.role === "soi_nguyen" ||
        (p.role === "mo_coi" && orphanMotherDead) ||
        cursedPlayerIds.has(p.id);
      const oneIsWolf = isWolf(partner1) !== isWolf(partner2);

      if (oneIsWolf) {
        const bothAlive =
          !deadPlayerIds.has(partner1.id) && !deadPlayerIds.has(partner2.id);
        if (bothAlive && alivePlayers.length === 2) {
          return "couple";
        }
      }
    }
  }

  if (totalAliveWolves >= aliveNonWolves.length && totalAliveWolves > 0) {
    return "wolves";
  }
  if (totalAliveWolves === 0 && aliveNonWolves.length > 0) {
    return "villagers";
  }
  return null;
}
