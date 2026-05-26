import { useEffect, useState } from "react";
import "./olliePngBuddy.css";

type OlliePngBuddyProps = {
  className?: string;
  isFlying?: boolean;
};

const BODY_SRC = "/assets/owl/ollie-baby/ollie.png";
const WINGS_PATH = "/assets/owl/ollie-baby/wings";

const FLAP_SPEED_MS = 120;

const FLAP_FRAMES = ["up", "mid", "up", "mid"] as const;

type FlapFrame = (typeof FLAP_FRAMES)[number];
type WingFrame = FlapFrame | "relaxed";
type WingSide = "left" | "right";

function getWingSrc(side: WingSide, frame: WingFrame) {
  return `${WINGS_PATH}/${side}-wing-${frame}.png`;
}

/**
 * Fallback for your older naming style:
 * relaxed-wings-left.png / relaxed-wings-right.png
 */
function getFallbackWingSrc(side: WingSide, frame: WingFrame) {
  if (frame === "relaxed") {
    return `${WINGS_PATH}/relaxed-wings-${side}.png`;
  }

  return `${WINGS_PATH}/${side}-wing-mid.png`;
}

export function OlliePngBuddy({
  className = "",
  isFlying = false,
}: OlliePngBuddyProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [leftWingSrc, setLeftWingSrc] = useState(getWingSrc("left", "relaxed"));
  const [rightWingSrc, setRightWingSrc] = useState(
    getWingSrc("right", "relaxed"),
  );

  useEffect(() => {
    if (!isFlying) {
      setFrameIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FLAP_FRAMES.length);
    }, FLAP_SPEED_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isFlying]);

  const currentWingFrame: WingFrame = isFlying
    ? FLAP_FRAMES[frameIndex]
    : "relaxed";

  useEffect(() => {
    setLeftWingSrc(getWingSrc("left", currentWingFrame));
    setRightWingSrc(getWingSrc("right", currentWingFrame));
  }, [currentWingFrame]);

  return (
    <div
      className={[
        "ollie-png-buddy",
        isFlying ? "ollie-is-flying" : "ollie-is-idle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-flying={isFlying ? "true" : "false"}
      data-wing-frame={currentWingFrame}
    >
      <img
        className="ollie-wing ollie-wing-left"
        src={leftWingSrc}
        alt=""
        draggable={false}
        onError={() => {
          setLeftWingSrc(getFallbackWingSrc("left", currentWingFrame));
        }}
      />

      <img
        className="ollie-wing ollie-wing-right"
        src={rightWingSrc}
        alt=""
        draggable={false}
        onError={() => {
          setRightWingSrc(getFallbackWingSrc("right", currentWingFrame));
        }}
      />

      <img
        className="ollie-full-body"
        src={BODY_SRC}
        alt="Ollie owl buddy"
        draggable={false}
      />
    </div>
  );
}
