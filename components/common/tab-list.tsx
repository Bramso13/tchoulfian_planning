import { cn } from "@/lib/utils";

type TabItem = {
  label: string;
  value: string;
};

type TabListProps = {
  tabs: TabItem[];
  current: string;
  onSelect?: (value: string) => void;
};

export function TabList({ tabs, current, onSelect }: TabListProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => {
        const active = tab.value === current;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSelect?.(tab.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              active
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}





