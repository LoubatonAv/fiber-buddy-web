import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { getDefaultFiberGoal } from "../lib/fiber";
import { saveProfile } from "../lib/storage";
import type {
  DietType,
  FiberGoalMode,
  GoalType,
  Sex,
  UserProfile,
} from "../types";

type Props = {
  onDone: (profile: UserProfile) => void;
};

const dietOptions: { label: string; value: DietType; emoji: string }[] = [
  { label: "Regular", value: "regular", emoji: "🍽️" },
  { label: "Weight loss", value: "weight_loss", emoji: "🌱" },
  { label: "High protein", value: "high_protein", emoji: "💪" },
  { label: "Vegetarian", value: "vegetarian", emoji: "🥦" },
  { label: "Vegan", value: "vegan", emoji: "🌿" },
  { label: "Low carb", value: "low_carb", emoji: "🥑" },
];

const goalOptions: {
  label: string;
  value: GoalType;
  emoji: string;
  helper: string;
}[] = [
  {
    label: "Eat more fiber",
    value: "more_fiber",
    emoji: "🌾",
    helper: "A simple daily fiber habit.",
  },
  {
    label: "Better digestion",
    value: "digestion",
    emoji: "😊",
    helper: "Gentle progress, no pressure.",
  },
  {
    label: "Weight loss support",
    value: "weight_loss",
    emoji: "🍎",
    helper: "Stay full with fiber-rich foods.",
  },
  {
    label: "General health",
    value: "general_health",
    emoji: "✨",
    helper: "A cozy healthy routine.",
  },
];

export function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);
  const [dietType, setDietType] = useState<DietType>("regular");
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [goalMode, setGoalMode] = useState<FiberGoalMode>("calculated");
  const [manualGoal, setManualGoal] = useState("");

  const totalSteps = 5;
  const suggestedGoal = useMemo(
    () => getDefaultFiberGoal(sex ?? "male"),
    [sex],
  );

  function next() {
    setStep((current) => Math.min(totalSteps - 1, current + 1));
  }

  function back() {
    setStep((current) => Math.max(0, current - 1));
  }

  function finish() {
    if (!sex || !goal) return;

    const dailyFiberGoal =
      goalMode === "calculated" ? suggestedGoal : Number(manualGoal);

    if (!Number.isFinite(dailyFiberGoal) || dailyFiberGoal <= 0) {
      alert("Please enter a valid daily fiber goal.");
      return;
    }

    const profile: UserProfile = {
      age: age.trim() ? Number(age) : undefined,
      sex,
      dietType,
      goal,
      fiberGoalMode: goalMode,
      dailyFiberGoal,
      gradualMode: true,
      onboardingCompleted: true,
    };

    saveProfile(profile);
    onDone(profile);
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-4 flex justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index <= step ? "w-9 bg-emerald-500" : "w-5 bg-orange-200"
            }`}
          />
        ))}
      </div>

      <Card className="min-h-[390px]">
        {step === 0 && (
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="text-5xl">🌼</p>
              <h2 className="mt-3 text-3xl font-black text-stone-800">
                How old are you?
              </h2>
              <p className="mt-2 text-base font-semibold text-stone-500">
                Optional, but helpful for your cozy profile.
              </p>
            </div>

            <input
              value={age}
              onChange={(event) => setAge(event.target.value)}
              inputMode="numeric"
              placeholder="Example: 36"
              className="mt-auto rounded-3xl border border-orange-200 bg-orange-50/70 px-4 py-4 text-lg font-extrabold outline-none focus:border-emerald-400"
            />

            <Button onClick={next} className="w-full">
              Next →
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="text-5xl">🧮</p>
              <h2 className="mt-3 text-3xl font-black text-stone-800">
                What should I calculate by?
              </h2>
              <p className="mt-2 text-base font-semibold text-stone-500">
                Pick one. You can change the goal later.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3">
              {[
                { label: "Male", value: "male" as const, emoji: "👨" },
                { label: "Female", value: "female" as const, emoji: "👩" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSex(option.value);
                    window.setTimeout(next, 160);
                  }}
                  className={`rounded-[2rem] border p-5 text-center transition ${
                    sex === option.value
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-orange-200 bg-orange-50 text-stone-800 hover:bg-orange-100"
                  }`}
                >
                  <span className="block text-5xl">{option.emoji}</span>
                  <span className="mt-2 block text-lg font-black">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="text-5xl">🥗</p>
              <h2 className="mt-3 text-3xl font-black text-stone-800">
                What’s your diet style?
              </h2>
              <p className="mt-2 text-base font-semibold text-stone-500">
                Choose from the dropdown.
              </p>
            </div>

            <label className="mt-auto block">
              <span className="mb-2 block text-sm font-black text-stone-600">
                Diet style
              </span>

              <div className="relative">
                <select
                  value={dietType}
                  onChange={(event) =>
                    setDietType(event.target.value as DietType)
                  }
                  className="w-full appearance-none rounded-3xl border border-orange-200 bg-orange-50/80 px-4 py-4 text-lg font-black text-stone-800 outline-none focus:border-emerald-400"
                >
                  {dietOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <Button onClick={next} className="w-full">
              Next →
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex h-full flex-col gap-3">
            <div>
              <p className="text-5xl">🎯</p>
              <h2 className="mt-3 text-3xl font-black text-stone-800">
                What’s your main goal?
              </h2>
              <p className="mt-2 text-base font-semibold text-stone-500">
                Tap one and I’ll move on.
              </p>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setGoal(option.value);
                    window.setTimeout(next, 160);
                  }}
                  className={`flex items-center gap-3 rounded-3xl border p-3 text-left transition ${
                    goal === option.value
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-orange-200 bg-orange-50 text-stone-800 hover:bg-orange-100"
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>

                  <span>
                    <span className="block font-black">{option.label}</span>
                    <span
                      className={`block text-sm font-semibold ${
                        goal === option.value
                          ? "text-emerald-50"
                          : "text-stone-500"
                      }`}
                    >
                      {option.helper}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="text-5xl">🌾</p>
              <h2 className="mt-3 text-3xl font-black text-stone-800">
                Daily fiber target
              </h2>
              <p className="mt-2 text-base font-semibold text-stone-500">
                Choose calculated or manual. Only one will be used.
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={() => setGoalMode("calculated")}
                className={`rounded-3xl border p-4 text-left transition ${
                  goalMode === "calculated"
                    ? "border-amber-400 bg-orange-100"
                    : "border-orange-200 bg-orange-50/70"
                }`}
              >
                <span className="block text-lg font-black text-stone-800">
                  ✨ Calculated for me
                </span>
                <span className="block font-semibold text-stone-500">
                  Recommended start: {suggestedGoal}g per day
                </span>
              </button>

              <button
                onClick={() => setGoalMode("manual")}
                className={`rounded-3xl border p-4 text-left transition ${
                  goalMode === "manual"
                    ? "border-amber-400 bg-orange-100"
                    : "border-orange-200 bg-orange-50/70"
                }`}
              >
                <span className="block text-lg font-black text-stone-800">
                  ✍️ I’ll set it myself
                </span>
                <span className="block font-semibold text-stone-500">
                  Enter your own daily target.
                </span>
              </button>

              {goalMode === "manual" && (
                <input
                  value={manualGoal}
                  onChange={(event) => setManualGoal(event.target.value)}
                  inputMode="decimal"
                  placeholder="Example: 30"
                  className="rounded-3xl border border-orange-200 bg-orange-50/70 px-4 py-4 text-lg font-extrabold outline-none focus:border-emerald-400"
                />
              )}

              <Button
                onClick={finish}
                disabled={!sex || !goal}
                className="w-full"
              >
                Start tracking 🌾
              </Button>
            </div>
          </div>
        )}
      </Card>

      <button
        onClick={back}
        disabled={step === 0}
        className="mx-auto mt-4 flex items-center gap-2 rounded-2xl px-4 py-2 font-black text-emerald-700 disabled:opacity-30"
      >
        <ArrowLeft size={18} />
        Back
      </button>
    </div>
  );
}
