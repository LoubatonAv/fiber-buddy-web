import { BookOpen, Lightbulb, ListPlus, UserRound } from "lucide-react";
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
  { tab: "foods", label: "Foods", icon: <ListPlus size={21} /> },
  { tab: "ideas", label: "Ideas", icon: <Lightbulb size={21} /> },
  { tab: "profile", label: "Profile", icon: <UserRound size={21} /> },
];

export function BottomNav({ activeTab, onChange }: Props) {
  return (
    <nav className="shrink-0 border-t border-slate-200 bg-white px-3 pb-3 pt-2">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => onChange(item.tab)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-1.5 text-[11px] font-extrabold transition ${
                isActive ? "text-emerald-600" : "text-slate-400"
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
