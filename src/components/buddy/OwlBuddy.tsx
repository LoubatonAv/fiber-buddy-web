import { useEffect, useState } from "react";
import type { WingFrame } from "./OlliePngBuddy";
import { OlliePuppetBuddy } from "./OlliePuppetBuddy";
import "./owlBuddy.css";

type Props = {
  activity: "idle" | "sleeping" | "happy" | "flying";
};

type IdleBehavior = "normal" | "hop" | "settle" | "landing" | "curious";

const FLYING_WING_FRAMES: WingFrame[] = ["up", "mid", "downstroke", "mid"];

const WING_FRAME_SPEED_MS = 120;

/*
  Debug only:
  Put "up", "mid", "downstroke", or "relaxed" here to freeze the wings.
  Put null to use normal behavior.
*/
const DEBUG_FORCE_WING_FRAME: WingFrame | null = null;

export function OwlBuddy({ activity }: Props) {
  const [hello, setHello] = useState(true);
  const [idleBehavior, setIdleBehavior] = useState<IdleBehavior>("normal");
  const [wingFrameIndex, setWingFrameIndex] = useState(0);

  const isFlying = activity === "flying";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHello(false);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (activity !== "idle") {
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
  }, [activity]);

  useEffect(() => {
    if (!isFlying || DEBUG_FORCE_WING_FRAME) {
      setWingFrameIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setWingFrameIndex((prev) => (prev + 1) % FLYING_WING_FRAMES.length);
    }, WING_FRAME_SPEED_MS);

    return () => window.clearInterval(interval);
  }, [isFlying]);

  const wingFrame: WingFrame =
    DEBUG_FORCE_WING_FRAME ??
    (isFlying ? FLYING_WING_FRAMES[wingFrameIndex] : "relaxed");

  return (
    <div
      className={`owl-buddy ${
        hello ? "owl-hello" : `owl-${activity}`
      } owl-idle-${idleBehavior}`}
    >
      <OlliePuppetBuddy
        className="owl-png"
        activity={activity}
        wingFrame={wingFrame}
      />
    </div>
  );
}
