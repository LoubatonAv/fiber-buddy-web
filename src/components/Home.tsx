import { useEffect, useMemo, useRef, useState } from "react";
import { AddFoodPanel } from "./AddFoodPanel";
import { BottomNav } from "./BottomNav";
import { Diary } from "./Diary";
import { MealDetails } from "./MealDetails";
import { Profile } from "./Profile";
import { Buddy } from "./Buddy";
import { OwlDelivery, type OwlDeliveryHandle } from "./OwlDelivery";
import { getTodayKey } from "../lib/fiber";
import {
  loadEntries,
  loadFoods,
  loadLastAmounts,
  saveEntries,
  saveFoods,
  saveLastAmounts,
  saveProfile,
} from "../lib/storage";
import { applyBuddyEvent, getTodayKey as getBuddyTodayKey, loadBuddyState, saveBuddyState, type BuddyEvent, type BuddyState } from "../lib/buddy";
import type {
  Food,
  FoodEntry,
  LastAmountMap,
  MainTab,
  MealCategory,
  UserProfile,
} from "../types";

type Props = {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onRestartOnboarding: () => void;
};

function calculateStreak(entries: FoodEntry[]) {
  const dates = new Set(entries.map((entry) => entry.date));
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dates.has(key)) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function Home({ profile, onProfileChange, onRestartOnboarding }: Props) {
  const [tab, setTab] = useState<MainTab>("diary");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>("breakfast");
  const [mealDetails, setMealDetails] = useState<MealCategory | null>(null);

  const [foods, setFoods] = useState<Food[]>(() => loadFoods());
  const [entries, setEntries] = useState<FoodEntry[]>(() => loadEntries());
  const [lastAmounts, setLastAmounts] = useState<LastAmountMap>(() =>
    loadLastAmounts(),
  );
  const [buddy, setBuddy] = useState<BuddyState>(() => loadBuddyState());
  const owlRef = useRef<OwlDeliveryHandle>(null);

  const today = getTodayKey();

  const todayEntries = useMemo(
    () => entries.filter((entry) => entry.date === today),
    [entries, today],
  );

  const totalFiber = useMemo(() => {
    return todayEntries.reduce((sum, entry) => {
      const food = foods.find((item) => item.id === entry.foodId);
      if (!food) return sum;

      return sum + (entry.amountGrams / 100) * food.fiberPer100g;
    }, 0);
  }, [foods, todayEntries]);

  const streak = useMemo(() => calculateStreak(entries), [entries]);

  function persistFoods(nextFoods: Food[]) {
    setFoods(nextFoods);
    saveFoods(nextFoods);
  }


  function persistEntries(nextEntries: FoodEntry[]) {
    setEntries(nextEntries);
    saveEntries(nextEntries);
  }

  function persistLastAmounts(next: LastAmountMap) {
    setLastAmounts(next);
    saveLastAmounts(next);
  }

  function persistBuddy(nextBuddy: BuddyState) {
    setBuddy(nextBuddy);
    saveBuddyState(nextBuddy);
  }

  function awardBuddyEvent(event: BuddyEvent) {
    // Read the latest saved buddy state so sequential rewards in the same tick
    // do not overwrite each other.
    const latestBuddy = loadBuddyState();
    const result = applyBuddyEvent(latestBuddy, event, getBuddyTodayKey());
    persistBuddy(result.state);
    return {
      awarded: result.awarded,
      message: result.message,
    };
  }

  function renameOwl(name: string) {
    persistBuddy({ ...buddy, owlName: name });
  }


  function addFood(food: Food) {
    persistFoods([food, ...foods]);
    awardBuddyEvent("newFood");
  }



  function toggleFoodFavorite(foodId: string) {
    persistFoods(
      foods.map((food) =>
        food.id === foodId ? { ...food, isFavorite: !food.isFavorite } : food,
      ),
    );
  }

  function deleteFood(foodId: string) {
    persistFoods(foods.filter((food) => food.id !== foodId));
    persistEntries(entries.filter((entry) => entry.foodId !== foodId));
  }

  function openAdd(meal: MealCategory) {
    setSelectedMeal(meal);
    setIsAdding(true);
  }

  function openMeal(meal: MealCategory) {
    setMealDetails(meal);
  }

  function addEntry(
    food: Food,
    amountGrams: number,
    mealCategory: MealCategory,
  ) {
    const nextEntry: FoodEntry = {
      id: String(Date.now() + Math.random()),
      foodId: food.id,
      amountGrams,
      date: today,
      mealCategory,
    };

    const addedFiber = (amountGrams / 100) * food.fiberPer100g;
    const reachedGoalNow =
      totalFiber < profile.dailyFiberGoal &&
      totalFiber + addedFiber >= profile.dailyFiberGoal;

    persistEntries([nextEntry, ...entries]);

    persistLastAmounts({
      ...lastAmounts,
      [food.id]: amountGrams,
    });

    awardBuddyEvent("foodLog");

    if (reachedGoalNow) {
      const result = awardBuddyEvent("goal");
      if (result.awarded) {
        window.setTimeout(() => window.fiberOwl?.deliver("goal"), 350);
      }
    }

    return nextEntry;
  }

  function quickAddFood(food: Food, mealCategory: MealCategory) {
    addEntry(
      food,
      food.servingGrams ?? lastAmounts[food.id] ?? 100,
      mealCategory,
    );
  }

  function deleteEntry(id: string) {
    persistEntries(entries.filter((entry) => entry.id !== id));
  }

  function updateEntry(id: string, amountGrams: number) {
    const nextEntries = entries.map((entry) => {
      if (entry.id !== id) return entry;

      return {
        ...entry,
        amountGrams,
      };
    });

    const editedEntry = entries.find((entry) => entry.id === id);

    persistEntries(nextEntries);

    if (editedEntry) {
      persistLastAmounts({
        ...lastAmounts,
        [editedEntry.foodId]: amountGrams,
      });
    }
  }

  function handleProfileChange(nextProfile: UserProfile) {
    saveProfile(nextProfile);
    onProfileChange(nextProfile);
  }

  useEffect(() => {
    window.fiberOwl = {
      deliver: (kind?: "test" | "streak" | "missed" | "goal") => {
        owlRef.current?.deliver(kind ?? "test");
      },
    };

    return () => {
      delete window.fiberOwl;
    };
  }, []);

  useEffect(() => {
    awardBuddyEvent("open");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const seenKey = `fiber-owl-seen-${todayKey}`;
    if (localStorage.getItem(seenKey)) return;

    const random = Math.random();

    if (streak > 0) {
      if (streak % 7 === 0) {
        localStorage.setItem(seenKey, "1");
        owlRef.current?.deliver("streak");
        return;
      }

      if (totalFiber >= profile.dailyFiberGoal && profile.dailyFiberGoal > 0) {
        localStorage.setItem(seenKey, "1");
        owlRef.current?.deliver("goal");
        return;
      }

      if (random < 0.16) {
        localStorage.setItem(seenKey, "1");
        owlRef.current?.deliver("streak");
      }
    } else if (todayEntries.length === 0 && random < 0.12) {
      localStorage.setItem(seenKey, "1");
      owlRef.current?.deliver("missed");
    }
  }, [streak, totalFiber, profile.dailyFiberGoal, todayEntries.length]);

  if (isAdding) {
    return (
      <>
        <OwlDelivery
          ref={owlRef}
          streak={streak}
          totalFiber={totalFiber}
          goal={profile.dailyFiberGoal}
        />
        <AddFoodPanel
          foods={foods}
          entries={entries}
          lastAmounts={lastAmounts}
          selectedMeal={selectedMeal}
          onAdd={addEntry}
          onDeleteEntry={deleteEntry}
          onUpdateEntry={updateEntry}
          onToggleFavorite={toggleFoodFavorite}
          onDone={() => setIsAdding(false)}
        />
      </>
    );
  }

  if (mealDetails) {
    const mealEntries = todayEntries.filter(
      (entry) => (entry.mealCategory ?? "snacks") === mealDetails,
    );

    return (
      <>
        <OwlDelivery
          ref={owlRef}
          streak={streak}
          totalFiber={totalFiber}
          goal={profile.dailyFiberGoal}
        />
        <MealDetails
          meal={mealDetails}
          foods={foods}
          entries={mealEntries}
          dailyGoal={profile.dailyFiberGoal}
          onBack={() => setMealDetails(null)}
          onAddMore={() => openAdd(mealDetails)}
          onDeleteEntry={deleteEntry}
          onUpdateEntry={updateEntry}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <OwlDelivery
        ref={owlRef}
        streak={streak}
        totalFiber={totalFiber}
        goal={profile.dailyFiberGoal}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-8 page-enter">
        {tab === "diary" ? (
          <Diary
            profile={profile}
            foods={foods}
            todayEntries={todayEntries}
            totalFiber={totalFiber}
            streak={streak}
            onOpenAdd={openAdd}
            onOpenMeal={openMeal}
            onDeleteEntry={deleteEntry}
            onUpdateEntry={updateEntry}
          />
        ) : null}

        {tab === "buddy" ? (
          <Buddy
            buddy={buddy}
            streak={streak}
            totalFiber={totalFiber}
            goal={profile.dailyFiberGoal}
            todayFoodCount={todayEntries.length}
            onBuddyEvent={awardBuddyEvent}
            onRename={renameOwl}
          />
        ) : null}

        {tab === "profile" ? (
          <Profile
            profile={profile}
            onProfileChange={handleProfileChange}
            onRestartOnboarding={onRestartOnboarding}
          />
        ) : null}
      </div>

      <BottomNav activeTab={tab} onChange={setTab} />
    </div>
  );
}
