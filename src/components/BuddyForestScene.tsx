import { useEffect, useMemo, useRef, useState } from "react";
import { useForestPeriod } from "../hooks/useForestPeriod";
import { OwlBuddy } from "./buddy/OwlBuddy";

type Mood = "happy" | "sleepy" | "proud" | "missed" | "calm";

type Activity =
  | "perching"
  | "flapping"
  | "flying"
  | "hovering"
  | "foraging"
  | "petting"
  | "away"
  | "returning"
  | "sleeping";

type OwlBuddyActivity = "idle" | "sleeping" | "happy" | "flying";

type Spot =
  | "left"
  | "right"
  | "center"
  | "ground"
  | "airLeft"
  | "airCenter"
  | "airRight";

type BranchSpot = "left" | "right" | "center";
type AirSpot = "airLeft" | "airCenter" | "airRight";

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

const FLY_DURATION_MS = 3300;
const FLAP_PREP_MS = 520;
const HOVER_DURATION_MS = 2400;
const FORAGE_DURATION_MS = 2600;
const PET_DURATION_MS = 1300;
const AWAY_DURATION_MS = 4600;
const ACTION_INTERVAL_MS = 4800;

const BRANCH_SPOTS: BranchSpot[] = ["left", "right", "center"];
const AIR_SPOTS: AirSpot[] = ["airLeft", "airCenter", "airRight"];

/*
  Debug only:
  Put "perching", "flapping", "flying", "hovering", "foraging",
  "petting", "away", "returning", or "sleeping" here to freeze Ollie's activity.
  Put null to use normal behavior.
*/
const DEBUG_FORCE_ACTIVITY: Activity | null = "perching";

/*
  Debug only:
  Put "left", "right", "center", "ground",
  "airLeft", "airCenter", or "airRight" here to freeze Ollie's position.
  Put null to use normal behavior.
*/
const DEBUG_FORCE_SPOT: Spot | null = "airCenter";

function isBranchSpot(spot: Spot): spot is BranchSpot {
  return BRANCH_SPOTS.includes(spot as BranchSpot);
}

function getOwlMessage(activity: Activity, owlName: string) {
  if (activity === "sleeping") return "Zzz...";
  if (activity === "petting") return "Petting 💛";
  if (activity === "foraging") return "Gathering berries 🫐";
  if (activity === "flapping") return "Getting ready...";
  if (activity === "flying") return "Flying!";
  if (activity === "hovering") return "Floating...";
  if (activity === "returning") return "Coming back!";
  if (activity === "away") return `${owlName} is exploring...`;

  return "";
}

function getOwlBuddyActivity(activity: Activity): OwlBuddyActivity {
  if (activity === "sleeping") return "sleeping";

  if (
    activity === "flapping" ||
    activity === "flying" ||
    activity === "hovering" ||
    activity === "returning"
  ) {
    return "flying";
  }

  if (activity === "petting") return "happy";

  return "idle";
}

function getNextBranchSpot(currentSpot: Spot): BranchSpot {
  if (currentSpot === "left") return "right";
  if (currentSpot === "right") return "center";
  return "left";
}

function getRandomBranchSpot(): BranchSpot {
  return BRANCH_SPOTS[Math.floor(Math.random() * BRANCH_SPOTS.length)];
}

function getRandomAirSpot(): AirSpot {
  return AIR_SPOTS[Math.floor(Math.random() * AIR_SPOTS.length)];
}

export function BuddyForestScene({
  level,
  owlName,
  petSignal,
  gatherSignal,
}: Props) {
  const period = useForestPeriod();

  /*
    Later, for real night behavior:
    const isNight = period === "night";

    For testing:
  */
  const isNight = false;

  const [activity, setActivityState] = useState<Activity>(
    isNight ? "sleeping" : "perching",
  );

  const [spot, setSpotState] = useState<Spot>(isNight ? "right" : "left");
  const [berryKey, setBerryKey] = useState(0);

  const activityRef = useRef<Activity>(activity);
  const spotRef = useRef<Spot>(spot);

  const actionTimer = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);

  const isDebugForced =
    DEBUG_FORCE_ACTIVITY !== null || DEBUG_FORCE_SPOT !== null;

  const visualActivity = DEBUG_FORCE_ACTIVITY ?? activity;
  const visualSpot = DEBUG_FORCE_SPOT ?? spot;

  const isAway = visualActivity === "away";
  const sceneLevel = Math.min(5, Math.max(1, level));
  const owlBuddyActivity = getOwlBuddyActivity(visualActivity);

  function setActivity(nextActivity: Activity) {
    activityRef.current = nextActivity;
    setActivityState(nextActivity);
  }

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

    const landingSpot = isBranchSpot(nextSpot) ? nextSpot : "center";

    setSpot(landingSpot);
    setActivity("perching");
  }

  function startFlyingTo(nextSpot: Spot) {
    clearActionTimer();

    setActivity("flying");
    setSpot(nextSpot);

    actionTimer.current = window.setTimeout(() => {
      settle(nextSpot);
    }, FLY_DURATION_MS);
  }

  function startHovering() {
    clearActionTimer();

    const airSpot = getRandomAirSpot();

    setActivity("flying");
    setSpot(airSpot);

    actionTimer.current = window.setTimeout(() => {
      setActivity("hovering");

      actionTimer.current = window.setTimeout(() => {
        startFlyingTo(getRandomBranchSpot());
      }, HOVER_DURATION_MS);
    }, FLY_DURATION_MS);
  }

  function startFlapping() {
    clearActionTimer();

    setActivity("flapping");

    actionTimer.current = window.setTimeout(() => {
      setActivity("perching");
    }, FLAP_PREP_MS);
  }

  function startForaging() {
    clearActionTimer();

    setActivity("flying");
    setSpot("ground");

    actionTimer.current = window.setTimeout(() => {
      setActivity("foraging");
      setBerryKey((key) => key + 1);

      actionTimer.current = window.setTimeout(() => {
        startFlyingTo("center");
      }, FORAGE_DURATION_MS);
    }, FLY_DURATION_MS);
  }

  function startAway() {
    clearActionTimer();

    setActivity("away");

    actionTimer.current = window.setTimeout(() => {
      const returnSpot = getRandomBranchSpot();

      setActivity("returning");
      setSpot(returnSpot);

      actionTimer.current = window.setTimeout(() => {
        settle(returnSpot);
      }, FLY_DURATION_MS);
    }, AWAY_DURATION_MS);
  }

  function runRandomAction() {
    const currentActivity = activityRef.current;

    if (
      currentActivity === "petting" ||
      currentActivity === "foraging" ||
      currentActivity === "flying" ||
      currentActivity === "hovering" ||
      currentActivity === "flapping" ||
      currentActivity === "away" ||
      currentActivity === "returning" ||
      currentActivity === "sleeping"
    ) {
      return;
    }

    const roll = Math.random();

    if (roll < 0.28) {
      startFlyingTo(getNextBranchSpot(spotRef.current));
      return;
    }

    if (roll < 0.48) {
      startHovering();
      return;
    }

    if (roll < 0.66) {
      startForaging();
      return;
    }

    if (roll < 0.78) {
      startAway();
      return;
    }

    if (roll < 0.9) {
      startFlapping();
      return;
    }

    settle(spotRef.current);
  }

  useEffect(() => {
    if (isDebugForced) {
      clearActionTimer();
      clearIdleTimer();
      return;
    }

    clearActionTimer();

    if (isNight) {
      setActivity("sleeping");
      setSpot("right");
      return;
    }

    setActivity("perching");
    setSpot("left");
  }, [isNight, isDebugForced]);

  useEffect(() => {
    clearIdleTimer();

    if (isNight || isDebugForced) return;

    idleTimer.current = window.setInterval(() => {
      runRandomAction();
    }, ACTION_INTERVAL_MS);

    return () => {
      clearIdleTimer();
      clearActionTimer();
    };
  }, [isNight, isDebugForced]);

  useEffect(() => {
    if (petSignal <= 0 || isNight || isDebugForced) return;

    clearActionTimer();

    setActivity("petting");

    actionTimer.current = window.setTimeout(() => {
      settle(spotRef.current);
    }, PET_DURATION_MS);
  }, [petSignal, isNight, isDebugForced]);

  useEffect(() => {
    if (gatherSignal <= 0 || isNight || isDebugForced) return;

    startForaging();
  }, [gatherSignal, isNight, isDebugForced]);

  const stageClass = useMemo(() => {
    return `buddy-picture-stage buddy-scene-${period} buddy-level-${sceneLevel}`;
  }, [period, sceneLevel]);

  return (
    <div
      className={stageClass}
      style={{ backgroundImage: `url(${backgrounds[period]})` }}
    >
      <div className="buddy-picture-overlay" />

      {!isAway && isBranchSpot(visualSpot) ? (
        <img
          src="/assets/forest/branch.png"
          alt=""
          className={`ollie-branch ollie-branch-${visualSpot}`}
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
          className={`buddy-owl-actor-picture spot-${visualSpot} activity-${visualActivity}`}
        >
          {visualActivity !== "perching" ? (
            <div className="owl-action-bubble">
              {getOwlMessage(visualActivity, owlName)}
            </div>
          ) : null}

          <OwlBuddy activity={owlBuddyActivity} />

          {visualActivity === "petting" ? (
            <div className="buddy-heart-pop">💛</div>
          ) : null}

          {visualActivity === "foraging" ? (
            <div key={berryKey} className="buddy-berry-pickup">
              🫐
            </div>
          ) : null}
        </div>
      )}

      {visualActivity === "foraging" ? (
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
