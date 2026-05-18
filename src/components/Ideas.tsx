import { CalendarDays, Flame, Plus, Star, TrendingUp } from "lucide-react";
import { Card } from "./Card";
import { calculateFiber, formatFiber, getTodayKey } from "../lib/fiber";
import type {
  Food,
  FoodEntry,
  LastAmountMap,
  MealCategory,
  UserProfile,
} from "../types";

type Props = {
  foods: Food[];
  entries: FoodEntry[];
  profile: UserProfile;
  totalFiber: number;
  lastAmounts?: LastAmountMap;
  onQuickAdd?: (food: Food, mealCategory: MealCategory) => void;
};

const mealOptions: { key: MealCategory; label: string; emoji: string }[] = [
  { key: "breakfast", label: "Breakfast", emoji: "☕" },
  { key: "lunch", label: "Lunch", emoji: "🥗" },
  { key: "dinner", label: "Dinner", emoji: "🍲" },
  { key: "snacks", label: "Snacks", emoji: "🍎" },
];

function getDateKey(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function getFood(foods: Food[], foodId: string) {
  return foods.find((food) => food.id === foodId);
}

function getEntryFiber(entry: FoodEntry, foods: Food[]) {
  const food = getFood(foods, entry.foodId);
  if (!food) return 0;
  return calculateFiber(entry.amountGrams, food.fiberPer100g);
}

export function Ideas({
  foods,
  entries,
  profile,
  totalFiber,
  lastAmounts = {},
  onQuickAdd,
}: Props) {
  const today = getTodayKey();
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const key = getDateKey(index - 6);
    const dayEntries = entries.filter((entry) => entry.date === key);
    const fiber = dayEntries.reduce(
      (sum, entry) => sum + getEntryFiber(entry, foods),
      0,
    );

    return { key, fiber, count: dayEntries.length };
  });

  const weeklyTotal = lastSevenDays.reduce((sum, day) => sum + day.fiber, 0);
  const weeklyAverage = weeklyTotal / 7;
  const bestDay = [...lastSevenDays].sort((a, b) => b.fiber - a.fiber)[0];
  const todayPercent = Math.min(100, (totalFiber / profile.dailyFiberGoal) * 100);
  const averagePercent = Math.min(100, (weeklyAverage / profile.dailyFiberGoal) * 100);

  const usedCounts = new Map<string, number>();
  for (const entry of entries) {
    usedCounts.set(entry.foodId, (usedCounts.get(entry.foodId) ?? 0) + 1);
  }

  const quickFoods = foods
    .filter((food) => food.isFavorite || food.source === "recipe" || usedCounts.has(food.id))
    .sort((a, b) => {
      if (a.source === "recipe" && b.source !== "recipe") return -1;
      if (a.source !== "recipe" && b.source === "recipe") return 1;
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return (usedCounts.get(b.id) ?? 0) - (usedCounts.get(a.id) ?? 0);
    })
    .slice(0, 8);

  const recipeCards = foods.filter((food) => food.source === "recipe").slice(0, 6);

  return (
    <>
      <header className="mb-5">
        <h1 className="text-[34px] font-black leading-none text-slate-950">
          Insights
        </h1>
        <p className="mt-3 text-base font-semibold text-slate-500">
          Weekly averages, streaks and quick-add meals.
        </p>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3">
        <Card className="border-2 border-slate-200 p-4 card-pop">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <TrendingUp size={21} />
          </div>
          <p className="text-[24px] font-black text-slate-950">
            {formatFiber(weeklyAverage)}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            7-day average
          </p>
        </Card>

        <Card className="border-2 border-slate-200 p-4 card-pop">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <Flame size={21} />
          </div>
          <p className="text-[24px] font-black text-slate-950">
            {Math.round(todayPercent)}%
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Today progress
          </p>
        </Card>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[24px] font-black text-slate-950">Weekly fiber</h2>
          <p className="text-sm font-black text-emerald-700">
            avg {Math.round(averagePercent)}%
          </p>
        </div>

        <Card className="border-2 border-slate-200 p-4">
          <div className="mb-4 flex items-center justify-between text-sm font-black text-slate-500">
            <span>This week</span>
            <span>Best: {formatFiber(bestDay?.fiber ?? 0)}</span>
          </div>

          <div className="flex h-28 items-end gap-2">
            {lastSevenDays.map((day) => {
              const height = Math.max(
                8,
                Math.min(100, (day.fiber / profile.dailyFiberGoal) * 100),
              );
              const isToday = day.key === today;
              const label = new Date(day.key).toLocaleDateString("en-US", {
                weekday: "short",
              });

              return (
                <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-20 w-full items-end rounded-full bg-slate-100 px-1">
                    <div
                      className={`w-full rounded-full transition-all duration-500 ${
                        isToday ? "bg-emerald-500" : "bg-emerald-300"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-black text-slate-500">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={22} className="text-slate-700" />
          <h2 className="text-[24px] font-black text-slate-950">
            Streak calendar
          </h2>
        </div>

        <Card className="border-2 border-slate-200 p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }, (_, index) => {
              const key = getDateKey(index - 27);
              const dayEntries = entries.filter((entry) => entry.date === key);
              const dayFiber = dayEntries.reduce(
                (sum, entry) => sum + getEntryFiber(entry, foods),
                0,
              );
              const active = dayFiber > 0;
              const strong = dayFiber >= profile.dailyFiberGoal;

              return (
                <div
                  key={key}
                  title={`${key}: ${formatFiber(dayFiber)}`}
                  className={`aspect-square rounded-xl transition ${
                    strong
                      ? "bg-emerald-500"
                      : active
                        ? "bg-emerald-200"
                        : "bg-slate-100"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-black text-slate-500">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-slate-100" />
              <span className="h-3 w-3 rounded bg-emerald-200" />
              <span className="h-3 w-3 rounded bg-emerald-500" />
            </div>
            <span>Goal</span>
          </div>
        </Card>
      </section>

      {recipeCards.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-3 text-[24px] font-black text-slate-950">
            Recipe cards
          </h2>

          <div className="flex flex-col gap-3">
            {recipeCards.map((food) => (
              <Card key={food.id} className="border-2 border-slate-200 p-4 card-pop">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                    {food.emoji ?? "🍲"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-black text-slate-950">
                      {food.name}
                    </p>
                    <p className="text-sm font-semibold text-slate-500">
                      ~{formatFiber(calculateFiber(food.servingGrams ?? 100, food.fiberPer100g))} per serving
                    </p>
                  </div>
                  {onQuickAdd ? (
                    <button
                      onClick={() => onQuickAdd(food, "lunch")}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition active:scale-90"
                    >
                      <Plus size={21} strokeWidth={3} />
                    </button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Star size={22} className="text-yellow-500" fill="currentColor" />
          <h2 className="text-[24px] font-black text-slate-950">
            Quick add meals
          </h2>
        </div>

        {quickFoods.length === 0 ? (
          <Card className="border-2 border-slate-200 p-5">
            <p className="text-lg font-black text-slate-950">No quick adds yet</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Favorite foods or create recipes to see them here.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {quickFoods.map((food) => {
              const amount = food.servingGrams ?? lastAmounts[food.id] ?? 100;
              const fiber = calculateFiber(amount, food.fiberPer100g);

              return (
                <Card key={food.id} className="border-2 border-slate-200 p-4 card-pop">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl">
                      {food.emoji ?? "🍽️"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-black text-slate-950">
                        {food.name}
                      </p>
                      <p className="text-sm font-semibold text-slate-500">
                        {Math.round(amount)}g · ~{formatFiber(fiber)} fiber
                      </p>
                    </div>

                    {onQuickAdd ? (
                      <div className="flex gap-2">
                        {mealOptions.slice(0, 3).map((meal) => (
                          <button
                            key={meal.key}
                            onClick={() => onQuickAdd(food, meal.key)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-lg transition active:scale-90"
                            title={`Add to ${meal.label}`}
                          >
                            {meal.emoji}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
