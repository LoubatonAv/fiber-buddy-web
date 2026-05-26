import { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { saveProfile } from "../lib/storage";
import type { UserProfile } from "../types";
import { MascotCallout } from "./MascotCallout";

type Props = {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onRestartOnboarding: () => void;
};

export function Profile({
  profile,
  onProfileChange,
  onRestartOnboarding,
}: Props) {
  const [goal, setGoal] = useState(String(profile.dailyFiberGoal));

  function saveGoal() {
    const nextGoal = Number(goal);

    if (!Number.isFinite(nextGoal) || nextGoal <= 0) {
      alert("Enter a valid fiber goal.");
      return;
    }

    const nextProfile: UserProfile = {
      ...profile,
      dailyFiberGoal: nextGoal,
      fiberGoalMode: "manual",
    };

    saveProfile(nextProfile);
    onProfileChange(nextProfile);
  }

  return (
    <>
      <header className="mb-5">
        <h1 className="text-[34px] font-black leading-none text-slate-950">
          Profile
        </h1>
        <p className="mt-3 text-base font-semibold text-slate-500">
          Your personal fiber settings.
        </p>
      </header>

      <MascotCallout
        title="Call your owl"
        body="Preview the letter delivery animation whenever you want."
        kind="test"
      />

      <Card className="mt-5 p-5">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--forest-primary-soft)] text-4xl">
          👤
        </div>

        <h2 className="text-2xl font-black text-slate-950">Fiber goal</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Change how many grams of fiber you want per day.
        </p>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-black text-slate-700">
            Daily fiber target
          </span>

          <input
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            inputMode="decimal"
            className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-lg font-black outline-none focus:border-emerald-500"
          />
        </label>

        <div className="mt-4">
          <Button onClick={saveGoal} className="w-full">
            Save fiber goal
          </Button>
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="mb-4 text-xl font-black text-slate-950">About you</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-black text-slate-950">Sex</p>
            <p className="mt-1 font-semibold capitalize text-slate-500">
              {profile.sex}
            </p>
          </div>

          <div>
            <p className="font-black text-slate-950">Diet</p>
            <p className="mt-1 font-semibold capitalize text-slate-500">
              {profile.dietType.replace("_", " ")}
            </p>
          </div>

          <div>
            <p className="font-black text-slate-950">Goal mode</p>
            <p className="mt-1 font-semibold capitalize text-slate-500">
              {profile.fiberGoalMode}
            </p>
          </div>

          <div>
            <p className="font-black text-slate-950">Age</p>
            <p className="mt-1 font-semibold text-slate-500">
              {profile.age ?? "Not set"}
            </p>
          </div>
        </div>
      </Card>

      <Button
        variant="secondary"
        onClick={onRestartOnboarding}
        className="w-full"
      >
        Restart welcome questions
      </Button>
    </>
  );
}
