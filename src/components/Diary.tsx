import { Check, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { calculateFiber, formatFiber } from "../lib/fiber";
import type { Food, FoodEntry, MealCategory, UserProfile } from "../types";

type Props = {
  profile: UserProfile;
  foods: Food[];
  todayEntries: FoodEntry[];
  totalFiber: number;
  streak: number;
  onOpenAdd: (meal: MealCategory) => void;
  onOpenMeal: (meal: MealCategory) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, amountGrams: number) => void;
};

const mealUi: Record<
  MealCategory,
  { title: string; icon: string; targetPart: number }
> = {
  breakfast: { title: "Breakfast", icon: "☕", targetPart: 0.25 },
  lunch: { title: "Lunch", icon: "🥗", targetPart: 0.3 },
  dinner: { title: "Dinner", icon: "🍲", targetPart: 0.3 },
  snacks: { title: "Snacks", icon: "🍎", targetPart: 0.15 },
};

const mealOrder: MealCategory[] = ["breakfast", "lunch", "dinner", "snacks"];

function ProgressRing({
  percent,
  children,
}: {
  percent: number;
  children: React.ReactNode;
}) {
  const size = 126;
  const stroke = 10;
  const radius = size / 2 - stroke / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative flex h-[126px] w-[126px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          stroke="#dfe5e8"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />

        {safePercent > 0 ? (
          <circle
            stroke="#18b88f"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeLinecap="round"
          />
        ) : null}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

export function Diary({
  profile,
  foods,
  todayEntries,
  totalFiber,
  streak,
  onOpenAdd,
  onOpenMeal,
  onDeleteEntry,
  onUpdateEntry,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDrafts, setEditDrafts] = useState<Record<string, string>>({});

  const goal = profile.dailyFiberGoal;
  const remaining = Math.max(0, goal - totalFiber);
  const percent =
    goal > 0 ? Math.min(100, Math.round((totalFiber / goal) * 100)) : 0;

  const entriesByMeal = useMemo(() => {
    const groups: Record<MealCategory, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    for (const entry of todayEntries) {
      const meal = entry.mealCategory ?? "snacks";
      groups[meal].push(entry);
    }

    return groups;
  }, [todayEntries]);

  function getFood(foodId: string) {
    return foods.find((food) => food.id === foodId);
  }

  function getEntryFiber(entry: FoodEntry) {
    const food = getFood(entry.foodId);
    if (!food) return 0;

    return calculateFiber(entry.amountGrams, food.fiberPer100g);
  }

  function getMealFiber(entries: FoodEntry[]) {
    return entries.reduce((sum, entry) => sum + getEntryFiber(entry), 0);
  }

  function getDraft(entry: FoodEntry) {
    return editDrafts[entry.id] ?? String(entry.amountGrams);
  }

  function setDraft(entryId: string, value: string) {
    setEditDrafts((current) => ({
      ...current,
      [entryId]: value,
    }));
  }

  function saveEdit(entry: FoodEntry) {
    const nextAmount = Number(getDraft(entry));

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      alert("Enter a valid amount in grams.");
      return;
    }

    onUpdateEntry(entry.id, nextAmount);

    setEditDrafts((current) => {
      const next = { ...current };
      delete next[entry.id];
      return next;
    });
  }

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black leading-none text-slate-950">
            Today
          </h1>

          <p className="mt-2 text-[16px] font-semibold text-slate-950">
            Week 7
          </p>
        </div>

        <div className="flex items-center gap-3 text-[14px] font-black">
          <span title="Foods in database">💎 {foods.length}</span>
          <span title="Tracking streak">🔥 {streak}</span>
          <span title="Items logged today">🧺 {todayEntries.length}</span>
        </div>
      </header>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[29px] font-black leading-none text-slate-950">
            Summary
          </h2>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[14px] font-black text-emerald-800"
          >
            Details
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="block w-full text-left"
        >
          <Card className="border-[2px] border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="w-16 text-center">
                <p className="text-[19px] font-black text-slate-950">
                  {formatFiber(totalFiber)}
                </p>
                <p className="text-[13px] font-semibold text-slate-500">
                  Eaten
                </p>
              </div>

              <ProgressRing percent={percent}>
                <p className="text-[25px] font-black leading-none text-slate-950">
                  {formatFiber(remaining)}
                </p>
                <p className="mt-1 text-[14px] font-semibold text-slate-500">
                  Remaining
                </p>
              </ProgressRing>

              <div className="w-16 text-center">
                <p className="text-[19px] font-black text-slate-950">
                  {formatFiber(goal)}
                </p>
                <p className="text-[13px] font-semibold text-slate-500">Goal</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              {[
                { label: "Goal", value: goal, fill: 100 },
                { label: "Eaten", value: totalFiber, fill: percent },
                { label: "Left", value: remaining, fill: 0 },
              ].map((item) => (
                <div key={item.label}>
                  <p className="mb-2 text-center text-[14px] font-semibold text-slate-600">
                    {item.label}
                  </p>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    {item.fill > 0 ? (
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, item.fill))}%`,
                        }}
                      />
                    ) : null}
                  </div>

                  <p className="mt-2 text-center text-[13px] font-black text-slate-950">
                    {formatFiber(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </button>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[29px] font-black leading-none text-slate-950">
            Nutrition
          </h2>

          <button className="text-[14px] font-black text-emerald-800">
            More
          </button>
        </div>

        <Card className="overflow-hidden border-[2px] border-slate-200">
          {mealOrder.map((meal, index) => {
            const entries = entriesByMeal[meal];
            const mealFiber = getMealFiber(entries);
            const mealTarget = goal * mealUi[meal].targetPart;
            const mealPercent =
              mealTarget > 0
                ? Math.min(100, (mealFiber / mealTarget) * 100)
                : 0;

            const firstEntry = entries[0];
            const firstFood = firstEntry ? getFood(firstEntry.foodId) : null;

            return (
              <div
                key={meal}
                className={`flex items-center gap-3 p-4 ${
                  index !== mealOrder.length - 1
                    ? "border-b border-slate-200"
                    : ""
                }`}
              >
                <button
                  onClick={() => onOpenMeal(meal)}
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-200"
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        mealPercent > 0
                          ? `conic-gradient(#18b88f ${mealPercent}%, #dfe5e8 0)`
                          : "#dfe5e8",
                    }}
                  />

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                    {mealUi[meal].icon}
                  </div>
                </button>

                <button
                  onClick={() => onOpenMeal(meal)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-[17px] font-black leading-tight text-slate-950">
                    {mealUi[meal].title} →
                  </p>

                  <p className="mt-1 text-[16px] font-semibold text-slate-500">
                    {formatFiber(mealFiber)} / {formatFiber(mealTarget)}
                  </p>

                  <p className="truncate text-[12px] font-semibold text-slate-400">
                    {firstFood
                      ? `${firstFood.name}${
                          entries.length > 1
                            ? ` + ${entries.length - 1} more`
                            : ""
                        }`
                      : "No foods yet"}
                  </p>
                </button>

                <button
                  onClick={() => onOpenAdd(meal)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition active:scale-90"
                >
                  <Plus size={23} strokeWidth={4} />
                </button>
              </div>
            );
          })}
        </Card>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-3 pb-3 backdrop-blur-sm sm:items-center">
          <div className="max-h-[88vh] w-full max-w-[430px] overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Today’s foods
                </h2>

                <p className="font-semibold text-slate-500">
                  Edit grams or remove foods.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-4">
              {todayEntries.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="font-black text-slate-950">
                    No foods yet today.
                  </p>

                  <p className="font-semibold text-slate-500">
                    Add something first, then it will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayEntries.map((entry) => {
                    const food = getFood(entry.foodId);
                    if (!food) return null;

                    const draftAmount = Number(getDraft(entry));
                    const fiber = calculateFiber(
                      Number.isFinite(draftAmount)
                        ? draftAmount
                        : entry.amountGrams,
                      food.fiberPer100g,
                    );

                    return (
                      <div
                        key={entry.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                              {food.emoji ?? "🍽️"}
                            </div>

                            <div>
                              <p className="font-black text-slate-950">
                                {food.name}
                              </p>

                              <p className="text-sm font-semibold text-slate-500">
                                ~{formatFiber(fiber)} fiber
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="rounded-full bg-red-100 p-2 text-red-500"
                            title="Remove"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            value={getDraft(entry)}
                            onChange={(event) =>
                              setDraft(entry.id, event.target.value)
                            }
                            inputMode="decimal"
                            className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center font-black text-slate-950 outline-none focus:border-emerald-400"
                          />

                          <span className="text-sm font-black text-slate-500">
                            grams
                          </span>

                          <button
                            onClick={() => saveEdit(entry)}
                            className="ml-auto flex items-center gap-1 rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-black text-white"
                          >
                            <Check size={16} />
                            Save
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4">
              <Button onClick={() => setIsModalOpen(false)} className="w-full">
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
