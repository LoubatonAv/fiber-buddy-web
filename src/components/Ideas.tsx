import { Card } from "./Card";
import { formatFiber } from "../lib/fiber";
import type { Food, FoodEntry, UserProfile } from "../types";

type Props = {
  foods: Food[];
  entries: FoodEntry[];
  profile: UserProfile;
  totalFiber: number;
};

export function Ideas({ foods, entries, profile, totalFiber }: Props) {
  const remaining = Math.max(0, profile.dailyFiberGoal - totalFiber);

  const highFiber = [...foods]
    .sort((a, b) => b.fiberPer100g - a.fiberPer100g)
    .slice(0, 8);

  const neverLogged = foods
    .filter((food) => !entries.some((entry) => entry.foodId === food.id))
    .slice(0, 6);

  return (
    <>
      <Card>
        <p className="text-5xl">💡</p>

        <h2 className="mt-2 text-3xl font-black text-stone-800">Ideas</h2>

        <p className="mt-1 font-semibold text-stone-500">
          Quick inspiration when you need more fiber.
        </p>
      </Card>

      <Card className="bg-emerald-50/90">
        <p className="text-lg font-black text-stone-800">
          You need {formatFiber(remaining)} more today
        </p>

        <p className="mt-1 font-semibold text-stone-500">
          Try adding oats, lentils, chickpeas, berries, or popcorn depending on
          what you feel like.
        </p>
      </Card>

      <div>
        <h3 className="mb-3 text-2xl font-black text-stone-800">
          🌾 High-fiber picks
        </h3>

        <div className="flex flex-col gap-3">
          {highFiber.map((food) => (
            <Card key={food.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                  {food.emoji ?? "🍽️"}
                </div>

                <div>
                  <p className="font-black text-stone-800">{food.name}</p>
                  <p className="font-semibold text-stone-500">
                    {food.fiberPer100g}g fiber per 100g
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {neverLogged.length > 0 ? (
        <div>
          <h3 className="mb-3 text-2xl font-black text-stone-800">
            ✨ Try something new
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {neverLogged.map((food) => (
              <Card key={food.id} className="p-4 text-center">
                <p className="text-3xl">{food.emoji ?? "🍽️"}</p>
                <p className="mt-1 font-black text-stone-800">{food.name}</p>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
