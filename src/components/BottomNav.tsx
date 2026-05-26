import { BookOpen, TreePine, UserRound } from "lucide-react";
import type { MainTab } from "../types";

type Props = {
  activeTab: MainTab;
  onChange: (tab: MainTab) => void;
};

const navItems: {
  tab: MainTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  { tab: "diary", label: "Diary", icon: <BookOpen size={21} /> },
  { tab: "buddy", label: "Buddy", icon: <TreePine size={21} /> },
  { tab: "profile", label: "Profile", icon: <UserRound size={21} /> },
];

export function BottomNav({ activeTab, onChange }: Props) {
  return (
    <nav className="shrink-0 border-t border-[var(--forest-border)] bg-[rgba(255,249,232,0.82)] px-4 pb-3 pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => onChange(item.tab)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-extrabold transition ${
                isActive
                  ? "bg-[var(--forest-primary)] text-white shadow-lg shadow-black/10"
                  : "text-[var(--forest-muted)]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
