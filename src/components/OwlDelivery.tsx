import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type OwlDeliveryKind = "test" | "streak" | "missed" | "goal";

export type OwlDeliveryHandle = {
  deliver: (kind?: OwlDeliveryKind) => void;
};

type Props = {
  streak: number;
  totalFiber: number;
  goal: number;
};

type Mood = "happy" | "sad" | "proud";

function getMessage(kind: OwlDeliveryKind, streak: number) {
  switch (kind) {
    case "streak":
      return {
        title: "Little streak mail!",
        body:
          streak > 1
            ? `${streak} days in a row. Tiny steps, real progress. I am very proud of you.`
            : "A fresh start! One day at a time still counts.",
        mood: "happy" as Mood,
      };

    case "missed":
      return {
        title: "I missed you",
        body:
          "You were a little quiet lately. That is okay. Even logging one tiny thing today is enough.",
        mood: "sad" as Mood,
      };

    case "goal":
      return {
        title: "Fiber victory!",
        body:
          "You reached your fiber goal today. I brought you an official very-important owl letter.",
        mood: "proud" as Mood,
      };

    case "test":
    default:
      return {
        title: "Test flight!",
        body:
          "The owl delivery system is working. Tiny wings. Serious encouragement.",
        mood: "happy" as Mood,
      };
  }
}

export const OwlDelivery = forwardRef<OwlDeliveryHandle, Props>(
  function OwlDelivery({ streak, totalFiber, goal }, ref) {
    const [isVisible, setIsVisible] = useState(false);
    const [phase, setPhase] = useState<"hidden" | "flying" | "dropped" | "open">(
      "hidden"
    );
    const [kind, setKind] = useState<OwlDeliveryKind>("test");
    const [runKey, setRunKey] = useState(0);

    const dropTimerRef = useRef<number | null>(null);
    const openTimerRef = useRef<number | null>(null);

    const message = useMemo(() => getMessage(kind, streak), [kind, streak]);

    function clearTimers() {
      if (dropTimerRef.current) {
        window.clearTimeout(dropTimerRef.current);
        dropTimerRef.current = null;
      }

      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    }

    function closeAll() {
      clearTimers();
      setPhase("hidden");
      setIsVisible(false);
    }

    function deliver(nextKind: OwlDeliveryKind = "test") {
      clearTimers();

      setKind(nextKind);
      setRunKey((current) => current + 1);
      setIsVisible(true);
      setPhase("flying");

      dropTimerRef.current = window.setTimeout(() => {
        setPhase("dropped");
      }, 1650);

      openTimerRef.current = window.setTimeout(() => {
        setPhase("open");
      }, 2600);
    }

    useImperativeHandle(ref, () => ({
      deliver,
    }));

    useEffect(() => {
      return () => {
        clearTimers();
      };
    }, []);

    if (!isVisible) return null;

    return (
      <div
        key={runKey}
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      >
        {phase === "flying" ? (
          <div className="owl-v2-flight-path absolute left-0 top-[14%]">
            <div className="owl-v2-flyer">
              <CuteOwl mood={message.mood} />
              <div className="owl-v2-carried-letter">
                <div className="owl-v2-mini-flap" />
                <span>✉</span>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "dropped" ? (
          <div className="absolute inset-0">
            <div className="owl-v2-dropped-letter absolute left-1/2 top-[58%]">
              <div className="owl-v2-mini-flap" />
              <span>✉</span>
            </div>
          </div>
        ) : null}

        {phase === "open" ? (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/45 px-5 backdrop-blur-[2px] owl-v2-overlay-fade">
            <div className="owl-v2-letter-modal w-full max-w-[370px]">
              <div className="relative">
                <div className="owl-v2-big-flap" />

                <div className="relative z-10 rounded-[1.6rem] border border-[#efd8a2] bg-[#fff8e7] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0">
                      <CuteOwl mood={message.mood} still />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a97920]">
                        Owl Mail
                      </p>

                      <h2 className="text-[27px] font-black leading-none text-slate-950">
                        {message.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-[16px] font-semibold leading-7 text-slate-700">
                    {message.body}
                  </p>

                  {kind === "goal" ? (
                    <p className="mt-3 text-sm font-black text-emerald-700">
                      Today: {Math.round(totalFiber)}g / {Math.round(goal)}g
                      fiber.
                    </p>
                  ) : null}

                  <button
                    onClick={closeAll}
                    className="mt-6 h-12 w-full rounded-2xl bg-[#202422] text-[15px] font-black text-white transition active:scale-[0.98]"
                  >
                    Aww, thanks
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

type CuteOwlProps = {
  mood: Mood;
  still?: boolean;
};

function CuteOwl({ mood, still = false }: CuteOwlProps) {
  const isSad = mood === "sad";
  const isProud = mood === "proud";

  return (
    <svg
      viewBox="0 0 180 180"
      className={`h-full w-full ${still ? "" : "owl-v2-soft-bob"}`}
      aria-hidden="true"
    >
      {!still ? (
        <>
          <g className="owl-v2-wing-left">
            <path
              d="M48 91 C20 76, 12 53, 19 35 C38 43, 53 58, 63 79 C66 85, 61 91, 55 94 Z"
              fill="#9a6b51"
            />
            <path
              d="M38 82 C24 69, 21 54, 25 42"
              stroke="#704936"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          <g className="owl-v2-wing-right">
            <path
              d="M132 91 C160 76, 168 53, 161 35 C142 43, 127 58, 117 79 C114 85, 119 91, 125 94 Z"
              fill="#9a6b51"
            />
            <path
              d="M142 82 C156 69, 159 54, 155 42"
              stroke="#704936"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </>
      ) : null}

      <ellipse cx="90" cy="106" rx="42" ry="47" fill="#b98a66" />
      <ellipse cx="90" cy="114" rx="30" ry="35" fill="#f7ebd0" />

      <path
        d="M58 73 C62 48, 77 34, 90 34 C103 34, 118 48, 122 73"
        fill="#9b6e4f"
      />

      <path d="M62 58 L74 44 L83 57" fill="#7d503b" />
      <path d="M118 58 L106 44 L97 57" fill="#7d503b" />

      <ellipse cx="74" cy="74" rx="22" ry="24" fill="#fff8ea" />
      <ellipse cx="106" cy="74" rx="22" ry="24" fill="#fff8ea" />

      <circle cx="74" cy="74" r="12" fill="#7b4f34" />
      <circle cx="106" cy="74" r="12" fill="#7b4f34" />
      <circle cx="74" cy="74" r="6" fill="#23180f" />
      <circle cx="106" cy="74" r="6" fill="#23180f" />
      <circle cx="77" cy="70" r="2.4" fill="#ffffff" />
      <circle cx="109" cy="70" r="2.4" fill="#ffffff" />

      {isSad ? (
        <>
          <path
            d="M60 58 C68 54, 75 55, 82 59"
            stroke="#6f4732"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M98 59 C105 55, 112 54, 120 58"
            stroke="#6f4732"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <path
            d="M60 58 C68 50, 75 49, 82 54"
            stroke="#6f4732"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M98 54 C105 49, 112 50, 120 58"
            stroke="#6f4732"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      <path d="M90 82 L82 90 L98 90 Z" fill="#5d3528" />
      <path d="M90 90 L84 98 L96 98 Z" fill="#d18a34" />

      {isSad ? (
        <path
          d="M82 105 C86 102, 94 102, 98 105"
          stroke="#6b4330"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : isProud ? (
        <path
          d="M79 103 C84 111, 96 111, 101 103"
          stroke="#6b4330"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M80 104 C85 109, 95 109, 100 104"
          stroke="#6b4330"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      )}

      <ellipse cx="76" cy="117" rx="4" ry="7" fill="#d1b08a" />
      <ellipse cx="90" cy="121" rx="4" ry="8" fill="#d1b08a" />
      <ellipse cx="104" cy="117" rx="4" ry="7" fill="#d1b08a" />

      <path
        d="M75 148 C76 139, 80 137, 85 142"
        stroke="#eb9a55"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M104 148 C103 139, 99 137, 94 142"
        stroke="#eb9a55"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
