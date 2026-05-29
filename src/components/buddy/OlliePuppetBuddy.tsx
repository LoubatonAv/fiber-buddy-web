import "./olliePuppetBuddy.css";
import type { WingFrame } from "./OlliePngBuddy";

type OlliePuppetActivity = "idle" | "sleeping" | "happy" | "flying";

type OlliePuppetBuddyProps = {
  className?: string;
  activity?: OlliePuppetActivity;
  wingFrame?: WingFrame;
};

const PUPPET_ASSET_PATH = "/assets/owl/ollie-puppet";
const WINGS_PATH = "/assets/owl/ollie-baby/wings";

function getWingSrc(side: "left" | "right", frame: WingFrame) {
  return `${WINGS_PATH}/${side}-wing-${frame}.png`;
}

export function OlliePuppetBuddy({
  className = "",
  activity = "idle",
  wingFrame = "relaxed",
}: OlliePuppetBuddyProps) {
  return (
    <div
      className={["ollie-puppet-buddy", `ollie-puppet-${activity}`, className]
        .filter(Boolean)
        .join(" ")}
      data-wing-frame={wingFrame}
    >
      <img
        className="ollie-puppet-part ollie-puppet-wing ollie-puppet-wing-left"
        src={getWingSrc("left", wingFrame)}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-wing ollie-puppet-wing-right"
        src={getWingSrc("right", wingFrame)}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-torso"
        src={`${PUPPET_ASSET_PATH}/ollie-torso.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-head"
        src={`${PUPPET_ASSET_PATH}/head.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-eye ollie-puppet-eye-left"
        src={`${PUPPET_ASSET_PATH}/left-eye.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-eye ollie-puppet-eye-right"
        src={`${PUPPET_ASSET_PATH}/right-eye.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-brow ollie-puppet-brow-left"
        src={`${PUPPET_ASSET_PATH}/left-brow.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-brow ollie-puppet-brow-right"
        src={`${PUPPET_ASSET_PATH}/right-brow.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-beak"
        src={`${PUPPET_ASSET_PATH}/beak.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-foot ollie-puppet-foot-left"
        src={`${PUPPET_ASSET_PATH}/left-foot.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-foot ollie-puppet-foot-right"
        src={`${PUPPET_ASSET_PATH}/right-foot.png`}
        alt=""
        draggable={false}
      />
    </div>
  );
}
