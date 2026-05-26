import { Gift, Heart, Mail, Pencil, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  canRenameOwl,
  getEventRemaining,
  getForestLevel,
  getInteractionsToday,
  type BuddyEvent,
  type BuddyState,
} from "../lib/buddy";
import { formatFiber } from "../lib/fiber";
import { BuddyForestScene } from "./BuddyForestScene";

type Props = {
  buddy: BuddyState;
  streak: number;
  totalFiber: number;
  goal: number;
  todayFoodCount: number;
  onBuddyEvent: (event: BuddyEvent) => { awarded: boolean; message: string };
  onRename: (name: string) => void;
};

type Mood = "happy" | "sleepy" | "proud" | "missed" | "calm";

function getHourMood(totalFiber: number, goal: number, todayFoodCount: number, streak: number): Mood {
  const hour = new Date().getHours();

  if (hour >= 21 || hour < 6) return "sleepy";
  if (goal > 0 && totalFiber >= goal) return "proud";
  if (todayFoodCount > 0) return "happy";
  if (streak === 0) return "missed";
  return "calm";
}

function getBuddyMessage(mood: Mood, name: string) {
  if (mood === "sleepy") return `${name} is dozing on a branch. Soft little night shift.`;
  if (mood === "proud") return `${name} is extremely proud. Fiber goal reached!`;
  if (mood === "happy") return `${name} is happy you logged something today.`;
  if (mood === "missed") return `${name} missed you. One tiny log is enough to restart.`;
  return `${name} is calm and ready for a gentle tracking day.`;
}

export function Buddy({
  buddy,
  streak,
  totalFiber,
  goal,
  todayFoodCount,
  onBuddyEvent,
  onRename,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [petSignal, setPetSignal] = useState(0);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(buddy.owlName);
  const [gatherSignal, setGatherSignal] = useState(0);

  const mood = getHourMood(totalFiber, goal, todayFoodCount, streak);
  const forest = getForestLevel(buddy.forestXp);
  const today = getInteractionsToday(buddy);
  const percent = goal > 0 ? Math.min(100, Math.round((totalFiber / goal) * 100)) : 0;
  const renameUnlocked = canRenameOwl(buddy);

  const sceneLevel = useMemo(() => Math.min(5, forest.level), [forest.level]);

  function showResult(result: { awarded: boolean; message: string }) {
    setToast(result.message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function petOwl() {
    const result = onBuddyEvent("pet");
    showResult(result);

    if (result.awarded) {
      setPetSignal((current) => current + 1);
    }
  }

  function gatherBerries() {
    const result = onBuddyEvent("gather");
    showResult(result);

    if (result.awarded) {
      setGatherSignal((current) => current + 1);
    }
  }

  function saveName() {
    const nextName = nameDraft.trim();

    if (!nextName) {
      alert("Give your owl a name first.");
      return;
    }

    onRename(nextName.slice(0, 18));
    setIsRenameOpen(false);
  }

  return (
    <div className="buddy-screen pb-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--forest-muted)]">
            Forest Buddy
          </p>
          <h1 className="mt-1 text-[34px] font-black leading-none text-[var(--forest-text)]">
            {buddy.owlName}'s Forest
          </h1>
          <p className="mt-2 max-w-[300px] text-sm font-semibold leading-snug text-[var(--forest-muted)]">
            A gentle fiber buddy. No punishment, just tiny progress.
          </p>
        </div>

        <button
          onClick={() => window.fiberOwl?.deliver(mood === "missed" ? "missed" : "test")}
          className="forest-soft-button flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
          title="Call owl mail"
        >
          <Mail size={20} />
        </button>
      </header>

      <section className="forest-stage relative overflow-hidden rounded-[2rem] border border-[var(--forest-border)] bg-[#e8f1d6] p-4 shadow-[var(--forest-shadow)]">
        <BuddyForestScene
          level={sceneLevel}
          mood={mood}
          owlName={buddy.owlName}
          petSignal={petSignal}
          gatherSignal={gatherSignal}
        />

        <div className="relative z-10 mt-3 rounded-[1.35rem] bg-white/75 p-4 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[var(--forest-text)]">
                {buddy.owlName} is {mood === "missed" ? "missing you" : mood}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-snug text-[var(--forest-muted)]">
                {getBuddyMessage(mood, buddy.owlName)}
              </p>
            </div>

            <button
              onClick={() => {
                setNameDraft(buddy.owlName);
                setIsRenameOpen(true);
              }}
              disabled={!renameUnlocked}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--forest-muted)] shadow-sm disabled:opacity-40"
              title={renameUnlocked ? "Rename owl" : "Unlock rename with 20 bond or 25 XP"}
            >
              <Pencil size={17} />
            </button>
          </div>
        </div>
      </section>

      {toast ? (
        <div className="tiny-pop mt-4 rounded-2xl bg-[#202422] px-4 py-3 text-center text-sm font-black text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <section className="mt-5 grid grid-cols-3 gap-3">
        <StatCard label="Forest XP" value={buddy.forestXp} icon="🌲" />
        <StatCard label="Bond" value={buddy.bondPoints} icon="💛" />
        <StatCard label="Streak" value={streak} icon="🔥" />
      </section>

      <section className="forest-card mt-5 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-[var(--forest-text)]">
              Level {forest.level} · {forest.title}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--forest-muted)]">
              {forest.description}
            </p>
          </div>

          <span className="rounded-full bg-[var(--forest-primary-soft)] px-3 py-1 text-xs font-black text-[var(--forest-text)]">
            {Math.round(forest.progress)}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[var(--forest-primary)] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, forest.progress))}%` }}
          />
        </div>
      </section>

      <section className="forest-card mt-5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-[var(--forest-text)]">Today with {buddy.owlName}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--forest-muted)]">
              Daily interactions are limited so it stays cute, not grindy.
            </p>
          </div>
          <Sparkles className="text-[var(--forest-accent)]" size={22} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            title="Pet owl"
            subtitle={`${getEventRemaining(buddy, "pet")} pets left today`}
            icon={<Heart size={18} />}
            onClick={petOwl}
            disabled={getEventRemaining(buddy, "pet") === 0}
          />
          <ActionButton
            title="Gather berries"
            subtitle={`${getEventRemaining(buddy, "gather")} gathers left today`}
            icon={<Gift size={18} />}
            onClick={gatherBerries}
            disabled={getEventRemaining(buddy, "gather") === 0}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-[var(--forest-muted)]">
          <p>Opened app: {today.open ?? 0}/1</p>
          <p>Food logs: {today.foodLog ?? 0}/8</p>
          <p>New foods: {today.newFood ?? 0}/3</p>
          <p>Goal bonus: {today.goal ?? 0}/1</p>
        </div>
      </section>

      <section className="forest-card mt-5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-black text-[var(--forest-text)]">Fiber today</p>
            <p className="mt-1 text-sm font-semibold text-[var(--forest-muted)]">
              {formatFiber(totalFiber)} eaten · {Math.max(0, goal - totalFiber).toFixed(1)}g left
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-lg font-black text-[var(--forest-primary)] shadow-sm">
            {percent}%
          </div>
        </div>
      </section>

      {isRenameOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[1.75rem] bg-[#fff9e8] p-5 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-950">Rename your owl</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Reward unlocked. Pick something cute.
            </p>

            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              autoFocus
              className="mt-5 h-14 w-full rounded-2xl border-2 border-emerald-200 bg-white px-4 text-lg font-black outline-none focus:border-emerald-500"
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsRenameOpen(false)}
                className="h-12 rounded-2xl bg-slate-100 font-black text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={saveName}
                className="h-12 rounded-2xl bg-[#202422] font-black text-white"
              >
                Save name
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="forest-card p-3 text-center">
      <p className="text-xl">{icon}</p>
      <p className="mt-1 text-xl font-black text-[var(--forest-text)]">{value}</p>
      <p className="text-[11px] font-black uppercase tracking-wide text-[var(--forest-muted)]">{label}</p>
    </div>
  );
}

function ActionButton({
  title,
  subtitle,
  icon,
  onClick,
  disabled,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-[1.15rem] border border-[var(--forest-border)] bg-white/70 p-3 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-45"
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--forest-primary-soft)] text-[var(--forest-primary)]">
        {icon}
      </div>
      <p className="font-black text-[var(--forest-text)]">{title}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--forest-muted)]">{subtitle}</p>
    </button>
  );
}
