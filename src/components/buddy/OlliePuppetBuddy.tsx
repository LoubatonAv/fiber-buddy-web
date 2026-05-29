import "./olliePuppetBuddy.css";

type OlliePuppetActivity = "idle" | "sleeping" | "happy" | "flying";

type OlliePuppetBuddyProps = {
  className?: string;
  activity?: OlliePuppetActivity;
};

const ASSET_PATH = "/assets/owl/ollie-puppet";

export function OlliePuppetBuddy({
  className = "",
  activity = "idle",
}: OlliePuppetBuddyProps) {
  return (
    <div
      className={["ollie-puppet-buddy", `ollie-puppet-${activity}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        className="ollie-puppet-part ollie-puppet-wing ollie-puppet-wing-left"
        src={`${ASSET_PATH}/left-wing.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-wing ollie-puppet-wing-right"
        src={`${ASSET_PATH}/right-wing.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-torso"
        src={`${ASSET_PATH}/ollie-torso.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-head"
        src={`${ASSET_PATH}/head.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-eye ollie-puppet-eye-left"
        src={`${ASSET_PATH}/left-eye.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-eye ollie-puppet-eye-right"
        src={`${ASSET_PATH}/right-eye.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-brow ollie-puppet-brow-left"
        src={`${ASSET_PATH}/left-brow.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-brow ollie-puppet-brow-right"
        src={`${ASSET_PATH}/right-brow.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-beak"
        src={`${ASSET_PATH}/beak.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-foot ollie-puppet-foot-left"
        src={`${ASSET_PATH}/left-foot.png`}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-puppet-part ollie-puppet-foot ollie-puppet-foot-right"
        src={`${ASSET_PATH}/right-foot.png`}
        alt=""
        draggable={false}
      />
    </div>
  );
}
