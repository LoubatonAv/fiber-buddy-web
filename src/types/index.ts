export type Sex = "male" | "female";

export type DietType =
  | "regular"
  | "weight_loss"
  | "high_protein"
  | "vegetarian"
  | "vegan"
  | "low_carb";

export type GoalType =
  | "more_fiber"
  | "digestion"
  | "weight_loss"
  | "general_health";

export type FiberGoalMode = "calculated" | "manual";

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snacks";

export type MainTab = "diary" | "foods" | "ideas" | "profile";

export type AddMode = "recent" | "frequent" | "favorites" | "recipes" | "all";

export type UserProfile = {
  age?: number;
  sex: Sex;
  dietType: DietType;
  goal: GoalType;
  fiberGoalMode: FiberGoalMode;
  dailyFiberGoal: number;
  gradualMode: boolean;
  onboardingCompleted: boolean;
};

export type FoodSource = "default" | "custom" | "recipe";

export type Food = {
  id: string;
  name: string;
  fiberPer100g: number;
  mealCategories: MealCategory[];
  emoji?: string;
  isFavorite?: boolean;
  source?: FoodSource;
  recipeId?: string;
  servingGrams?: number;
};

export type RecipeIngredient = {
  foodId: string;
  amountGrams: number;
};

export type Recipe = {
  id: string;
  name: string;
  emoji?: string;
  servings: number;
  ingredients: RecipeIngredient[];
  createdAt: string;
};

export type FoodEntry = {
  id: string;
  foodId: string;
  amountGrams: number;
  date: string;
  mealCategory?: MealCategory;
};

export type LastAmountMap = Record<string, number>;
