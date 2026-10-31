"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { downloadText } from "@/lib/storage";

export default function MorePage() {
  const { ready, data, updateSettings, exportData, importData, resetData } = useStore();
  const [daily, setDaily] = useState(String(data.settings.dailyGoal));
  const [hourly, setHourly] = useState(String(data.settings.hourlyGoal));
  const [msg, setMsg] = useState<string | null>(null);

  if (!ready) return <div className="p-8 text-center text-neutral-500">Loading…</div>;

  function onExport() {
    const json = exportData();
    downloadText(`copiloto-v8-${new Date().toISOString().slice(0, 10)}.json`, json);
    setMsg("Exported");
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importData(String(reader.result || ""));
      setMsg(res.ok ? "Imported" : res.error || "Failed");
    };
    reader.readAsText(file);
  }

  function onSaveSettings() {
    updateSettings({
      dailyGoal: Number(daily) || 400,
      hourlyGoal: Number(hourly) || 60,
    });
    setMsg("Settings saved");
  }

  function onReset() {
    if (confirm("Reset all data? This cannot be undone.")) {
      resetData();
      setMsg("Reset complete");
    }
  }

  return (
    <main className="px-4 pt-4 space-y-4 pb-4">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">More</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
        <p className="text-sm font-semibold">Goals</p>
        <label className="block text-xs text-neutral-500">
          Daily goal
          <input value={daily} onChange={(e) => setDaily(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none" />
        </label>
        <label className="block text-xs text-neutral-500">
          Hourly goal
          <input value={hourly} onChange={(e) => setHourly(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none" />
        </label>
        <button onClick={onSaveSettings} className="w-full rounded-xl bg-lime py-2.5 text-sm font-bold text-black">
          Save goals
        </button>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4 space-y-2">
        <p className="text-sm font-semibold">Data</p>
        <button onClick={onExport} className="w-full rounded-xl border border-line py-2.5 text-sm font-semibold">
          Export JSON
        </button>
        <label className="block w-full rounded-xl border border-line py-2.5 text-center text-sm font-semibold cursor-pointer">
          Import JSON
          <input type="file" accept="application/json" onChange={onImport} className="hidden" />
        </label>
        <button onClick={onReset} className="w-full rounded-xl bg-danger/15 text-danger py-2.5 text-sm font-semibold">
          Reset all data
        </button>
      </section>

      {msg && <p className="text-sm text-cyan text-center">{msg}</p>}

      <p className="text-center text-[10px] text-neutral-600">Copiloto V8 · local only</p>
    </main>
  );
}
