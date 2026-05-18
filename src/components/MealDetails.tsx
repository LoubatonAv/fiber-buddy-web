import { ArrowLeft, Check, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { Card } from "./Card";
import { calculateFiber, formatFiber } from "../lib/fiber";
import type { Food, FoodEntry, MealCategory } from "../types";

type Props = {
  meal: MealCategory;
  foods: Food[];
  entries: FoodEntry[];
  dailyGoal: number;
  onBack: () => void;
  onAddMore: () => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, amountGrams: number) => void;
};

const mealUi: Record<
  MealCategory,
  {
    title: string;
    icon: string;
    bg: string;
    targetPart: number;
  }
> = {
  breakfast: {
    title: "Breakfast",
    icon: "☕",
    bg: "bg-amber-50",
    targetPart: 0.25,
  },
  lunch: {
    title: "Lunch",
    icon: "🥗",
    bg: "bg-emerald-50",
    targetPart: 0.3,
  },
  dinner: {
    title: "Dinner",
    icon: "🍲",
    bg: "bg-orange-50",
    targetPart: 0.3,
  },
  snacks: {
    title: "Snacks",
    icon: "🍎",
    bg: "bg-emerald-50",
    targetPart: 0.15,
  },
};

export function MealDetails({
  meal,
  foods,
  entries,
  dailyGoal,
  onBack,
  onAddMore,
  onDeleteEntry,
  onUpdateEntry,
}: Props) {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const ui = mealUi[meal];
  const mealTarget = dailyGoal * ui.targetPart;

  function getFood(foodId: string) {
    return foods.find((food) => food.id === foodId);
  }

  function getEntryFiber(entry: FoodEntry) {
    const food = getFood(entry.foodId);
    if (!food) return 0;

    return calculateFiber(entry.amountGrams, food.fiberPer100g);
  }

  const totalFiber = entries.reduce(
    (sum, entry) => sum + getEntryFiber(entry),
    0,
  );

  const remaining = Math.max(0, mealTarget - totalFiber);
  const percent =
    mealTarget > 0 ? Math.min(100, (totalFiber / mealTarget) * 100) : 0;

  function getDraft(entry: FoodEntry) {
    return drafts[entry.id] ?? String(entry.amountGrams);
  }

  function startEditing(entry: FoodEntry) {
    setEditingEntryId(entry.id);
    setDrafts((current) => ({
      ...current,
      [entry.id]: String(entry.amountGrams),
    }));
  }

  function updateDraft(entryId: string, value: string) {
    setDrafts((current) => ({
      ...current,
      [entryId]: value,
    }));
  }

  function cancelEdit() {
    setEditingEntryId(null);
  }

  function saveEdit(entry: FoodEntry) {
    const amount = Number(getDraft(entry));

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid amount in grams.");
      return;
    }

    onUpdateEntry(entry.id, amount);
    setEditingEntryId(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f7f8f8]">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-8 no-scrollbar">
        <header className="mb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-950"
          >
            <ArrowLeft size={31} />
          </button>

          <div className="min-w-0">
            <h1 className="text-[31px] font-black leading-none text-slate-950">
              {ui.title}
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Fiber for this meal
            </p>
          </div>
        </header>

        <section
          className={`mb-5 flex h-[136px] items-center justify-center rounded-[1.4rem] border-2 border-slate-200 ${ui.bg}`}
        >
          <div className="text-[68px]">{ui.icon}</div>
        </section>

        <Card className="mb-5 overflow-hidden border-2 border-slate-200">
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            <div className="p-4 text-center">
              <p className="text-[21px] font-black text-slate-950">
                {formatFiber(totalFiber)}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Eaten</p>
            </div>

            <div className="p-4 text-center">
              <p className="text-[21px] font-black text-slate-950">
                {formatFiber(remaining)}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Left</p>
            </div>

            <div className="p-4 text-center">
              <p className="text-[21px] font-black text-slate-950">
                {entries.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Items</p>
            </div>
          </div>
        </Card>

        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[25px] font-black text-slate-950">Progress</h2>

            <p className="text-base font-black text-emerald-700">
              {Math.round(percent)}%
            </p>
          </div>

          <Card className="border-2 border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-semibold text-slate-600">Fiber</p>

              <p className="text-base font-black text-slate-950">
                {formatFiber(totalFiber)} / {formatFiber(mealTarget)}
              </p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              {percent > 0 ? (
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${percent}%` }}
                />
              ) : null}
            </div>
          </Card>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-[25px] font-black text-slate-950">Foods</h2>

          {entries.length === 0 ? (
            <Card className="border-2 border-slate-200 p-5">
              <p className="text-lg font-black text-slate-950">No foods yet</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Add something to this meal.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => {
                const food = getFood(entry.foodId);
                if (!food) return null;

                const isEditing = editingEntryId === entry.id;
                const draft = getDraft(entry);
                const draftAmount = Number(draft);

                const previewAmount =
                  isEditing && Number.isFinite(draftAmount) && draftAmount > 0
                    ? draftAmount
                    : entry.amountGrams;

                const previewFiber = calculateFiber(
                  previewAmount,
                  food.fiberPer100g,
                );

                return (
                  <Card
                    key={entry.id}
                    className="border-2 border-slate-200 px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl">
                        {food.emoji ?? "🍽️"}
                      </div>

                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span className="min-w-0 truncate text-[17px] font-black leading-tight text-slate-950">
                          {food.name}
                        </span>

                        {isEditing ? (
                          <>
                            <input
                              value={draft}
                              onChange={(event) =>
                                updateDraft(entry.id, event.target.value)
                              }
                              inputMode="decimal"
                              autoFocus
                              className="h-9 w-[72px] shrink-0 rounded-2xl border border-emerald-400 bg-white px-2 text-center text-sm font-black text-slate-950 outline-none"
                            />

                            <span className="shrink-0 text-sm font-black text-slate-500">
                              g
                            </span>
                          </>
                        ) : (
                          <span className="shrink-0 text-sm font-semibold text-slate-500">
                            {entry.amountGrams}g
                          </span>
                        )}

                        <span className="shrink-0 text-sm font-semibold text-slate-500">
                          ~{formatFiber(previewFiber)} fiber
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (isEditing) {
                            saveEdit(entry);
                          } else {
                            startEditing(entry);
                          }
                        }}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          isEditing
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        title={isEditing ? "Save grams" : "Edit grams"}
                      >
                        {isEditing ? <Check size={18} /> : <Pencil size={17} />}
                      </button>

                      <button
                        onClick={() => {
                          if (isEditing) {
                            cancelEdit();
                          } else {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                        title={isEditing ? "Cancel edit" : "Remove"}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-[#f7f8f8] px-4 py-4">
        <button
          onClick={onAddMore}
          className="flex h-[62px] w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#202422] text-[20px] font-black text-white shadow-xl shadow-black/15 transition active:scale-[0.99]"
        >
          <Plus size={22} strokeWidth={4} />
          Add more
        </button>
      </div>
    </div>
  );
}
