import "./olliePngBuddy.css";

export type WingFrame = "relaxed" | "up" | "mid" | "downstroke";

type OlliePngBuddyProps = {
  className?: string;
  wingFrame?: WingFrame;
};

const BODY_SRC = "/assets/owl/ollie-baby/ollie.png";
const WINGS_PATH = "/assets/owl/ollie-baby/wings";

function getWingSrc(side: "left" | "right", frame: WingFrame) {
  return `${WINGS_PATH}/${side}-wing-${frame}.png`;
}

export function OlliePngBuddy({
  className = "",
  wingFrame = "relaxed",
}: OlliePngBuddyProps) {
  return (
    <div
      className={["ollie-png-buddy", className].filter(Boolean).join(" ")}
      data-wing-frame={wingFrame}
    >
      <img
        className="ollie-wing ollie-wing-left"
        src={getWingSrc("left", wingFrame)}
        alt=""
        draggable={false}
      />

      <img
        className="ollie-wing ollie-wing-right"
        src={getWingSrc("right", wingFrame)}
        alt=""
        draggable={false}
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
