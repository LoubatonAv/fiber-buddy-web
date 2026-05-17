import { defaultFoods } from "../data/defaultFoods";
import type {
  Food,
  FoodEntry,
  LastAmountMap,
  Recipe,
  UserProfile,
} from "../types";

const PROFILE_KEY = "fiberBuddy.profile.v2";
const FOODS_KEY = "fiberBuddy.foods.v2";
const RECIPES_KEY = "fiberBuddy.recipes.v1";
const ENTRIES_KEY = "fiberBuddy.entries.v2";
const LAST_AMOUNTS_KEY = "fiberBuddy.lastAmounts.v2";

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

function normalizeFoods(foods: Food[]): Food[] {
  return foods.map((food) => ({
    ...food,
    source: food.source ?? "default",
    isFavorite: food.isFavorite ?? false,
    mealCategories:
      food.mealCategories?.length > 0
        ? food.mealCategories
        : ["breakfast", "lunch", "dinner", "snacks"],
  }));
}

export function loadProfile(): UserProfile | null {
  return readJson<UserProfile | null>(PROFILE_KEY, null);
}

export function saveProfile(profile: UserProfile) {
  writeJson(PROFILE_KEY, profile);
}

export function loadFoods(): Food[] {
  const foods = readJson<Food[]>(FOODS_KEY, []);

  if (foods.length === 0) {
    const normalized = normalizeFoods(defaultFoods);
    saveFoods(normalized);
    return normalized;
  }

  return normalizeFoods(foods);
}

export function saveFoods(foods: Food[]) {
  writeJson(FOODS_KEY, normalizeFoods(foods));
}

export function loadRecipes(): Recipe[] {
  return readJson<Recipe[]>(RECIPES_KEY, []);
}

export function saveRecipes(recipes: Recipe[]) {
  writeJson(RECIPES_KEY, recipes);
}

export function loadEntries(): FoodEntry[] {
  return readJson<FoodEntry[]>(ENTRIES_KEY, []);
}

export function saveEntries(entries: FoodEntry[]) {
  writeJson(ENTRIES_KEY, entries);
}

export function loadLastAmounts(): LastAmountMap {
  return readJson<LastAmountMap>(LAST_AMOUNTS_KEY, {});
}

export function saveLastAmounts(lastAmounts: LastAmountMap) {
  writeJson(LAST_AMOUNTS_KEY, lastAmounts);
}
