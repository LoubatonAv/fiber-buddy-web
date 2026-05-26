import { useEffect } from "react";

type Activity =
  | "perching"
  | "flapping"
  | "flying"
  | "foraging"
  | "petting"
  | "away"
  | "returning"
  | "sleeping";

type Spot = "left" | "right" | "center" | "ground";

type Params = {
  enabled: boolean;
  setActivity: React.Dispatch<React.SetStateAction<Activity>>;
  setSpot: React.Dispatch<React.SetStateAction<Spot>>;
};

export function useOwlMovement({ enabled, setActivity, setSpot }: Params) {
  useEffect(() => {
    if (!enabled) return;

    const spots = ["left", "center", "right", "ground"] as const;

    const interval = window.setInterval(() => {
      setActivity("flapping");

      const takeoffTimer = window.setTimeout(() => {
        setActivity("flying");

        setSpot((current) => {
          const available = spots.filter((spot) => spot !== current);
          return available[Math.floor(Math.random() * available.length)];
        });

        const landingTimer = window.setTimeout(() => {
          setActivity("perching");
        }, 1800);

        return () => window.clearTimeout(landingTimer);
      }, 520);

      return () => window.clearTimeout(takeoffTimer);
    }, 9000);

    return () => {
      window.clearInterval(interval);
    };
  }, [enabled, setActivity, setSpot]);
}
