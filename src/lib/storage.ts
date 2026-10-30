"use client";

import type { AppData } from "./types";
import { DEFAULT_SETTINGS, EMPTY_SHIFT } from "./types";

const KEY = "copiloto_v8_data";
const BACKUP_KEY = "copiloto_v8_backup";

export function loadData(): AppData {
  if (typeof window === "undefined") {
    return emptyData();
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as AppData;
    return {
      trips: parsed.trips || [],
      deposits: parsed.deposits || [],
      shift: parsed.shift || { ...EMPTY_SHIFT },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      version: parsed.version || 1,
    };
  } catch {
    return emptyData();
  }
}

export function emptyData(): AppData {
  return {
    trips: [],
    deposits: [],
    shift: { ...EMPTY_SHIFT },
    settings: { ...DEFAULT_SETTINGS },
    version: 1,
  };
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
  try {
    localStorage.setItem(
      BACKUP_KEY,
      JSON.stringify({ at: new Date().toISOString(), data })
    );
  } catch {
    /* ignore quota */
  }
}

export function exportJson(data: AppData): string {
  return JSON.stringify({ app: "Copiloto V8", exportedAt: new Date().toISOString(), data }, null, 2);
}

export function importJson(text: string): AppData {
  const parsed = JSON.parse(text);
  const data = (parsed.data || parsed) as AppData;
  if (!data || !Array.isArray(data.trips)) throw new Error("Invalid file");
  return {
    trips: data.trips,
    deposits: data.deposits || [],
    shift: data.shift || { ...EMPTY_SHIFT },
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
    version: data.version || 1,
  };
}

export function downloadText(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
