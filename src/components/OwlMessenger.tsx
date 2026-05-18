import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatFiber } from "../lib/fiber";

type Props = {
  streak: number;
  totalFiber: number;
  goal: number;
};

function getOwlMessage(streak: number, totalFiber: number, goal: number) {
  const percent = goal > 0 ? Math.round((totalFiber / goal) * 100) : 0;

  if (streak >= 14 && streak % 7 === 0) {
    return {
      title: "Owl mail!",
      body: `Amazing. ${streak} days of tracking is actually impressive. You are building a real habit.`,
    };
  }

  if (streak >= 7 && streak % 7 === 0) {
    return {
      title: "A tiny owl is proud",
      body: `One full week! You kept showing up, and that matters more than being perfect.`,
    };
  }

  if (streak > 0 && streak % 3 === 0) {
    return {
      title: "Letter from the owl",
      body: `Nice work. ${streak} days of tracking. Small boring consistency is secretly powerful.`,
    };
  }

  if (percent >= 100) {
    return {
      title: "Fiber victory!",
      body: `You hit your fiber goal today. The owl has stamped this day as excellent.`,
    };
  }

  return null;
}

export function OwlMessenger({ streak, totalFiber, goal }: Props) {
  const message = useMemo(
    () => getOwlMessage(streak, totalFiber, goal),
    [streak, totalFiber, goal],
  );

  const storageKey = message
    ? `fiber-owl-message-${streak}-${message.title}`
    : "";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!message || !storageKey) {
      setIsVisible(false);
      return;
    }

    const alreadySeen = localStorage.getItem(storageKey);

    if (!alreadySeen) {
      const timer = window.setTimeout(() => {
        setIsVisible(true);
      }, 500);

      return () => window.clearTimeout(timer);
    }

    setIsVisible(false);
  }, [message, storageKey]);

  if (!message || !isVisible) return null;

  function closeMessage() {
    if (storageKey) {
      localStorage.setItem(storageKey, "seen");
    }

    setIsVisible(false);
  }

  return (
    <div className="owl-letter-enter mt-5 rounded-[1.35rem] border border-amber-200 bg-[#fff9e8] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="owl-bob flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
          🦉
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-black text-slate-950">
                {message.title}
              </p>

              <p className="mt-1 text-sm font-semibold leading-snug text-slate-600">
                {message.body}
              </p>

              {totalFiber > 0 ? (
                <p className="mt-2 text-xs font-black text-emerald-700">
                  Today: {formatFiber(totalFiber)} fiber
                </p>
              ) : null}
            </div>

            <button
              onClick={closeMessage}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
