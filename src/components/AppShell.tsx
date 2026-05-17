import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#f7f8f8] text-slate-950 shadow-2xl shadow-black/10 sm:my-6 sm:h-[860px] sm:rounded-[2rem] sm:border-4 sm:border-black">
      {children}
    </main>
  );
}
