"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { money, todayISO } from "@/lib/formulas";

export default function MoneyPage() {
  const { ready, todayTrips, netToday, data, addDeposit, setTripStatus } = useStore();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const todayDeposits = useMemo(
    () => data.deposits.filter((d) => d.date === todayISO()),
    [data.deposits]
  );
  const deposited = todayDeposits.reduce((s, d) => s + d.amount, 0);
  const pending = todayTrips.filter((t) => t.status === "pending");
  const diff = deposited - netToday;

  if (!ready) return <div className="p-8 text-center text-neutral-500">Loading…</div>;

  function onAdd() {
    const n = Number(amount);
    if (!n || n <= 0) return;
    addDeposit(n, note || "Bank deposit");
    setAmount("");
    setNote("");
  }

  return (
    <main className="px-4 pt-4 space-y-4">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Finance</p>
        <h1 className="text-2xl font-semibold">Money</h1>
      </header>

      <section className="rounded-2xl border border-line bg-panel p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-neutral-400">Net earnings today</span><span className="font-mono font-semibold">{money(netToday)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Deposits logged</span><span className="font-mono font-semibold">{money(deposited)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Difference (bank − net)</span><span className={`font-mono font-semibold ${Math.abs(diff) < 0.5 ? "text-lime" : "text-warn"}`}>{money(diff)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Pending trips</span><span className="font-mono font-semibold">{pending.length}</span></div>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
        <p className="text-sm font-semibold">Log bank deposit</p>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none focus:border-lime/40" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-lime/40" />
        <button type="button" onClick={onAdd} className="w-full rounded-xl bg-lime py-3 text-sm font-bold text-black">Add deposit</button>
      </section>

      {pending.length > 0 && (
        <button type="button" onClick={() => pending.forEach((t) => setTripStatus(t.id, "matched"))} className="w-full rounded-xl border border-line py-3 text-sm font-semibold text-cyan">
          Mark all pending trips as matched
        </button>
      )}

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Today deposits</p>
        {todayDeposits.length === 0 ? (
          <p className="text-sm text-neutral-500">No deposits yet.</p>
        ) : (
          todayDeposits.map((d) => (
            <div key={d.id} className="flex justify-between rounded-xl border border-line bg-panel px-3 py-2 text-sm">
              <span className="text-neutral-400">{d.note}</span>
              <span className="font-mono">{money(d.amount)}</span>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
