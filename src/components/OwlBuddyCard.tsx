import { Sparkles } from "lucide-react";
import type { UserProfile } from "../types";
import { formatFiber } from "../lib/fiber";

type OwlMood = "sleepy" | "proud" | "happy" | "missed" | "calm";

type ForestLevel = {
  level: number;
  name: string;
  emoji: string;
  nextAt: number;
  currentAt: number;
};

type Props = {
  profile: UserProfile;
  totalFiber: number;
  goal: number;
  remaining: number;
  percent: number;
  streak: number;
  todayCount: number;
  forestXp: number;
  onPet: () => void;
};

const levelMilestones = [
  { level: 1, name: "Little Sprout", emoji: "🌱", at: 0 },
  { level: 2, name: "Leafy Branch", emoji: "🍃", at: 25 },
  { level: 3, name: "Cozy Nest", emoji: "🪺", at: 70 },
  { level: 4, name: "Firefly Grove", emoji: "✨", at: 140 },
  { level: 5, name: "Owl Home", emoji: "🏡", at: 240 },
];

function getForestLevel(xp: number): ForestLevel {
  const current = [...levelMilestones].reverse().find((item) => xp >= item.at) ?? levelMilestones[0];
  const next = levelMilestones.find((item) => item.at > xp);

  return {
    level: current.level,
    name: current.name,
    emoji: current.emoji,
    currentAt: current.at,
    nextAt: next?.at ?? current.at + 120,
  };
}

function getMood({ percent, todayCount }: { percent: number; todayCount: number }): OwlMood {
  const hour = new Date().getHours();

  if (hour >= 21 || hour < 6) return "sleepy";
  if (percent >= 100) return "proud";
  if (todayCount > 0) return "happy";
  if (todayCount === 0) return "missed";
  return "calm";
}

function getMessage(mood: OwlMood, owlName: string, streak: number) {
  if (mood === "sleepy") return `${owlName} is sleepy, but still watching the grove.`;
  if (mood === "proud") return `${owlName} is proud. You reached your fiber goal today.`;
  if (mood === "happy") return `${owlName} found tiny seeds because you logged today.`;
  if (mood === "missed") return `${owlName} missed you. One tiny log is enough to start.`;
  if (streak > 0) return `${owlName} is calm and cozy. Your streak is growing.`;
  return `${owlName} is ready for a small forest habit.`;
}

export function OwlBuddyCard({
  profile,
  totalFiber,
  goal,
  remaining,
  percent,
  streak,
  todayCount,
  forestXp,
  onPet,
}: Props) {
  const owlName = profile.owlName ?? "Ollie";
  const bondPoints = profile.owlBondPoints ?? 0;
  const level = getForestLevel(forestXp);
  const levelProgress = Math.min(
    100,
    Math.max(0, ((forestXp - level.currentAt) / (level.nextAt - level.currentAt)) * 100),
  );
  const mood = getMood({ percent, todayCount });
  const message = getMessage(mood, owlName, streak);

  return (
    <section className="owl-buddy-card soft-rise overflow-hidden rounded-[1.8rem] border border-[var(--forest-border)] bg-[var(--forest-card)] p-4 shadow-[var(--forest-shadow)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="buddy-hill buddy-hill-a" />
        <div className="buddy-hill buddy-hill-b" />
        <div className="buddy-leaf buddy-leaf-a">🍃</div>
        <div className="buddy-leaf buddy-leaf-b">🌿</div>
        {level.level >= 4 ? <div className="buddy-firefly buddy-firefly-a" /> : null}
        {level.level >= 4 ? <div className="buddy-firefly buddy-firefly-b" /> : null}
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--forest-primary)]">
            Forest buddy
          </p>
          <h2 className="mt-1 text-[27px] font-black leading-none text-[var(--forest-text)]">
            {owlName}
          </h2>
          <p className="mt-2 max-w-[210px] text-[14px] font-semibold leading-snug text-[var(--forest-muted)]">
            {message}
          </p>
        </div>

        <button
          onClick={onPet}
          className="buddy-owl-button group relative flex h-[116px] w-[116px] shrink-0 items-center justify-center rounded-full bg-white/55 shadow-sm active:scale-[0.98]"
          title={`Pet ${owlName}`}
        >
          <BuddyOwl mood={mood} />
          <span className="buddy-heart pointer-events-none">❤</span>
        </button>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white/55 p-3 text-center">
          <p className="text-[18px] font-black text-[var(--forest-text)]">{formatFiber(totalFiber)}</p>
          <p className="text-[11px] font-bold text-[var(--forest-muted)]">Eaten</p>
        </div>
        <div className="rounded-2xl bg-white/55 p-3 text-center">
          <p className="text-[18px] font-black text-[var(--forest-text)]">{formatFiber(remaining)}</p>
          <p className="text-[11px] font-bold text-[var(--forest-muted)]">Left</p>
        </div>
        <div className="rounded-2xl bg-white/55 p-3 text-center">
          <p className="text-[18px] font-black text-[var(--forest-text)]">🔥 {streak}</p>
          <p className="text-[11px] font-bold text-[var(--forest-muted)]">Streak</p>
        </div>
      </div>

      <div className="relative z-10 mt-4 rounded-[1.2rem] bg-white/50 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-black text-[var(--forest-text)]">
            {level.emoji} Level {level.level} · {level.name}
          </p>
          <p className="flex items-center gap-1 text-xs font-black text-[var(--forest-muted)]">
            <Sparkles size={13} /> {bondPoints} bond
          </p>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[rgba(47,122,69,0.16)]">
          <div
            className="h-full rounded-full bg-[var(--forest-primary)] transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-[var(--forest-muted)]">
          Forest progress grows from logs, streaks, goal days, new foods, and gentle owl pets.
        </p>
      </div>
    </section>
  );
}

function BuddyOwl({ mood }: { mood: OwlMood }) {
  const isSad = mood === "missed";
  const isSleepy = mood === "sleepy";
  const isProud = mood === "proud";

  return (
    <svg viewBox="0 0 180 180" className="buddy-owl-svg h-full w-full" aria-hidden="true">
      <g className="buddy-owl-wings">
        <path d="M47 91 C20 76, 14 54, 20 38 C38 45, 52 59, 62 80 C65 86, 60 92, 54 94 Z" fill="#8e6248" />
        <path d="M133 91 C160 76, 166 54, 160 38 C142 45, 128 59, 118 80 C115 86, 120 92, 126 94 Z" fill="#8e6248" />
      </g>

      <ellipse cx="90" cy="106" rx="42" ry="47" fill="#b98965" />
      <ellipse cx="90" cy="115" rx="30" ry="35" fill="#f6e9ca" />
      <path d="M58 73 C62 48, 77 34, 90 34 C103 34, 118 48, 122 73" fill="#9b6e4f" />
      <path d="M62 58 L74 44 L83 57" fill="#7d503b" />
      <path d="M118 58 L106 44 L97 57" fill="#7d503b" />

      <ellipse cx="74" cy="75" rx="22" ry="24" fill="#fff8ea" />
      <ellipse cx="106" cy="75" rx="22" ry="24" fill="#fff8ea" />

      {isSleepy ? (
        <>
          <path d="M63 74 C69 79, 78 79, 84 74" stroke="#2b2118" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M96 74 C102 79, 111 79, 117 74" stroke="#2b2118" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="74" cy="75" r="12" fill="#7b4f34" />
          <circle cx="106" cy="75" r="12" fill="#7b4f34" />
          <circle cx="74" cy="75" r="6" fill="#23180f" />
          <circle cx="106" cy="75" r="6" fill="#23180f" />
          <circle cx="77" cy="71" r="2.4" fill="#ffffff" />
          <circle cx="109" cy="71" r="2.4" fill="#ffffff" />
        </>
      )}

      {isSad ? (
        <>
          <path d="M60 59 C68 55, 75 56, 82 60" stroke="#6f4732" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M98 60 C105 56, 112 55, 120 59" stroke="#6f4732" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <path d="M60 58 C68 50, 75 49, 82 54" stroke="#6f4732" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M98 54 C105 49, 112 50, 120 58" stroke="#6f4732" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      )}

      <path d="M90 82 L82 90 L98 90 Z" fill="#5d3528" />
      <path d="M90 90 L84 98 L96 98 Z" fill="#d18a34" />

      {isSad ? (
        <path d="M82 106 C86 103, 94 103, 98 106" stroke="#6b4330" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : isProud ? (
        <path d="M78 103 C84 112, 96 112, 102 103" stroke="#6b4330" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M80 104 C85 110, 95 110, 100 104" stroke="#6b4330" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}

      <ellipse cx="76" cy="117" rx="4" ry="7" fill="#d1b08a" />
      <ellipse cx="90" cy="121" rx="4" ry="8" fill="#d1b08a" />
      <ellipse cx="104" cy="117" rx="4" ry="7" fill="#d1b08a" />
    </svg>
  );
}
