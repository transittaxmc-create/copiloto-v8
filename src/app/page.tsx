"use client";

import { useStore } from "@/lib/store";
import { money, dutyHours, perHour } from "@/lib/formulas";

export default function TodayPage() {
  const { ready, todayTrips, netToday, data } = useStore();

  if (!ready) {
    return <div className="p-8 text-center text-neutral-500">Loading…</div>;
  }

  const hours = dutyHours(data.shift);
  const rate = perHour(netToday, hours);

  return (
    <main className="px-4 pt-4 space-y-4">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Today</p>
        <h1 className="text-2xl font-semibold">Copiloto V8</h1>
      </header>

      <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-neutral-400">Net earnings</p>
            <p className="text-3xl font-mono font-semibold text-lime">{money(netToday)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-400">Trips</p>
            <p className="text-2xl font-mono font-semibold">{todayTrips.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-ink/50 p-3">
            <p className="text-neutral-500 text-xs">On duty</p>
            <p className="font-mono">{hours ? hours.toFixed(1) + "h" : "—"}</p>
          </div>
          <div className="rounded-xl bg-ink/50 p-3">
            <p className="text-neutral-500 text-xs">Per hour</p>
            <p className="font-mono">{rate != null ? money(rate) : "—"}</p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Recent trips</p>
        {todayTrips.length === 0 ? (
          <p className="text-sm text-neutral-500">No trips logged today.</p>
        ) : (
          todayTrips.slice(0, 8).map((t) => (
            <div key={t.id} className="flex justify-between rounded-xl border border-line bg-panel px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{t.platform}</span>
                <span className="text-neutral-500 text-xs ml-2">{t.pickup || "Pickup"} → {t.dropoff || "Dropoff"}</span>
              </div>
              <span className="font-mono">{money(t.earnings)}</span>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
