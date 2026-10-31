"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { money, sumNet, todayISO, dutyHours, perHour } from "@/lib/formulas";

export default function ReportsPage() {
  const { ready, data, netToday } = useStore();

  const stats = useMemo(() => {
    const byDay = new Map<string, number>();
    const byPlatform = new Map<string, number>();
    for (const t of data.trips) {
      byDay.set(t.date, (byDay.get(t.date) || 0) + (t.earnings || 0));
      byPlatform.set(t.platform, (byPlatform.get(t.platform) || 0) + (t.earnings || 0));
    }
    const days = [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
    const platforms = [...byPlatform.entries()].sort((a, b) => b[1] - a[1]);
    const last7 = data.trips.filter((t) => {
      const d = new Date(t.date);
      return Date.now() - d.getTime() < 7 * 86400000;
    });
    return {
      days,
      platforms,
      weekNet: sumNet(last7),
    };
  }, [data.trips]);

  if (!ready) return <div className="p-8 text-center text-neutral-500">Loading…</div>;

  const goal = data.settings.dailyGoal || 400;
  const progress = Math.min(100, Math.round((netToday / goal) * 100));
  const hours = dutyHours(data.shift);
  const rate = perHour(netToday, hours);

  return (
    <main className="px-4 pt-4 space-y-4 pb-4">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Reports</p>
        <h1 className="text-2xl font-semibold">Insights</h1>
      </header>

      <section className="rounded-2xl border border-line bg-panel p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Daily goal</span>
          <span className="font-mono">{money(netToday)} / {money(goal)}</span>
        </div>
        <div className="h-2 rounded-full bg-ink overflow-hidden">
          <div className="h-full bg-lime" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-neutral-500">{progress}% of goal · {rate != null ? money(rate) + "/h" : "no shift"}</p>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4">
        <p className="text-xs text-neutral-500 mb-2">Last 7 days (earnings)</p>
        {stats.days.length === 0 ? (
          <p className="text-sm text-neutral-500">No data.</p>
        ) : (
          <div className="space-y-1.5">
            {stats.days.map(([d, amt]) => (
              <div key={d} className="flex justify-between text-sm">
                <span className="text-neutral-400">{d}</span>
                <span className="font-mono">{money(amt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4">
        <p className="text-xs text-neutral-500 mb-2">By platform</p>
        {stats.platforms.length === 0 ? (
          <p className="text-sm text-neutral-500">No data.</p>
        ) : (
          <div className="space-y-1.5">
            {stats.platforms.map(([p, amt]) => (
              <div key={p} className="flex justify-between text-sm">
                <span>{p}</span>
                <span className="font-mono">{money(amt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4">
        <p className="text-xs text-neutral-500">7-day net</p>
        <p className="text-2xl font-mono font-semibold text-lime">{money(stats.weekNet)}</p>
      </section>
    </main>
  );
}
