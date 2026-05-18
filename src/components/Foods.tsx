import { Plus, Star, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "./Card";
import type { Food, Recipe, RecipeIngredient } from "../types";

type Props = {
  foods: Food[];
  recipes: Recipe[];
  onAddFood: (food: Food) => void;
  onAddRecipe: (recipe: Recipe, recipeFood: Food) => void;
  onDeleteFood: (foodId: string) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onToggleFoodFavorite: (foodId: string) => void;
};

type Tab = "all" | "favorites" | "recipes";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

export function Foods({
  foods,
  onAddFood,
  onAddRecipe,
  onDeleteFood,
  onDeleteRecipe,
  onToggleFoodFavorite,
}: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [name, setName] = useState("");
  const [fiber, setFiber] = useState("");
  const [emoji, setEmoji] = useState("🍽️");

  const regularFoods = useMemo(
    () => foods.filter((food) => food.source !== "recipe"),
    [foods],
  );

  const recipeFoods = useMemo(
    () => foods.filter((food) => food.source === "recipe"),
    [foods],
  );

  const [recipeName, setRecipeName] = useState("");
  const [recipeEmoji, setRecipeEmoji] = useState("🍲");
  const [recipeServings, setRecipeServings] = useState("1");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { foodId: regularFoods[0]?.id ?? "", amountGrams: 100 },
  ]);

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list =
      tab === "favorites"
        ? foods.filter((food) => food.isFavorite)
        : tab === "recipes"
          ? recipeFoods
          : foods;

    if (!query) {
      return [...list].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return list
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
  }, [foods, recipeFoods, search, tab]);

  function resetFoodForm() {
    setName("");
    setFiber("");
    setEmoji("🍽️");
  }

  function handleCreateFood() {
    const fiberNumber = Number(fiber);

    if (!name.trim()) {
      alert("Enter food name.");
      return;
    }

    if (!Number.isFinite(fiberNumber) || fiberNumber < 0) {
      alert("Enter valid fiber amount.");
      return;
    }

    onAddFood({
      id: createId(),
      name: name.trim(),
      fiberPer100g: fiberNumber,
      emoji: emoji.trim() || "🍽️",
      source: "custom",
      isFavorite: false,
      mealCategories: ["breakfast", "lunch", "dinner", "snacks"],
    });

    resetFoodForm();
    setIsAddingFood(false);
  }

  function updateIngredient(index: number, next: RecipeIngredient) {
    setIngredients((current) =>
      current.map((ingredient, currentIndex) =>
        currentIndex === index ? next : ingredient,
      ),
    );
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      { foodId: regularFoods[0]?.id ?? "", amountGrams: 100 },
    ]);
  }

  function removeIngredient(index: number) {
    setIngredients((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index);
      return next.length > 0
        ? next
        : [{ foodId: regularFoods[0]?.id ?? "", amountGrams: 100 }];
    });
  }

  function calculateRecipe() {
    let totalGrams = 0;
    let totalFiber = 0;

    for (const ingredient of ingredients) {
      const food = foods.find((item) => item.id === ingredient.foodId);
      if (!food) continue;

      const amount = Number(ingredient.amountGrams);
      if (!Number.isFinite(amount) || amount <= 0) continue;

      totalGrams += amount;
      totalFiber += (amount / 100) * food.fiberPer100g;
    }

    return {
      totalGrams,
      totalFiber,
      fiberPer100g: totalGrams > 0 ? (totalFiber / totalGrams) * 100 : 0,
    };
  }

  function resetRecipeForm() {
    setRecipeName("");
    setRecipeEmoji("🍲");
    setRecipeServings("1");
    setIngredients([{ foodId: regularFoods[0]?.id ?? "", amountGrams: 100 }]);
  }

  function handleCreateRecipe() {
    const servings = Number(recipeServings);
    const calculation = calculateRecipe();

    if (!recipeName.trim()) {
      alert("Enter recipe name.");
      return;
    }

    if (!Number.isFinite(servings) || servings <= 0) {
      alert("Enter valid servings.");
      return;
    }

    if (calculation.totalGrams <= 0) {
      alert("Add at least one valid ingredient.");
      return;
    }

    const recipeId = createId();
    const recipeFoodId = `recipe-${recipeId}`;
    const servingGrams = calculation.totalGrams / servings;

    const recipe: Recipe = {
      id: recipeId,
      name: recipeName.trim(),
      emoji: recipeEmoji.trim() || "🍲",
      servings,
      ingredients,
      createdAt: new Date().toISOString(),
    };

    const recipeFood: Food = {
      id: recipeFoodId,
      name: recipeName.trim(),
      emoji: recipeEmoji.trim() || "🍲",
      fiberPer100g: calculation.fiberPer100g,
      mealCategories: ["breakfast", "lunch", "dinner", "snacks"],
      isFavorite: false,
      source: "recipe",
      recipeId,
      servingGrams,
    };

    onAddRecipe(recipe, recipeFood);
    resetRecipeForm();
    setIsAddingRecipe(false);
    setTab("recipes");
  }

  const recipePreview = calculateRecipe();

  return (
    <>
      <header className="mb-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[34px] font-black leading-none text-slate-950">
            Foods
          </h1>

          <p className="mt-3 text-base font-semibold text-slate-500">
            Foods, recipes and favorites for quick fiber tracking.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditMode((current) => !current)}
            className={`h-12 rounded-2xl px-4 text-sm font-black transition active:scale-95 ${
              isEditMode
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isEditMode ? "Done" : "Edit"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddingFood((current) => !current);
              setIsAddingRecipe(false);
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition active:scale-95"
            title="Add food"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </header>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {(["all", "favorites", "recipes"] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`h-11 rounded-2xl text-sm font-black capitalize transition active:scale-[0.98] ${
              tab === item
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search foods or recipes"
        className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-base font-semibold outline-none transition focus:border-emerald-500"
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setIsAddingFood(true);
            setIsAddingRecipe(false);
          }}
          className="rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white transition active:scale-[0.98]"
        >
          + Custom food
        </button>

        <button
          type="button"
          onClick={() => {
            setIsAddingRecipe(true);
            setIsAddingFood(false);
          }}
          className="rounded-2xl bg-slate-900 py-3 text-sm font-black text-white transition active:scale-[0.98]"
        >
          + Recipe
        </button>
      </div>

      {isAddingFood ? (
        <Card className="mt-4 border-2 border-slate-200 p-4 card-pop">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">
              Add custom food
            </h2>

            <button
              type="button"
              onClick={() => {
                resetFoodForm();
                setIsAddingFood(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              <X size={19} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Food name"
              className="h-12 rounded-2xl border-2 border-slate-200 px-4 font-semibold outline-none transition focus:border-emerald-500"
            />
            <input
              value={fiber}
              onChange={(event) => setFiber(event.target.value)}
              placeholder="Fiber per 100g"
              inputMode="decimal"
              className="h-12 rounded-2xl border-2 border-slate-200 px-4 font-semibold outline-none transition focus:border-emerald-500"
            />
            <input
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="Emoji"
              className="h-12 rounded-2xl border-2 border-slate-200 px-4 font-semibold outline-none transition focus:border-emerald-500"
            />

            <button
              type="button"
              onClick={handleCreateFood}
              className="rounded-2xl bg-emerald-500 py-3 text-base font-black text-white transition active:scale-[0.98]"
            >
              Save food
            </button>
          </div>
        </Card>
      ) : null}

      {isAddingRecipe ? (
        <Card className="mt-4 border-2 border-slate-200 p-4 card-pop">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">Add recipe</h2>
            <button
              type="button"
              onClick={() => {
                resetRecipeForm();
                setIsAddingRecipe(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              <X size={19} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <input
              value={recipeName}
              onChange={(event) => setRecipeName(event.target.value)}
              placeholder="Recipe name"
              className="h-12 rounded-2xl border-2 border-slate-200 px-4 font-semibold outline-none transition focus:border-emerald-500"
            />

            <div className="grid grid-cols-[1fr_90px] gap-2">
              <input
                value={recipeEmoji}
                onChange={(event) => setRecipeEmoji(event.target.value)}
                placeholder="Emoji"
                className="h-12 rounded-2xl border-2 border-slate-200 px-4 font-semibold outline-none transition focus:border-emerald-500"
              />
              <input
                value={recipeServings}
                onChange={(event) => setRecipeServings(event.target.value)}
                placeholder="Servings"
                inputMode="decimal"
                className="h-12 rounded-2xl border-2 border-slate-200 px-4 text-center font-semibold outline-none transition focus:border-emerald-500"
              />
            </div>

            <div className="mt-1 flex flex-col gap-2">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_82px_36px] gap-2"
                >
                  <select
                    value={ingredient.foodId}
                    onChange={(event) =>
                      updateIngredient(index, {
                        ...ingredient,
                        foodId: event.target.value,
                      })
                    }
                    className="h-11 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    {regularFoods.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={ingredient.amountGrams}
                    onChange={(event) =>
                      updateIngredient(index, {
                        ...ingredient,
                        amountGrams: Number(event.target.value),
                      })
                    }
                    inputMode="decimal"
                    className="h-11 rounded-2xl border-2 border-slate-200 px-2 text-center text-sm font-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="flex h-11 w-9 items-center justify-center rounded-2xl bg-red-50 text-red-500"
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-700"
            >
              + Add ingredient
            </button>

            <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-800">
              Total: {recipePreview.totalFiber.toFixed(1)}g fiber ·{" "}
              {recipePreview.fiberPer100g.toFixed(1)}g per 100g
            </div>

            <button
              type="button"
              onClick={handleCreateRecipe}
              className="rounded-2xl bg-emerald-500 py-3 text-base font-black text-white transition active:scale-[0.98]"
            >
              Save recipe
            </button>
          </div>
        </Card>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 pb-10 food-results-enter">
        {filteredFoods.map((food) => (
          <Card key={food.id} className="p-4 card-pop">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl">
                {food.emoji ?? "🍽️"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black text-slate-950">
                  {food.name}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {food.source === "recipe" ? "Recipe · " : ""}
                  {food.fiberPer100g.toFixed(1)}g fiber per 100g
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleFoodFavorite(food.id)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${food.isFavorite ? "bg-yellow-100 text-yellow-500" : "bg-slate-100 text-slate-400"}`}
              >
                <Star
                  size={19}
                  fill={food.isFavorite ? "currentColor" : "none"}
                />
              </button>

              {isEditMode ? (
                <button
                  type="button"
                  onClick={() => {
                    const ok = confirm(`Delete ${food.name}?`);
                    if (!ok) return;
                    if (food.recipeId) onDeleteRecipe(food.recipeId);
                    else onDeleteFood(food.id);
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition active:scale-90"
                  title="Delete food"
                >
                  <Trash2 size={18} />
                </button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
