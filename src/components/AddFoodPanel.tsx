import { ArrowLeft, Plus, Search, X } from "lucide-react";
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

type ComboGroup = {
  id: string;
  title: string;
  foods: Food[];
  count: number;
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
  onToggleFavorite?: (foodId: string) => void;
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
  const [selectedFoodForAmount, setSelectedFoodForAmount] =
    useState<Food | null>(null);

  const [addedEntries, setAddedEntries] = useState<AddedEntry[]>([]);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [editDrafts, setEditDrafts] = useState<Record<string, string>>({});
  const [editingAddedEntryId, setEditingAddedEntryId] = useState<string | null>(
    null,
  );
  const [spinningFoodId, setSpinningFoodId] = useState<string | null>(null);
  const [fairyFoodId, setFairyFoodId] = useState<string | null>(null);
  const [counterPulseKey, setCounterPulseKey] = useState(0);
  const [selectedCombo, setSelectedCombo] = useState<ComboGroup | null>(null);
  const [comboDrafts, setComboDrafts] = useState<Record<string, string>>({});
  // Freeze sorting while this screen is open.
  // This prevents foods from jumping after pressing +.
  const [entriesForSorting] = useState<FoodEntry[]>(() => entries);

  const mealEntriesForSorting = useMemo(() => {
    return entriesForSorting.filter(
      (entry) => (entry.mealCategory ?? "snacks") === selectedMeal,
    );
  }, [entriesForSorting, selectedMeal]);

  const recentFoodIds = useMemo(() => {
    const ids: string[] = [];

    for (const entry of mealEntriesForSorting) {
      if (!ids.includes(entry.foodId)) {
        ids.push(entry.foodId);
      }
    }

    return ids;
  }, [mealEntriesForSorting]);

  const frequentFoodIds = useMemo(() => {
    const counts = new Map<string, number>();

    for (const entry of mealEntriesForSorting) {
      counts.set(entry.foodId, (counts.get(entry.foodId) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([foodId]) => foodId);
  }, [mealEntriesForSorting]);

  function addFoodWithAmount(food: Food, amountGrams: number) {
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

    window.setTimeout(() => {
      setSpinningFoodId(null);
    }, 390);

    window.setTimeout(() => {
      setFairyFoodId(null);
    }, 650);
  }

  function getComboAmount(food: Food) {
    return comboDrafts[food.id] ?? getAmount(food);
  }

  function openComboEditor(combo: ComboGroup) {
    setSelectedCombo(combo);

    setComboDrafts((current) => {
      const next = { ...current };

      for (const food of combo.foods) {
        next[food.id] = next[food.id] ?? getAmount(food);
      }

      return next;
    });
  }

  function setComboAmount(foodId: string, value: string) {
    setComboDrafts((current) => ({
      ...current,
      [foodId]: value,
    }));
  }

  function getComboFiber(combo: ComboGroup) {
    return combo.foods.reduce((sum, food) => {
      const amount = Number(getComboAmount(food));

      if (!Number.isFinite(amount) || amount <= 0) return sum;

      return sum + calculateFiber(amount, food.fiberPer100g);
    }, 0);
  }

  function addCombo(combo: ComboGroup) {
    let added = 0;

    for (const food of combo.foods) {
      const amount = Number(getComboAmount(food));

      if (!Number.isFinite(amount) || amount <= 0) continue;

      addFoodWithAmount(food, amount);
      added += 1;
    }

    if (added === 0) {
      alert("Enter valid amounts first.");
      return;
    }

    setSelectedCombo(null);
  }

  const comboGroups = useMemo<ComboGroup[]>(() => {
    const selectedMealEntries = entries.filter(
      (entry) => (entry.mealCategory ?? "snacks") === selectedMeal,
    );

    const groupedByDate = new Map<string, FoodEntry[]>();

    for (const entry of selectedMealEntries) {
      const current = groupedByDate.get(entry.date) ?? [];
      current.push(entry);
      groupedByDate.set(entry.date, current);
    }

    const comboMap = new Map<
      string,
      {
        foodIds: string[];
        count: number;
      }
    >();

    for (const dayEntries of groupedByDate.values()) {
      const uniqueFoodIds: string[] = [];

      for (const entry of dayEntries) {
        if (!uniqueFoodIds.includes(entry.foodId)) {
          uniqueFoodIds.push(entry.foodId);
        }
      }

      if (uniqueFoodIds.length < 2) continue;

      const signature = [...uniqueFoodIds].sort().join("|");

      const existing = comboMap.get(signature);

      if (existing) {
        existing.count += 1;
      } else {
        comboMap.set(signature, {
          foodIds: uniqueFoodIds,
          count: 1,
        });
      }
    }

    return [...comboMap.entries()]
      .map(([signature, combo]) => {
        const comboFoods = combo.foodIds
          .map((foodId) => foods.find((food) => food.id === foodId))
          .filter(Boolean) as Food[];

        return {
          id: signature,
          title: comboFoods.map((food) => food.name).join(" + "),
          foods: comboFoods,
          count: combo.count,
        };
      })
      .filter((combo) => combo.foods.length >= 2)
      .sort((a, b) => b.count - a.count);
  }, [entries, foods, selectedMeal]);

  const filteredFoods = useMemo(() => {
    const mealFoods = foods.filter((food) =>
      food.mealCategories.includes(selectedMeal),
    );

    let ordered: Food[];

    if (mode === "recent") {
      const recent = recentFoodIds
        .map((id) => mealFoods.find((food) => food.id === id))
        .filter(Boolean) as Food[];

      const rest = mealFoods.filter((food) => !recentFoodIds.includes(food.id));

      ordered = [...recent, ...rest];
    } else if (mode === "frequent") {
      const frequent = frequentFoodIds
        .map((id) => mealFoods.find((food) => food.id === id))
        .filter(Boolean) as Food[];

      const rest = mealFoods.filter(
        (food) => !frequentFoodIds.includes(food.id),
      );

      ordered = [...frequent, ...rest];
    } else if (mode === "favorites") {
      ordered = mealFoods.filter((food) => food.isFavorite);
    } else if (mode === "all") {
      ordered = mealFoods;
    } else if (mode === "recipes") {
      ordered = [];
    } else {
      // combo is rendered separately as combo groups
      ordered = [];
    }

    if (!search.trim()) return ordered;

    return ordered.filter((food) =>
      food.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [foods, selectedMeal, mode, recentFoodIds, frequentFoodIds, search]);

  const filteredComboGroups = useMemo(() => {
    if (mode !== "combo") return comboGroups;

    if (!search.trim()) return comboGroups;

    return comboGroups.filter((combo) =>
      combo.title.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [comboGroups, mode, search]);

  function getAmount(food: Food) {
    return amountDrafts[food.id] ?? String(lastAmounts[food.id] ?? 100);
  }

  function setAmount(foodId: string, value: string) {
    setAmountDrafts((current) => ({
      ...current,
      [foodId]: value,
    }));
  }

  function handleAdd(food: Food) {
    const amountGrams = Number(getAmount(food));
    addFoodWithAmount(food, amountGrams);
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

  function openAmountEditor(food: Food) {
    setSelectedFoodForAmount(food);

    setAmountDrafts((current) => ({
      ...current,
      [food.id]: current[food.id] ?? String(lastAmounts[food.id] ?? 100),
    }));
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

        <div className="relative mb-5">
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

        <div className="mb-4 overflow-x-auto no-scrollbar">
          <div className="flex w-max min-w-full gap-2 rounded-[1.15rem] border border-slate-200 bg-white p-1.5 shadow-sm">
            {[
              { value: "recent", label: "Recent" },
              { value: "frequent", label: "Frequent" },
              { value: "combo", label: "Combo" },
              { value: "favorites", label: "★ Fav" },
            ].map((item) => {
              const isActive = mode === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value as AddMode)}
                  className={`h-10 shrink-0 rounded-xl px-4 text-[13px] font-black transition ${
                    isActive
                      ? "bg-[#202422] text-white shadow-sm"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {mode === "combo" ? (
          <>
            {filteredComboGroups.length === 0 ? (
              <div className="mt-8 rounded-[1.25rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-lg font-black text-slate-950">
                  No combos yet
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Add foods together in this meal, then combos will show here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredComboGroups.map((combo) => {
                  const comboFiber = getComboFiber(combo);

                  return (
                    <button
                      key={combo.id}
                      onClick={() => openComboEditor(combo)}
                      className="rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                          🍽️
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[17px] font-black leading-tight text-slate-950">
                            {combo.title}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {combo.foods.length} foods · used {combo.count}x · ~
                            {formatFiber(comboFiber)} fiber
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addCombo(combo);
                          }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#20b894] bg-white text-[#20b894] transition active:scale-90"
                          title="Add combo"
                        >
                          <Plus size={23} strokeWidth={2.8} />
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : mode === "favorites" && filteredFoods.length === 0 ? (
          <div className="mt-8 rounded-[1.25rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-black text-slate-950">
              No favorites yet
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Mark foods as favorite, then they will show here.
            </p>
          </div>
        ) : mode === "recipes" ? (
          <div className="mt-8 rounded-[1.25rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-black text-slate-950">
              Recipes coming soon
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Later we can add saved meals like yogurt bowl, sandwich, or cereal
              combo.
            </p>
          </div>
        ) : (
          filteredFoods.map((food) => {
            const amount = getAmount(food);
            const estimatedFiber = calculateFiber(
              Number(amount),
              food.fiberPer100g,
            );
            const isSpinning = spinningFoodId === food.id;
            const showFairyDust = fairyFoodId === food.id;

            return (
              <button
                key={food.id}
                onClick={() => openAmountEditor(food)}
                className="flex min-h-[76px] w-full items-center border-b border-slate-200 py-3 text-left"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="truncate text-[18px] font-black leading-tight text-slate-950">
                    {food.name}
                  </p>

                  <p className="mt-1 truncate text-[13px] font-semibold leading-tight text-slate-500">
                    {amount}g · ~{formatFiber(estimatedFiber)} fiber
                  </p>
                </div>

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
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAdd(food);
                    }}
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-[#20b894] bg-[#f7f8f8] text-[#20b894] transition active:scale-90 ${
                      isSpinning ? "plus-spin-once" : ""
                    }`}
                    title="Add"
                  >
                    <Plus size={23} strokeWidth={2.8} />
                  </button>
                </div>
              </button>
            );
          })
        )}
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

      {selectedFoodForAmount ? (
        <div className="absolute inset-0 z-[90] flex items-end bg-black/35 px-4 pb-4">
          <div className="w-full rounded-[1.5rem] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xl font-black text-slate-950">
                  {selectedFoodForAmount.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedFoodForAmount.fiberPer100g}g fiber per 100g
                </p>
              </div>

              <button
                onClick={() => setSelectedFoodForAmount(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-black text-slate-600">
                Amount
              </label>

              <div className="flex items-center gap-3">
                <input
                  value={getAmount(selectedFoodForAmount)}
                  onChange={(event) =>
                    setAmount(selectedFoodForAmount.id, event.target.value)
                  }
                  inputMode="decimal"
                  autoFocus
                  className="h-14 w-28 rounded-2xl border-2 border-emerald-400 bg-white px-3 text-center text-lg font-black text-slate-950 outline-none"
                />

                <span className="font-black text-slate-500">grams</span>

                <span className="ml-auto font-black text-slate-700">
                  ~
                  {formatFiber(
                    calculateFiber(
                      Number(getAmount(selectedFoodForAmount)),
                      selectedFoodForAmount.fiberPer100g,
                    ),
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                handleAdd(selectedFoodForAmount);
                setSelectedFoodForAmount(null);
              }}
              className="flex h-[58px] w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#202422] text-lg font-black text-white"
            >
              <Plus size={22} strokeWidth={4} />
              Add food
            </button>
          </div>
        </div>
      ) : null}
      {selectedCombo ? (
        <div className="absolute inset-0 z-[95] flex items-end bg-black/35 px-4 pb-4">
          <div className="w-full rounded-[1.5rem] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xl font-black text-slate-950">Edit combo</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedCombo.foods.length} foods · ~
                  {formatFiber(getComboFiber(selectedCombo))} fiber
                </p>
              </div>

              <button
                onClick={() => setSelectedCombo(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mb-5 flex max-h-[280px] flex-col gap-3 overflow-y-auto">
              {selectedCombo.foods.map((food) => {
                const amount = getComboAmount(food);
                const fiber = calculateFiber(Number(amount), food.fiberPer100g);

                return (
                  <div
                    key={food.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl">
                        {food.emoji ?? "🍽️"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-slate-950">
                          {food.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          ~{formatFiber(fiber)} fiber
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        value={amount}
                        onChange={(event) =>
                          setComboAmount(food.id, event.target.value)
                        }
                        inputMode="decimal"
                        className="h-12 w-28 rounded-2xl border-2 border-emerald-400 bg-white px-3 text-center text-base font-black text-slate-950 outline-none"
                      />

                      <span className="font-black text-slate-500">grams</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => addCombo(selectedCombo)}
              className="flex h-[58px] w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#202422] text-lg font-black text-white"
            >
              <Plus size={22} strokeWidth={4} />
              Add combo
            </button>
          </div>
        </div>
      ) : null}
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
                      className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="grid grid-cols-[48px_1fr_auto] items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                          {entry.food.emoji ?? "🍽️"}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[18px] font-black leading-tight text-slate-950">
                            {entry.food.name}
                          </p>

                          {!isEditingAdded ? (
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {entry.amountGrams}g · ~{formatFiber(fiber)} fiber
                            </p>
                          ) : (
                            <div className="mt-3 flex items-center gap-2">
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
                                className="h-10 w-24 rounded-2xl border border-emerald-400 bg-white px-3 text-center text-sm font-black text-slate-950 outline-none"
                              />

                              <span className="text-sm font-black text-slate-500">
                                grams
                              </span>

                              <span className="ml-auto text-sm font-semibold text-slate-500">
                                ~{formatFiber(fiber)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => {
                              if (isEditingAdded) {
                                saveAddedAmount(entry);
                              } else {
                                startEditingAdded(entry);
                              }
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${
                              isEditingAdded
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                            title={isEditingAdded ? "Save grams" : "Edit grams"}
                          >
                            {isEditingAdded ? <span>✓</span> : <span>✎</span>}
                          </button>

                          <button
                            onClick={() => removeAdded(entry.entryId)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                            title="Remove"
                          >
                            <X size={20} />
                          </button>
                        </div>
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
