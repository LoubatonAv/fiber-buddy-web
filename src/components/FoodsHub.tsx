import { useState, type ComponentProps } from "react";
import { Foods } from "./Foods";
import { YazioImport } from "./YazioImport";
import type { Food, FoodEntry, MealCategory } from "../types";

type FoodsProps = ComponentProps<typeof Foods>;

type Props = FoodsProps & {
  onImportFood: (
    food: Food,
    amountGrams: number,
    mealCategory: MealCategory,
  ) => FoodEntry;
};

export function FoodsHub({ onImportFood, ...foodsProps }: Props) {
  const [view, setView] = useState<"database" | "import">("database");

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => setView("database")}
          className={`h-12 rounded-2xl text-sm font-black transition ${
            view === "database"
              ? "bg-[#202422] text-white"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          My foods
        </button>

        <button
          onClick={() => setView("import")}
          className={`h-12 rounded-2xl text-sm font-black transition ${
            view === "import"
              ? "bg-[#202422] text-white"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          Import
        </button>
      </div>

      {view === "database" ? (
        <Foods {...foodsProps} />
      ) : (
        <YazioImport foods={foodsProps.foods} onAdd={onImportFood} />
      )}
    </>
  );
}
