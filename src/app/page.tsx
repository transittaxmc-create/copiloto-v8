"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { money, dutyHours, perHour, tripNet } from "@/lib/formulas";
import { PLATFORMS, type Platform } from "@/lib/types";

export default function TodayPage() {
  const {
    ready,
    todayTrips,
    netToday,
    data,
    addTrip,
    startShift,
    toggleBreak,
    endShift,
  } = useStore();

  const [platform, setPlatform] = useState<Platform>("Uber");
  const [earnings, setEarnings] = useState("");
  const [tips, setTips] = useState("");
  const [extra, setExtra] = useState("");
  const [toll, setToll] = useState("");
  const [fee, setFee] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  if (!ready) return <div className="p-8 text-center text-neutral-500">Loading…</div>;

  const hours = dutyHours(data.shift);
  const rate = perHour(netToday, hours);
  const shift = data.shift;

  function onSave() {
    const n = Number(earnings);
    if (!n || n <= 0) {
      setMsg("Enter earnings amount");
      return;
    }
    const res = addTrip({
      platform,
      earnings: n,
      tips: Number(tips) || 0,
      extraCash: Number(extra) || 0,
      toll: Number(toll) || 0,
      platformFee: Number(fee) || 0,
      pickup,
      dropoff,
      notes,
    });
    if (!res.ok) {
      setMsg(res.reason || "Could not save");
      return;
    }
    setEarnings("");
    setTips("");
    setExtra("");
    setToll("");
    setFee("");
    setPickup("");
    setDropoff("");
    setNotes("");
    setMsg("Trip saved");
    setTimeout(() => setMsg(null), 2000);
  }

  return (
    <main className="px-4 pt-4 space-y-4 pb-4">
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

        <div className="flex gap-2 pt-1">
          {!shift.active ? (
            <button onClick={startShift} className="flex-1 rounded-xl bg-lime py-2.5 text-sm font-bold text-black">
              Start shift
            </button>
          ) : (
            <>
              <button onClick={toggleBreak} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold">
                {shift.onBreak ? "End break" : "Break"}
              </button>
              <button onClick={endShift} className="flex-1 rounded-xl bg-danger/20 text-danger py-2.5 text-sm font-semibold">
                End shift
              </button>
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
        <p className="text-sm font-semibold">Log trip</p>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input inputMode="decimal" value={earnings} onChange={(e) => setEarnings(e.target.value)} placeholder="Earnings" className="rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none" />
          <input inputMode="decimal" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="Tips" className="rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none" />
          <input inputMode="decimal" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Extra cash" className="rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none" />
          <input inputMode="decimal" value={toll} onChange={(e) => setToll(e.target.value)} placeholder="Toll" className="rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none" />
          <input inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Platform fee" className="col-span-2 rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none" />
        </div>
        <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Pickup" className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none" />
        <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Dropoff" className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none" />
        {msg && <p className="text-xs text-cyan">{msg}</p>}
        <button onClick={onSave} className="w-full rounded-xl bg-lime py-3 text-sm font-bold text-black">
          Save trip
        </button>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Today trips</p>
        {todayTrips.length === 0 ? (
          <p className="text-sm text-neutral-500">No trips yet.</p>
        ) : (
          todayTrips.map((t) => (
            <div key={t.id} className="flex justify-between rounded-xl border border-line bg-panel px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{t.platform}</span>
                <span className="text-neutral-500 text-xs ml-2">{t.pickup || "—"} → {t.dropoff || "—"}</span>
              </div>
              <span className="font-mono">{money(tripNet(t))}</span>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
