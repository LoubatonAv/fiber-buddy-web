import { ClipboardPaste, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "./Card";
import { calculateFiber, formatFiber } from "../lib/fiber";
import type { Food, FoodEntry, MealCategory } from "../types";

type Props = {
  foods: Food[];
  onAdd: (
    food: Food,
    amountGrams: number,
    mealCategory: MealCategory,
  ) => FoodEntry;
};

type ParsedYazioItem = {
  id: string;
  meal: MealCategory;
  rawName: string;
  amountGrams: number;
  matchedFood?: Food;
  confidence: "high" | "medium" | "low" | "none";
};

const mealHeadings: Record<string, MealCategory> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snacks: "snacks",
  snack: "snacks",

  "ארוחת בוקר": "breakfast",
  בוקר: "breakfast",
  צהריים: "lunch",
  צהרים: "lunch",
  ערב: "dinner",
  חטיפים: "snacks",
  נשנושים: "snacks",
};

const foodAliases: Record<string, string[]> = {
  oats: ["oats", "oatmeal", "שיבולת", "קוואקר"],
  apple: ["apple", "apples", "granny smith", "תפוח", "תפוחים"],
  pear: ["pear", "אגס"],
  peach: ["peach", "אפרסק"],
  banana: ["banana", "בננה"],
  "whole wheat bread": [
    "whole wheat bread",
    "bread",
    "לחם",
    "לחם אחיד",
    "לחם אחיד פרוס",
    "לחם מלא",
    "מאפיית אנג׳ל",
    "מאפית אנגל",
  ],
  "rye bread": ["rye", "לחם שיפון"],
  "bran flakes": ["bran flakes", "ברנפלקס", "דגני בוקר", "דבש ושקדים"],
  cheerios: ["cheerios", "צ׳יריוס", "ציריוס"],
  "greek yogurt": ["greek yogurt", "יוגורט יווני", "יוגורט"],
  yogurt: ["yogurt", "יוגורט", "עוגת גבינה"],
  milk: ["milk", "חלב"],
  cheese: ["cheese", "גבינה", "פרוסת גבינה"],
  honey: ["honey", "דבש"],
  granola: ["granola", "גרנולה"],
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[,:;()[\]{}"'״׳]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectMeal(line: string): MealCategory | null {
  const clean = normalizeText(line);

  for (const [key, meal] of Object.entries(mealHeadings)) {
    if (clean === normalizeText(key)) return meal;
  }

  return null;
}

function isNoiseLine(line: string) {
  const clean = normalizeText(line);

  if (!clean) return true;
  if (/^\d+\s*cal$/.test(clean)) return true;
  if (/^\d+\s*kcal$/.test(clean)) return true;
  if (/^\d+$/.test(clean)) return true;
  if (clean.includes("nutrition")) return true;
  if (clean.includes("calories")) return true;

  return false;
}

function extractAmount(line: string) {
  const normalized = line.replace(",", ".");

  const gramMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(g|גרם|גר׳)/i);
  if (gramMatch) return Number(gramMatch[1]);

  const mlMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(ml|מ״ל|מ"ל)/i);
  if (mlMatch) return Number(mlMatch[1]);

  const sliceMatch = normalized.match(/slice\s*\((\d+(?:\.\d+)?)\s*g\)/i);
  if (sliceMatch) return Number(sliceMatch[1]);

  const servingMatch = normalized.match(/(\d+(?:\.\d+)?)\s*serving/i);
  if (servingMatch) return Math.round(Number(servingMatch[1]) * 100);

  return null;
}

function findBestFoodMatch(rawName: string, foods: Food[]) {
  const cleanRaw = normalizeText(rawName);

  let best: {
    food: Food;
    score: number;
  } | null = null;

  for (const food of foods) {
    const cleanFoodName = normalizeText(food.name);
    let score = 0;

    if (cleanRaw === cleanFoodName) score += 100;
    if (cleanRaw.includes(cleanFoodName)) score += 70;
    if (cleanFoodName.includes(cleanRaw)) score += 50;

    const aliases = foodAliases[cleanFoodName] ?? [];

    for (const alias of aliases) {
      const cleanAlias = normalizeText(alias);

      if (cleanRaw.includes(cleanAlias)) {
        score += cleanAlias.length > 5 ? 65 : 35;
      }
    }

    const foodWords = cleanFoodName
      .split(" ")
      .filter((word) => word.length > 2);
    for (const word of foodWords) {
      if (cleanRaw.includes(word)) score += 8;
    }

    if (!best || score > best.score) {
      best = { food, score };
    }
  }

  if (!best || best.score < 12) {
    return {
      food: undefined,
      confidence: "none" as const,
    };
  }

  return {
    food: best.food,
    confidence:
      best.score >= 65
        ? ("high" as const)
        : best.score >= 30
          ? ("medium" as const)
          : ("low" as const),
  };
}

function parseYazioText(text: string, foods: Food[]): ParsedYazioItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items: ParsedYazioItem[] = [];
  let currentMeal: MealCategory = "breakfast";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const detectedMeal = detectMeal(line);

    if (detectedMeal) {
      currentMeal = detectedMeal;
      continue;
    }

    if (isNoiseLine(line)) continue;
    if (/\d+\s*cal/i.test(line)) continue;

    const amountInSameLine = extractAmount(line);
    const nextLine = lines[index + 1] ?? "";
    const amountInNextLine = extractAmount(nextLine);

    const amountGrams = amountInSameLine ?? amountInNextLine ?? 100;

    let rawName = line
      .replace(/\d+(?:[.,]\d+)?\s*(g|גרם|גר׳|ml|מ״ל|מ"ל)/gi, "")
      .replace(/\d+\s*cal/gi, "")
      .trim();

    if (!rawName) continue;

    const { food, confidence } = findBestFoodMatch(rawName, foods);

    items.push({
      id: String(Date.now() + Math.random()),
      meal: currentMeal,
      rawName,
      amountGrams,
      matchedFood: food,
      confidence,
    });
  }

  return items;
}

const mealLabel: Record<MealCategory, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

export function YazioImport({ foods, onAdd }: Props) {
  const [text, setText] = useState("");
  const [items, setItems] = useState<ParsedYazioItem[]>([]);
  const [addedCount, setAddedCount] = useState(0);

  const matchedItems = useMemo(
    () => items.filter((item) => item.matchedFood),
    [items],
  );

  const totalFiber = useMemo(() => {
    return matchedItems.reduce((sum, item) => {
      if (!item.matchedFood) return sum;

      return (
        sum + calculateFiber(item.amountGrams, item.matchedFood.fiberPer100g)
      );
    }, 0);
  }, [matchedItems]);

  function parseText() {
    const parsed = parseYazioText(text, foods);
    setItems(parsed);
    setAddedCount(0);
  }

  function updateItemAmount(itemId: string, amount: string) {
    const nextAmount = Number(amount);

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              amountGrams:
                Number.isFinite(nextAmount) && nextAmount > 0
                  ? nextAmount
                  : item.amountGrams,
            }
          : item,
      ),
    );
  }

  function updateItemMatch(itemId: string, foodId: string) {
    const food = foods.find((item) => item.id === foodId);

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              matchedFood: food,
              confidence: food ? "high" : "none",
            }
          : item,
      ),
    );
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  function addMatchedFoods() {
    let count = 0;

    for (const item of items) {
      if (!item.matchedFood) continue;

      onAdd(item.matchedFood, item.amountGrams, item.meal);
      count += 1;
    }

    setAddedCount(count);
  }

  return (
    <>
      <header className="mb-5">
        <h1 className="text-[32px] font-black leading-none text-slate-950">
          Import
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Paste your YAZIO meal list and convert it to fiber.
        </p>
      </header>

      <Card className="border-2 border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardPaste className="text-emerald-600" size={22} />
          <p className="font-black text-slate-950">Paste from YAZIO</p>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Example:
Breakfast
Cheerios 50g
Milk 150ml
Whole wheat bread 46g
Apple 240g

Snacks
Peach 102g`}
          className="min-h-[170px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400"
        />

        <button
          onClick={parseText}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#202422] font-black text-white"
        >
          <Search size={18} />
          Parse text
        </button>
      </Card>

      {items.length > 0 ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Card className="border-2 border-slate-200 p-3 text-center">
              <p className="text-xl font-black text-slate-950">
                {items.length}
              </p>
              <p className="text-xs font-bold text-slate-500">Found</p>
            </Card>

            <Card className="border-2 border-slate-200 p-3 text-center">
              <p className="text-xl font-black text-slate-950">
                {matchedItems.length}
              </p>
              <p className="text-xs font-bold text-slate-500">Matched</p>
            </Card>

            <Card className="border-2 border-slate-200 p-3 text-center">
              <p className="text-xl font-black text-slate-950">
                {formatFiber(totalFiber)}
              </p>
              <p className="text-xs font-bold text-slate-500">Fiber</p>
            </Card>
          </div>

          <section className="mt-5 pb-28">
            <h2 className="mb-3 text-[24px] font-black text-slate-950">
              Review
            </h2>

            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const fiber = item.matchedFood
                  ? calculateFiber(
                      item.amountGrams,
                      item.matchedFood.fiberPer100g,
                    )
                  : 0;

                return (
                  <Card key={item.id} className="border-2 border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl">
                        {item.matchedFood?.emoji ?? "❔"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-base font-black text-slate-950">
                              {item.rawName}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {mealLabel[item.meal]} · {item.amountGrams}g
                              {item.matchedFood
                                ? ` · ~${formatFiber(fiber)} fiber`
                                : " · no match"}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-[88px_1fr] gap-2">
                          <input
                            value={item.amountGrams}
                            onChange={(event) =>
                              updateItemAmount(item.id, event.target.value)
                            }
                            inputMode="decimal"
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-center text-sm font-black outline-none focus:border-emerald-400"
                          />

                          <select
                            value={item.matchedFood?.id ?? ""}
                            onChange={(event) =>
                              updateItemMatch(item.id, event.target.value)
                            }
                            className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black outline-none focus:border-emerald-400"
                          >
                            <option value="">No match</option>
                            {foods.map((food) => (
                              <option key={food.id} value={food.id}>
                                {food.name} — {food.fiberPer100g}g/100g
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              item.confidence === "high"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.confidence === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : item.confidence === "low"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.confidence === "none"
                              ? "Needs match"
                              : `${item.confidence} match`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-[#f7f8f8] px-4 py-4">
            <button
              onClick={addMatchedFoods}
              disabled={matchedItems.length === 0}
              className="flex h-[62px] w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#202422] text-[19px] font-black text-white shadow-xl shadow-black/15 disabled:opacity-40"
            >
              <Plus size={22} strokeWidth={4} />
              Add matched foods
            </button>

            {addedCount > 0 ? (
              <p className="mt-2 text-center text-sm font-black text-emerald-700">
                Added {addedCount} foods to your diary
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
