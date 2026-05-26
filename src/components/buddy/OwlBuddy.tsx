import { useEffect, useState } from "react";
import { OlliePngBuddy } from "./OlliePngBuddy";
import "./owlBuddy.css";

type Props = {
  activity: "idle" | "sleeping" | "happy" | "flying";
};

type VisualActivity = "idle" | "sleeping" | "happy" | "flying";

type IdleBehavior = "normal" | "hop" | "settle" | "landing" | "curious";

type LandingSpot = {
  x: number;
  y: number;
  scale: number;
  wingScale: number;
  facing: "left" | "right";
};

const HELLO_DURATION_MS = 1200;
const FLYING_DURATION_MS = 1500;
const AUTO_FLY_INTERVAL_MS = 5500;
const DEBUG_FREEZE_OLLIE = false;

/**
 * These positions are percentages inside the forest image/card.
 * Adjust only these numbers if Ollie does not sit exactly on the branches.
 */
const landingSpots: LandingSpot[] = [
  {
    x: 28,
    y: 48,
    scale: 0.48,
    wingScale: 0.68,
    facing: "right",
  },
  {
    x: 78,
    y: 50,
    scale: 0.44,
    wingScale: 0.64,
    facing: "left",
  },
  {
    x: 38,
    y: 78,
    scale: 0.42,
    wingScale: 0.62,
    facing: "right",
  },
  {
    x: 55,
    y: 44,
    scale: 0.36,
    wingScale: 0.58,
    facing: "right",
  },
];

export function OwlBuddy({ activity }: Props) {
  const [hello, setHello] = useState(true);

  const [visualActivity, setVisualActivity] =
    useState<VisualActivity>(activity);

  const [idleBehavior, setIdleBehavior] = useState<IdleBehavior>("normal");

  const [landingSpotIndex, setLandingSpotIndex] = useState(0);
  const [isAutoFlying, setIsAutoFlying] = useState(false);

  const currentLandingSpot = landingSpots[landingSpotIndex];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHello(false);
    }, HELLO_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (DEBUG_FREEZE_OLLIE) {
      setVisualActivity("idle");
      setIdleBehavior("normal");
      setIsAutoFlying(false);
      return;
    }

    if (activity !== "flying") {
      if (!isAutoFlying) {
        setVisualActivity(activity);
      }

      return;
    }

    setVisualActivity("flying");

    const timeout = window.setTimeout(() => {
      setVisualActivity("idle");
    }, FLYING_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [activity, isAutoFlying]);

  useEffect(() => {
    if (visualActivity !== "idle") {
      setIdleBehavior("normal");
      return;
    }

    const interval = window.setInterval(() => {
      const roll = Math.random();

      if (roll < 0.25) {
        setIdleBehavior("hop");
        window.setTimeout(() => setIdleBehavior("normal"), 1200);
      } else if (roll < 0.5) {
        setIdleBehavior("settle");
        window.setTimeout(() => setIdleBehavior("normal"), 2200);
      } else if (roll < 0.7) {
        setIdleBehavior("curious");
        window.setTimeout(() => setIdleBehavior("normal"), 1800);
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [visualActivity]);

  useEffect(() => {
    if (DEBUG_FREEZE_OLLIE) return;

    if (hello) return;
    if (activity !== "idle" && activity !== "sleeping") return;

    const interval = window.setInterval(() => {
      setIsAutoFlying(true);
      setVisualActivity("flying");
      setIdleBehavior("normal");

      setLandingSpotIndex((prevIndex) => {
        let nextIndex = prevIndex;

        while (nextIndex === prevIndex) {
          nextIndex = Math.floor(Math.random() * landingSpots.length);
        }

        return nextIndex;
      });

      window.setTimeout(() => {
        setIsAutoFlying(false);
        setVisualActivity(activity === "sleeping" ? "sleeping" : "idle");

        setIdleBehavior("landing");

        window.setTimeout(() => {
          setIdleBehavior("normal");
        }, 900);
      }, FLYING_DURATION_MS);
    }, AUTO_FLY_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [hello, activity]);

  const isOllieFlying = DEBUG_FREEZE_OLLIE
    ? false
    : visualActivity === "flying";

  return (
    <div
      className={[
        "owl-buddy",
        DEBUG_FREEZE_OLLIE
          ? "owl-idle"
          : hello
            ? "owl-hello"
            : `owl-${visualActivity}`,
        DEBUG_FREEZE_OLLIE ? "owl-idle-normal" : `owl-idle-${idleBehavior}`,
        currentLandingSpot.facing === "left"
          ? "owl-facing-left"
          : "owl-facing-right",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          left: `${currentLandingSpot.x}%`,
          top: `${currentLandingSpot.y}%`,
          "--ollie-scale": currentLandingSpot.scale,
          "--wing-scale": currentLandingSpot.wingScale,
        } as React.CSSProperties
      }
    >
      <OlliePngBuddy className="owl-png" isFlying={isOllieFlying} />
    </div>
  );
}
