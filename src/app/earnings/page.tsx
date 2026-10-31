"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { money, tripGross, tripNet } from "@/lib/formulas";
import type { TripStatus } from "@/lib/types";

const filters: { id: "all" | TripStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "matched", label: "Matched" },
  { id: "difference", label: "Diff" },
];

export default function EarningsPage() {
  const { ready, data, setTripStatus, removeTrip } = useStore();
  const [filter, setFilter] = useState<"all" | TripStatus>("all");

  const trips = useMemo(() => {
    const list = [...data.trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filter === "all" ? list : list.filter((t) => t.status === filter);
  }, [data.trips, filter]);

  const totals = useMemo(() => {
    const gross = trips.reduce((s, t) => s + tripGross(t), 0);
    const net = trips.reduce((s, t) => s + tripNet(t), 0);
    return { gross, net };
  }, [trips]);

  if (!ready) return <div className="p-8 text-center text-neutral-500">Loading…</div>;

  return (
    <main className="px-4 pt-4 space-y-4 pb-4">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Earnings</p>
        <h1 className="text-2xl font-semibold">All trips</h1>
      </header>

      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-line bg-panel p-3">
          <p className="text-xs text-neutral-500">Gross</p>
          <p className="font-mono text-lg font-semibold">{money(totals.gross)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-3">
          <p className="text-xs text-neutral-500">Net</p>
          <p className="font-mono text-lg font-semibold text-lime">{money(totals.net)}</p>
        </div>
      </section>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filter === f.id ? "bg-lime text-black" : "border border-line text-neutral-400"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="space-y-2">
        {trips.length === 0 ? (
          <p className="text-sm text-neutral-500">No trips.</p>
        ) : (
          trips.map((t) => (
            <div key={t.id} className="rounded-xl border border-line bg-panel p-3 space-y-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{t.platform}</p>
                  <p className="text-xs text-neutral-500">{t.date} · {t.pickup || "—"} → {t.dropoff || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">{money(tripNet(t))}</p>
                  <p className="text-[10px] uppercase text-neutral-500">{t.status}</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(["pending", "matched", "difference"] as TripStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTripStatus(t.id, s)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-medium ${t.status === s ? "bg-cyan/20 text-cyan" : "border border-line text-neutral-500"}`}
                  >
                    {s}
                  </button>
                ))}
                <button onClick={() => removeTrip(t.id)} className="ml-auto text-[10px] text-danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
