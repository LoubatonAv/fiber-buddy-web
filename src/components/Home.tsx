import { useMemo, useState } from "react";
import { AddFoodPanel } from "./AddFoodPanel";
import { BottomNav } from "./BottomNav";
import { Diary } from "./Diary";
import { Foods } from "./Foods";
import { Ideas } from "./Ideas";
import { MealDetails } from "./MealDetails";
import { Profile } from "./Profile";
import { getTodayKey } from "../lib/fiber";
import { FoodsHub } from "./FoodsHub";
import {
  loadEntries,
  loadFoods,
  loadLastAmounts,
  loadRecipes,
  saveEntries,
  saveFoods,
  saveLastAmounts,
  saveProfile,
  saveRecipes,
} from "../lib/storage";
import type {
  Food,
  FoodEntry,
  LastAmountMap,
  MainTab,
  MealCategory,
  Recipe,
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
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipes());
  const [entries, setEntries] = useState<FoodEntry[]>(() => loadEntries());
  const [lastAmounts, setLastAmounts] = useState<LastAmountMap>(() =>
    loadLastAmounts(),
  );

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

  function persistRecipes(nextRecipes: Recipe[]) {
    setRecipes(nextRecipes);
    saveRecipes(nextRecipes);
  }

  function persistEntries(nextEntries: FoodEntry[]) {
    setEntries(nextEntries);
    saveEntries(nextEntries);
  }

  function persistLastAmounts(next: LastAmountMap) {
    setLastAmounts(next);
    saveLastAmounts(next);
  }

  function addFood(food: Food) {
    persistFoods([food, ...foods]);
  }

  function addRecipe(recipe: Recipe, recipeFood: Food) {
    persistRecipes([recipe, ...recipes]);
    persistFoods([recipeFood, ...foods]);
  }

  function deleteRecipe(recipeId: string) {
    const deletedFoodIds = new Set(
      foods.filter((food) => food.recipeId === recipeId).map((food) => food.id),
    );

    persistRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
    persistFoods(foods.filter((food) => food.recipeId !== recipeId));
    persistEntries(
      entries.filter((entry) => !deletedFoodIds.has(entry.foodId)),
    );
  }

  function toggleFoodFavorite(foodId: string) {
    persistFoods(
      foods.map((food) =>
        food.id === foodId ? { ...food, isFavorite: !food.isFavorite } : food,
      ),
    );
  }

  function deleteFood(foodId: string) {
    const foodToDelete = foods.find((food) => food.id === foodId);

    if (foodToDelete?.recipeId) {
      deleteRecipe(foodToDelete.recipeId);
      return;
    }

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

    persistEntries([nextEntry, ...entries]);

    persistLastAmounts({
      ...lastAmounts,
      [food.id]: amountGrams,
    });

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

  if (isAdding) {
    return (
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
    );
  }

  if (mealDetails) {
    const mealEntries = todayEntries.filter(
      (entry) => (entry.mealCategory ?? "snacks") === mealDetails,
    );

    return (
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
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col app-soft-bg">
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

        {tab === "foods" ? (
          <FoodsHub
            foods={foods}
            recipes={recipes}
            onAddFood={addFood}
            onAddRecipe={addRecipe}
            onDeleteFood={deleteFood}
            onDeleteRecipe={deleteRecipe}
            onToggleFoodFavorite={toggleFoodFavorite}
            onImportFood={addEntry}
          />
        ) : null}

        {tab === "ideas" ? (
          <Ideas
            foods={foods}
            entries={entries}
            profile={profile}
            totalFiber={totalFiber}
            lastAmounts={lastAmounts}
            onQuickAdd={quickAddFood}
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
