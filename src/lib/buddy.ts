export type BuddyEvent = "open" | "pet" | "gather" | "foodLog" | "newFood" | "goal";

export type DailyBuddyInteractions = Partial<Record<BuddyEvent, number>>;

export type BuddyState = {
  owlName: string;
  forestXp: number;
  bondPoints: number;
  totalPets: number;
  totalFoodLogs: number;
  lastSeenDate?: string;
  dailyInteractions: Record<string, DailyBuddyInteractions>;
};

const BUDDY_KEY = "fiberBuddy.owlBuddy.v1";

const EVENT_XP: Record<BuddyEvent, number> = {
  open: 1,
  pet: 2,
  gather: 3,
  foodLog: 3,
  newFood: 5,
  goal: 10,
};

const EVENT_BOND: Record<BuddyEvent, number> = {
  open: 1,
  pet: 2,
  gather: 1,
  foodLog: 1,
  newFood: 2,
  goal: 4,
};

export const DAILY_LIMITS: Record<BuddyEvent, number> = {
  open: 1,
  pet: 5,
  gather: 3,
  foodLog: 8,
  newFood: 3,
  goal: 1,
};

export const defaultBuddyState: BuddyState = {
  owlName: "Ollie",
  forestXp: 0,
  bondPoints: 0,
  totalPets: 0,
  totalFoodLogs: 0,
  dailyInteractions: {},
};

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadBuddyState(): BuddyState {
  const loaded = readJson<Partial<BuddyState>>(BUDDY_KEY, defaultBuddyState);

  return {
    ...defaultBuddyState,
    ...loaded,
    dailyInteractions: loaded.dailyInteractions ?? {},
  };
}

export function saveBuddyState(state: BuddyState) {
  writeJson(BUDDY_KEY, state);
}

export function getInteractionsToday(state: BuddyState, date = getTodayKey()) {
  return state.dailyInteractions[date] ?? {};
}

export function getEventRemaining(state: BuddyState, event: BuddyEvent, date = getTodayKey()) {
  const used = getInteractionsToday(state, date)[event] ?? 0;
  return Math.max(0, DAILY_LIMITS[event] - used);
}

export function canRenameOwl(state: BuddyState) {
  return state.bondPoints >= 20 || state.forestXp >= 25;
}

export function getForestLevel(xp: number) {
  if (xp >= 180) {
    return {
      level: 5,
      title: "Owl Home",
      nextXp: 180,
      progress: 100,
      description: "Your forest has become a tiny home.",
    };
  }

  if (xp >= 95) {
    return {
      level: 4,
      title: "Firefly Grove",
      nextXp: 180,
      progress: ((xp - 95) / (180 - 95)) * 100,
      description: "Fireflies visit when the forest is calm.",
    };
  }

  if (xp >= 45) {
    return {
      level: 3,
      title: "Cozy Nest",
      nextXp: 95,
      progress: ((xp - 45) / (95 - 45)) * 100,
      description: "The nest is getting warmer and safer.",
    };
  }

  if (xp >= 15) {
    return {
      level: 2,
      title: "Leafy Branch",
      nextXp: 45,
      progress: ((xp - 15) / (45 - 15)) * 100,
      description: "New leaves are growing from your consistency.",
    };
  }

  return {
    level: 1,
    title: "Little Sprout",
    nextXp: 15,
    progress: (xp / 15) * 100,
    description: "A small forest friend is waking up.",
  };
}

export function applyBuddyEvent(state: BuddyState, event: BuddyEvent, date = getTodayKey()) {
  const todayInteractions = state.dailyInteractions[date] ?? {};
  const used = todayInteractions[event] ?? 0;
  const limit = DAILY_LIMITS[event];

  if (used >= limit) {
    return {
      state,
      awarded: false,
      message: "Daily interaction limit reached.",
    };
  }

  const next: BuddyState = {
    ...state,
    forestXp: state.forestXp + EVENT_XP[event],
    bondPoints: state.bondPoints + EVENT_BOND[event],
    totalPets: state.totalPets + (event === "pet" ? 1 : 0),
    totalFoodLogs: state.totalFoodLogs + (event === "foodLog" ? 1 : 0),
    lastSeenDate: date,
    dailyInteractions: {
      ...state.dailyInteractions,
      [date]: {
        ...todayInteractions,
        [event]: used + 1,
      },
    },
  };

  return {
    state: next,
    awarded: true,
    message: `+${EVENT_XP[event]} forest XP · +${EVENT_BOND[event]} bond`,
  };
}
