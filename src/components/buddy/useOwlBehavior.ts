import { useMemo } from "react";

type SceneActivity =
  | "perching"
  | "flapping"
  | "flying"
  | "foraging"
  | "petting"
  | "away"
  | "returning"
  | "sleeping";

type OwlBuddyActivity = "idle" | "sleeping" | "happy" | "flying";

type Params = {
  sceneActivity: SceneActivity;
};

export function useOwlBehavior({ sceneActivity }: Params): OwlBuddyActivity {
  return useMemo(() => {
    if (sceneActivity === "sleeping") return "sleeping";

    if (sceneActivity === "petting") return "happy";

    if (
      sceneActivity === "flying" ||
      sceneActivity === "flapping" ||
      sceneActivity === "returning"
    ) {
      return "flying";
    }

    return "idle";
  }, [sceneActivity]);
}
