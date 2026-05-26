import type { ReactNode } from "react";
import { ForestAmbient } from "./ForestAmbient";
import { useForestPeriod } from "../hooks/useForestPeriod";

export function AppShell({ children }: { children: ReactNode }) {
  const period = useForestPeriod();

  return (
    <main
      className={`forest-screen forest-${period} app-soft-bg relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden text-[var(--forest-text)] shadow-2xl shadow-black/10 sm:my-6 sm:h-[860px] sm:rounded-[2rem] sm:border-4 sm:border-black`}
    >
      <ForestAmbient />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </main>
  );
}
