import { useEffect, useMemo, useRef, useState } from "react";
import { useForestPeriod } from "../hooks/useForestPeriod";
import { OwlBuddy } from "./buddy/OwlBuddy";

type Mood = "happy" | "sleepy" | "proud" | "missed" | "calm";

type Activity =
  | "perching"
  | "flapping"
  | "flying"
  | "foraging"
  | "petting"
  | "away"
  | "returning"
  | "sleeping";

type OwlBuddyActivity = "idle" | "sleeping" | "happy" | "flying";

type Spot = "left" | "right" | "center" | "ground";

type Props = {
  level: number;
  mood: Mood;
  owlName: string;
  petSignal: number;
  gatherSignal: number;
};

const backgrounds = {
  morning: "/backgrounds/forest-morning.png",
  afternoon: "/backgrounds/forest-day.png",
  evening: "/backgrounds/forest-evening.png",
  night: "/backgrounds/forest-night.png",
};

function getOwlMessage(activity: Activity, owlName: string) {
  if (activity === "sleeping") return "Zzz...";
  if (activity === "petting") return "Petting 💛";
  if (activity === "foraging") return "Gathering berries 🫐";
  if (activity === "flapping") return "Getting ready...";
  if (activity === "flying") return "Flying!";
  if (activity === "returning") return "Coming back!";
  if (activity === "away") return `${owlName} is exploring...`;

  return "";
}

function getOwlBuddyActivity(activity: Activity): OwlBuddyActivity {
  if (activity === "sleeping") return "sleeping";

  if (
    activity === "flapping" ||
    activity === "flying" ||
    activity === "returning"
  ) {
    return "flying";
  }

  if (activity === "petting") return "happy";

  return "idle";
}

function pickNextActivity(currentSpot: Spot): {
  activity: Activity;
  spot: Spot;
} {
  const roll = Math.random();

  if (roll < 0.18) {
    return { activity: "flapping", spot: currentSpot };
  }

  if (roll < 0.5) {
    return {
      activity: "flying",
      spot:
        currentSpot === "left"
          ? "right"
          : currentSpot === "right"
            ? "center"
            : "left",
    };
  }

  if (roll < 0.72) {
    return { activity: "foraging", spot: "ground" };
  }

  if (roll < 0.86) {
    return { activity: "away", spot: currentSpot };
  }

  return { activity: "perching", spot: currentSpot };
}

export function BuddyForestScene({
  level,
  owlName,
  petSignal,
  gatherSignal,
}: Props) {
  const period = useForestPeriod();

  /**
   * Later you can restore real night behavior:
   * const isNight = period === "night";
   *
   * For now this keeps Ollie active even at night while testing.
   */
  const isNight = false;

  const [activity, setActivity] = useState<Activity>(
    isNight ? "sleeping" : "perching",
  );

  const [spot, setSpotState] = useState<Spot>(isNight ? "right" : "left");
  const [berryKey, setBerryKey] = useState(0);

  const spotRef = useRef<Spot>(spot);
  const activityRef = useRef<Activity>(activity);
  const actionTimer = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);

  const isAway = activity === "away";
  const sceneLevel = Math.min(5, Math.max(1, level));
  const owlBuddyActivity = getOwlBuddyActivity(activity);

  function setSpot(nextSpot: Spot) {
    spotRef.current = nextSpot;
    setSpotState(nextSpot);
  }

  function clearActionTimer() {
    if (actionTimer.current) {
      window.clearTimeout(actionTimer.current);
      actionTimer.current = null;
    }
  }

  function clearIdleTimer() {
    if (idleTimer.current) {
      window.clearInterval(idleTimer.current);
      idleTimer.current = null;
    }
  }

  function settle(nextSpot: Spot = spotRef.current) {
    clearActionTimer();

    if (isNight) {
      setActivity("sleeping");
      setSpot("right");
      return;
    }

    setActivity("perching");
    setSpot(nextSpot === "ground" ? "center" : nextSpot);
  }

  function startFlyingTo(nextSpot: Spot) {
    clearActionTimer();

    setActivity("flying");
    setSpot(nextSpot);

    actionTimer.current = window.setTimeout(() => {
      settle(nextSpot);
    }, 1850);
  }

  function startFlapping() {
    clearActionTimer();

    setActivity("flapping");

    actionTimer.current = window.setTimeout(() => {
      settle(spotRef.current);
    }, 1200);
  }

  function startForaging() {
    clearActionTimer();

    setActivity("foraging");
    setSpot("ground");
    setBerryKey((key) => key + 1);

    actionTimer.current = window.setTimeout(() => {
      settle("center");
    }, 2600);
  }

  function startAway() {
    clearActionTimer();

    setActivity("away");

    actionTimer.current = window.setTimeout(() => {
      const returnSpot: Spot = Math.random() > 0.5 ? "left" : "right";

      setActivity("returning");
      setSpot(returnSpot);

      actionTimer.current = window.setTimeout(() => {
        settle(returnSpot);
      }, 1600);
    }, 4600);
  }

  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  useEffect(() => {
    clearActionTimer();

    if (isNight) {
      setActivity("sleeping");
      setSpot("right");
      return;
    }

    setActivity("perching");
    setSpot("left");
  }, [isNight]);

  useEffect(() => {
    clearIdleTimer();

    if (isNight) return;

    idleTimer.current = window.setInterval(() => {
      const currentActivity = activityRef.current;

      /**
       * Do not interrupt an action that is already running.
       */
      if (
        currentActivity === "petting" ||
        currentActivity === "foraging" ||
        currentActivity === "flying" ||
        currentActivity === "flapping" ||
        currentActivity === "away" ||
        currentActivity === "returning" ||
        currentActivity === "sleeping"
      ) {
        return;
      }

      const currentSpot = spotRef.current;
      const next = pickNextActivity(currentSpot);

      if (next.activity === "flying") {
        startFlyingTo(next.spot);
        return;
      }

      if (next.activity === "flapping") {
        startFlapping();
        return;
      }

      if (next.activity === "foraging") {
        startForaging();
        return;
      }

      if (next.activity === "away") {
        startAway();
        return;
      }

      settle(currentSpot);
    }, 4200);

    return () => {
      clearIdleTimer();
      clearActionTimer();
    };
  }, [isNight]);

  useEffect(() => {
    if (petSignal <= 0 || isNight) return;

    clearActionTimer();

    setActivity("petting");

    actionTimer.current = window.setTimeout(() => {
      settle(spotRef.current);
    }, 1300);
  }, [petSignal, isNight]);

  useEffect(() => {
    if (gatherSignal <= 0 || isNight) return;

    clearActionTimer();

    setActivity("flying");

    actionTimer.current = window.setTimeout(() => {
      startForaging();
    }, 650);
  }, [gatherSignal, isNight]);

  const stageClass = useMemo(() => {
    return `buddy-picture-stage buddy-scene-${period} buddy-level-${sceneLevel}`;
  }, [period, sceneLevel]);

  return (
    <div
      className={stageClass}
      style={{ backgroundImage: `url(${backgrounds[period]})` }}
    >
      <div className="buddy-picture-overlay" />

      {!isAway && spot !== "ground" ? (
        <img
          src="/assets/forest/branch.png"
          alt=""
          className={`ollie-branch ollie-branch-${spot}`}
          draggable={false}
        />
      ) : null}

      {isAway ? (
        <div className="buddy-away-sign-picture">
          <div className="buddy-away-sign-text">
            <p>{owlName} is exploring...</p>
            <span>Back soon 🌿</span>
          </div>
        </div>
      ) : (
        <div
          className={`buddy-owl-actor-picture spot-${spot} activity-${activity}`}
        >
          {activity !== "perching" ? (
            <div className="owl-action-bubble">
              {getOwlMessage(activity, owlName)}
            </div>
          ) : null}

          <OwlBuddy activity={owlBuddyActivity} />

          {activity === "petting" ? (
            <div className="buddy-heart-pop">💛</div>
          ) : null}

          {activity === "foraging" ? (
            <div key={berryKey} className="buddy-berry-pickup">
              🫐
            </div>
          ) : null}
        </div>
      )}

      {activity === "foraging" ? (
        <div className="buddy-ground-berries" aria-hidden="true">
          <span>🫐</span>
          <span>🍓</span>
          <span>🫐</span>
        </div>
      ) : null}

      {isNight ? (
        <>
          <div className="buddy-night-firefly buddy-night-firefly-a" />
          <div className="buddy-night-firefly buddy-night-firefly-b" />
          <div className="buddy-night-firefly buddy-night-firefly-c" />
          <div className="buddy-night-firefly buddy-night-firefly-d" />
        </>
      ) : null}
    </div>
  );
}
