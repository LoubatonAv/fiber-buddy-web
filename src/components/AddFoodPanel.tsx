import { ArrowLeft, Check, Pencil, Plus, Search, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateFiber, formatFiber } from "../lib/fiber";
import type {
  AddMode,
  Food,
  FoodEntry,
  LastAmountMap,
  MealCategory,
} from "../types";

type AddedEntry = {
  entryId: string;
  food: Food;
  amountGrams: number;
  mealCategory: MealCategory;
};

type Props = {
  foods: Food[];
  entries: FoodEntry[];
  lastAmounts: LastAmountMap;
  selectedMeal: MealCategory;
  onAdd: (
    food: Food,
    amountGrams: number,
    mealCategory: MealCategory,
  ) => FoodEntry;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, amountGrams: number) => void;
  onToggleFavorite: (foodId: string) => void;
  onDone: () => void;
};

const mealLabels: Record<MealCategory, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const mealEmoji: Record<MealCategory, string> = {
  breakfast: "☕",
  lunch: "🥗",
  dinner: "🍲",
  snacks: "🍎",
};

export function AddFoodPanel({
  foods,
  entries,
  lastAmounts,
  selectedMeal,
  onAdd,
  onDeleteEntry,
  onUpdateEntry,
  onToggleFavorite,
  onDone,
}: Props) {
  const [mode, setMode] = useState<AddMode>("recent");
  const [search, setSearch] = useState("");
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});
  const [addedEntries, setAddedEntries] = useState<AddedEntry[]>([]);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [editDrafts, setEditDrafts] = useState<Record<string, string>>({});
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editingAddedEntryId, setEditingAddedEntryId] = useState<string | null>(
    null,
  );
  const [spinningFoodId, setSpinningFoodId] = useState<string | null>(null);
  const [fairyFoodId, setFairyFoodId] = useState<string | null>(null);
  const [counterPulseKey, setCounterPulseKey] = useState(0);

  const [entriesForSorting] = useState<FoodEntry[]>(() => entries);

  const recentFoodIds = useMemo(() => {
    const ids: string[] = [];

    for (const entry of entriesForSorting) {
      if (!ids.includes(entry.foodId)) ids.push(entry.foodId);
    }

    return ids;
  }, [entriesForSorting]);

  const frequentFoodIds = useMemo(() => {
    const counts = new Map<string, number>();

    for (const entry of entriesForSorting) {
      counts.set(entry.foodId, (counts.get(entry.foodId) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([foodId]) => foodId);
  }, [entriesForSorting]);

  const comboFoodIds = useMemo(() => {
    const mealEntries = entriesForSorting.filter(
      (entry) => (entry.mealCategory ?? "snacks") === selectedMeal,
    );

    const recentIds = recentFoodIds.slice(0, 6);
    const scores = new Map<string, number>();

    for (const date of [...new Set(mealEntries.map((entry) => entry.date))]) {
      const dayFoodIds = mealEntries
        .filter((entry) => entry.date === date)
        .map((entry) => entry.foodId);

      const dayHasRecent = dayFoodIds.some((id) => recentIds.includes(id));
      if (!dayHasRecent) continue;

      for (const foodId of dayFoodIds) {
        scores.set(foodId, (scores.get(foodId) ?? 0) + 1);
      }
    }

    const scored = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([foodId]) => foodId);

    if (scored.length > 0) return scored;

    return foods
      .filter((food) => food.fiberPer100g >= 5)
      .sort((a, b) => b.fiberPer100g - a.fiberPer100g)
      .map((food) => food.id);
  }, [entriesForSorting, foods, recentFoodIds, selectedMeal]);

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    let ordered: Food[];

    if (mode === "favorites") {
      ordered = foods.filter((food) => food.isFavorite);
    } else if (mode === "recipes") {
      ordered = foods.filter((food) => food.source === "recipe");
    } else if (mode === "all") {
      ordered = [...foods];
    } else if (mode === "frequent") {
      const frequent = frequentFoodIds
        .map((id) => foods.find((food) => food.id === id))
        .filter(Boolean) as Food[];

      const rest = foods.filter((food) => !frequentFoodIds.includes(food.id));
      ordered = [...frequent, ...rest];
    } else if (mode === "combo") {
      const combo = comboFoodIds
        .map((id) => foods.find((food) => food.id === id))
        .filter(Boolean) as Food[];

      const rest = foods.filter((food) => !comboFoodIds.includes(food.id));
      ordered = [...combo, ...rest];
    } else {
      const recent = recentFoodIds
        .map((id) => foods.find((food) => food.id === id))
        .filter(Boolean) as Food[];

      const rest = foods.filter((food) => !recentFoodIds.includes(food.id));
      ordered = [...recent, ...rest];
    }

    ordered = ordered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });

    if (!query) return ordered;

    return ordered
      .filter((food) => food.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;

        return a.name.localeCompare(b.name);
      });
  }, [foods, mode, search, recentFoodIds, frequentFoodIds, comboFoodIds]);

  function getAmount(food: Food) {
    return (
      amountDrafts[food.id] ??
      String(lastAmounts[food.id] ?? food.servingGrams ?? 100)
    );
  }

  function setAmount(foodId: string, value: string) {
    setAmountDrafts((current) => ({
      ...current,
      [foodId]: value,
    }));
  }

  function saveFoodAmount(food: Food) {
    const amount = Number(getAmount(food));

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid amount in grams.");
      return;
    }

    setEditingFoodId(null);
  }

  function handleAdd(food: Food) {
    const amountGrams = Number(getAmount(food));

    if (!Number.isFinite(amountGrams) || amountGrams <= 0) {
      alert("Enter a valid amount in grams.");
      return;
    }

    const createdEntry = onAdd(food, amountGrams, selectedMeal);

    setAddedEntries((current) => [
      ...current,
      {
        entryId: createdEntry.id,
        food,
        amountGrams,
        mealCategory: selectedMeal,
      },
    ]);

    setSpinningFoodId(food.id);
    setFairyFoodId(food.id);
    setCounterPulseKey((current) => current + 1);

    window.setTimeout(() => setSpinningFoodId(null), 390);
    window.setTimeout(() => setFairyFoodId(null), 650);
  }

  function removeAdded(entryId: string) {
    onDeleteEntry(entryId);

    setAddedEntries((current) =>
      current.filter((entry) => entry.entryId !== entryId),
    );

    if (editingAddedEntryId === entryId) {
      setEditingAddedEntryId(null);
    }
  }

  function getEditDraft(entry: AddedEntry) {
    return editDrafts[entry.entryId] ?? String(entry.amountGrams);
  }

  function setEditDraft(entryId: string, value: string) {
    setEditDrafts((current) => ({
      ...current,
      [entryId]: value,
    }));
  }

  function startEditingAdded(entry: AddedEntry) {
    setEditingAddedEntryId(entry.entryId);
    setEditDraft(entry.entryId, String(entry.amountGrams));
  }

  function updateAddedAmountDraft(entry: AddedEntry, value: string) {
    setEditDraft(entry.entryId, value);
  }

  function saveAddedAmount(entry: AddedEntry) {
    const amount = Number(getEditDraft(entry));

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid amount in grams.");
      return;
    }

    onUpdateEntry(entry.entryId, amount);

    setAddedEntries((current) =>
      current.map((item) =>
        item.entryId === entry.entryId
          ? { ...item, amountGrams: amount }
          : item,
      ),
    );

    setEditingAddedEntryId(null);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#f7f8f8]">
      <div className="shrink-0 px-4 pt-8">
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={onDone}
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-950"
            title="Back"
          >
            <ArrowLeft size={34} />
          </button>

          <div className="flex flex-1 items-center gap-3 pl-3">
            <span className="text-3xl">{mealEmoji[selectedMeal]}</span>
            <h1 className="text-[32px] font-black leading-none text-slate-950">
              {mealLabels[selectedMeal]}
            </h1>
          </div>

          <button
            onClick={onDone}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            title="Close"
          >
            <X size={24} />
          </button>
        </header>

        <div className="relative mb-4">
          <Search
            size={26}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-950"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`What did you have for ${mealLabels[
              selectedMeal
            ].toLowerCase()}?`}
            className="h-[64px] w-full rounded-[1.25rem] border-[3px] border-[#20b894] bg-white pl-16 pr-5 text-[16px] font-semibold text-slate-700 outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <button className="flex h-[54px] items-center justify-between rounded-[1.1rem] border-2 border-slate-200 bg-white px-5 text-[16px] font-black text-slate-950">
            Foods
            <span className="text-xs">▾</span>
          </button>

          <div className="relative">
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as AddMode)}
              className="h-[54px] w-full appearance-none rounded-[1.1rem] border-2 border-slate-200 bg-white px-5 text-[16px] font-black text-slate-950 outline-none"
            >
              <option value="recent">Recent</option>
              <option value="frequent">Frequent</option>
              <option value="favorites">Favorites</option>
              <option value="recipes">Recipes</option>
              <option value="all">All</option>
              <option value="combo">Combo</option>
            </select>

            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs">
              ▾
            </span>
          </div>
        </div>
      </div>

      <div
        key={`${search.trim()}-${mode}`}
        className="food-results-enter min-h-0 flex-1 overflow-y-auto px-4 pb-4"
      >
        {filteredFoods.map((food) => {
          const amount = getAmount(food);
          const amountNumber = Number(amount);
          const estimatedFiber = calculateFiber(
            Number.isFinite(amountNumber) ? amountNumber : 0,
            food.fiberPer100g,
          );
          const isEditing = editingFoodId === food.id;
          const isSpinning = spinningFoodId === food.id;
          const showFairyDust = fairyFoodId === food.id;

          return (
            <div
              key={food.id}
              className="flex min-h-[58px] animate-[fadeSlideIn_180ms_ease-out] items-center border-b border-slate-200 py-2 transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => onToggleFavorite(food.id)}
                className={`mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  food.isFavorite
                    ? "bg-yellow-100 text-yellow-500"
                    : "bg-slate-100 text-slate-400"
                }`}
                title="Favorite"
              >
                <Star
                  size={17}
                  fill={food.isFavorite ? "currentColor" : "none"}
                />
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
                <span className="min-w-0 truncate text-[18px] font-semibold leading-tight text-slate-950">
                  {food.name}
                </span>

                {isEditing ? (
                  <>
                    <input
                      value={amount}
                      onChange={(event) =>
                        setAmount(food.id, event.target.value)
                      }
                      inputMode="decimal"
                      autoFocus
                      className="h-9 w-[72px] shrink-0 rounded-2xl border border-emerald-400 bg-white px-2 text-center text-sm font-black text-slate-950 outline-none"
                    />

                    <span className="shrink-0 text-[13px] font-black text-slate-500">
                      g
                    </span>
                  </>
                ) : (
                  <span className="shrink-0 text-[13px] font-semibold text-slate-500">
                    {amount}g
                  </span>
                )}

                <span className="shrink-0 text-[13px] font-semibold text-slate-500">
                  ~{formatFiber(estimatedFiber)} fiber
                </span>
              </div>

              <button
                onClick={() => {
                  if (isEditing) {
                    saveFoodAmount(food);
                  } else {
                    setEditingFoodId(food.id);
                  }
                }}
                className={`mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isEditing
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
                title={isEditing ? "Save grams" : "Edit grams"}
              >
                {isEditing ? <Check size={18} /> : <Pencil size={16} />}
              </button>

              <div className="relative shrink-0">
                {showFairyDust ? (
                  <div className="fairy-dust">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                ) : null}

                <button
                  onClick={() => handleAdd(food)}
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-[#20b894] bg-[#f7f8f8] text-[#20b894] transition active:scale-90 ${
                    isSpinning ? "plus-spin-once" : ""
                  }`}
                  title="Add"
                >
                  <Plus size={23} strokeWidth={2.8} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-[#f7f8f8] px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            key={counterPulseKey}
            onClick={() => setIsTrackerOpen(true)}
            className="counter-pop flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border-[3.5px] border-[#20b894] bg-white text-[20px] font-semibold text-[#20b894] shadow-xl shadow-black/10"
          >
            {addedEntries.length}
          </button>

          <button
            onClick={onDone}
            className="h-[62px] flex-1 rounded-[1.2rem] bg-[#202422] text-[20px] font-black text-white shadow-xl shadow-black/20"
          >
            Done
          </button>
        </div>
      </div>

      {isTrackerOpen ? (
        <div className="absolute inset-0 z-[100] flex flex-col bg-[#f7f8f8]">
          <div className="flex h-[86px] shrink-0 items-center border-b border-slate-200 bg-white px-5">
            <button
              onClick={() => setIsTrackerOpen(false)}
              className="mr-6 flex h-11 w-11 items-center justify-center rounded-full text-slate-600"
            >
              <X size={30} />
            </button>

            <div>
              <h2 className="text-[29px] font-black leading-none text-slate-800">
                Just Added
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {addedEntries.length} item
                {addedEntries.length === 1 ? "" : "s"} added to{" "}
                {mealLabels[selectedMeal].toLowerCase()}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {addedEntries.length === 0 ? (
              <div className="mt-8 rounded-[1.4rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-xl font-black text-slate-950">
                  Nothing added yet
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Add a food first, then it will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-4">
                {addedEntries.map((entry) => {
                  const isEditingAdded = editingAddedEntryId === entry.entryId;
                  const draft = getEditDraft(entry);
                  const draftAmount = Number(draft);

                  const amountForPreview =
                    isEditingAdded &&
                    Number.isFinite(draftAmount) &&
                    draftAmount > 0
                      ? draftAmount
                      : entry.amountGrams;

                  const fiber = calculateFiber(
                    amountForPreview,
                    entry.food.fiberPer100g,
                  );

                  return (
                    <div
                      key={entry.entryId}
                      className="rounded-[1.25rem] border border-slate-200 bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl">
                          {entry.food.emoji ?? "🍽️"}
                        </div>

                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <span className="min-w-0 truncate text-[17px] font-black leading-tight text-slate-950">
                            {entry.food.name}
                          </span>

                          {isEditingAdded ? (
                            <>
                              <input
                                value={draft}
                                onChange={(event) =>
                                  updateAddedAmountDraft(
                                    entry,
                                    event.target.value,
                                  )
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
                            ~{formatFiber(fiber)} fiber
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (isEditingAdded) {
                              saveAddedAmount(entry);
                            } else {
                              startEditingAdded(entry);
                            }
                          }}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            isEditingAdded
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                          title={isEditingAdded ? "Save grams" : "Edit grams"}
                        >
                          {isEditingAdded ? (
                            <Check size={18} />
                          ) : (
                            <Pencil size={17} />
                          )}
                        </button>

                        <button
                          onClick={() => removeAdded(entry.entryId)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                          title="Remove"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-[#f7f8f8] px-5 py-4">
            <button
              onClick={() => setIsTrackerOpen(false)}
              className="h-[62px] w-full rounded-[1.2rem] bg-[#202422] text-[21px] font-black text-white"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
