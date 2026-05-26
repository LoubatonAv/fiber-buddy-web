type Props = {
  title?: string;
  body?: string;
  kind?: "test" | "streak" | "missed" | "goal";
};

export function MascotCallout({
  title = "Need a little owl boost?",
  body = "Call the owl for a tiny motivational letter.",
  kind = "test",
}: Props) {
  return (
    <button
      type="button"
      onClick={() => window.fiberOwl?.deliver(kind)}
      className="forest-card soft-rise w-full p-4 text-left transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/80 text-3xl shadow-sm">
          🦉
        </div>
        <div className="min-w-0">
          <p className="text-base font-black text-[var(--forest-text)]">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-snug text-[var(--forest-muted)]">
            {body}
          </p>
        </div>
      </div>
    </button>
  );
}
