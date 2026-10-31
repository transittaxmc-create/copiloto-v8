"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData, AppSettings, Deposit, Trip, TripStatus } from "./types";
import { DEFAULT_SETTINGS, EMPTY_SHIFT } from "./types";
import { exportJson, importJson, loadData, saveData } from "./storage";
import { sumNet, todayISO, tripHash } from "./formulas";

type NewTrip = Omit<Trip, "id" | "createdAt" | "date" | "status"> & {
  date?: string;
  status?: TripStatus;
};

type StoreValue = {
  ready: boolean;
  data: AppData;
  todayTrips: Trip[];
  netToday: number;
  addTrip: (input: NewTrip) => { ok: boolean; reason?: string; trip?: Trip };
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
  setTripStatus: (id: string, status: TripStatus) => void;
  addDeposit: (amount: number, note: string) => void;
  removeDeposit: (id: string) => void;
  startShift: () => void;
  toggleBreak: () => void;
  endShift: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  exportData: () => string;
  importData: (text: string) => { ok: boolean; error?: string };
  resetData: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function emptyApp(): AppData {
  return {
    trips: [],
    deposits: [],
    shift: { ...EMPTY_SHIFT },
    settings: { ...DEFAULT_SETTINGS },
    version: 1,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const update = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  const todayTrips = useMemo(() => {
    if (!data) return [];
    const today = todayISO();
    return data.trips.filter((t) => t.date === today);
  }, [data]);

  const netToday = useMemo(() => sumNet(todayTrips), [todayTrips]);

  const addTrip = useCallback(
    (input: NewTrip) => {
      if (!data) return { ok: false, reason: "Not ready" };
      const now = new Date();
      const trip: Trip = {
        id: crypto.randomUUID(),
        createdAt: now.toISOString(),
        date: input.date || todayISO(now),
        platform: input.platform,
        earnings: Number(input.earnings) || 0,
        extraCash: Number(input.extraCash) || 0,
        tips: Number(input.tips) || 0,
        toll: Number(input.toll) || 0,
        platformFee: Number(input.platformFee) || 0,
        pickup: input.pickup || "",
        dropoff: input.dropoff || "",
        notes: input.notes || "",
        status: input.status || "pending",
        isVoucher: input.isVoucher,
      };

      const hash = tripHash(trip);
      const dup = data.trips.some((t) => tripHash(t) === hash);
      if (dup) return { ok: false, reason: "Duplicate trip (same platform, minute, places, amount)" };

      update({ ...data, trips: [trip, ...data.trips] });
      return { ok: true, trip };
    },
    [data, update]
  );

  const updateTrip = useCallback(
    (id: string, patch: Partial<Trip>) => {
      if (!data) return;
      update({
        ...data,
        trips: data.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      });
    },
    [data, update]
  );

  const removeTrip = useCallback(
    (id: string) => {
      if (!data) return;
      update({ ...data, trips: data.trips.filter((t) => t.id !== id) });
    },
    [data, update]
  );

  const setTripStatus = useCallback(
    (id: string, status: TripStatus) => {
      updateTrip(id, { status });
    },
    [updateTrip]
  );

  const addDeposit = useCallback(
    (amount: number, note: string) => {
      if (!data) return;
      const deposit: Deposit = {
        id: crypto.randomUUID(),
        date: todayISO(),
        amount,
        note: note || "Bank deposit",
        matchedTripIds: [],
      };
      update({ ...data, deposits: [...data.deposits, deposit] });
    },
    [data, update]
  );

  const removeDeposit = useCallback(
    (id: string) => {
      if (!data) return;
      update({ ...data, deposits: data.deposits.filter((d) => d.id !== id) });
    },
    [data, update]
  );

  const startShift = useCallback(() => {
    if (!data) return;
    update({
      ...data,
      shift: {
        active: true,
        onBreak: false,
        startedAt: new Date().toISOString(),
        breakStartedAt: null,
        totalBreakMs: 0,
      },
    });
  }, [data, update]);

  const toggleBreak = useCallback(() => {
    if (!data || !data.shift.active) return;
    const now = new Date();
    if (data.shift.onBreak) {
      const extra = data.shift.breakStartedAt
        ? now.getTime() - new Date(data.shift.breakStartedAt).getTime()
        : 0;
      update({
        ...data,
        shift: {
          ...data.shift,
          onBreak: false,
          breakStartedAt: null,
          totalBreakMs: (data.shift.totalBreakMs || 0) + extra,
        },
      });
    } else {
      update({
        ...data,
        shift: { ...data.shift, onBreak: true, breakStartedAt: now.toISOString() },
      });
    }
  }, [data, update]);

  const endShift = useCallback(() => {
    if (!data) return;
    let shift = { ...data.shift, active: false, onBreak: false };
    if (shift.onBreak && shift.breakStartedAt) {
      shift.totalBreakMs += Date.now() - new Date(shift.breakStartedAt).getTime();
      shift.breakStartedAt = null;
    }
    update({ ...data, shift });
  }, [data, update]);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      if (!data) return;
      update({ ...data, settings: { ...data.settings, ...patch } });
    },
    [data, update]
  );

  const exportData = useCallback(() => (data ? exportJson(data) : ""), [data]);

  const importData = useCallback(
    (text: string) => {
      try {
        const next = importJson(text);
        update(next);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid file" };
      }
    },
    [update]
  );

  const resetData = useCallback(() => {
    update(emptyApp());
  }, [update]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      data: data ?? emptyApp(),
      todayTrips,
      netToday,
      addTrip,
      updateTrip,
      removeTrip,
      setTripStatus,
      addDeposit,
      removeDeposit,
      startShift,
      toggleBreak,
      endShift,
      updateSettings,
      exportData,
      importData,
      resetData,
    }),
    [
      ready,
      data,
      todayTrips,
      netToday,
      addTrip,
      updateTrip,
      removeTrip,
      setTripStatus,
      addDeposit,
      removeDeposit,
      startShift,
      toggleBreak,
      endShift,
      updateSettings,
      exportData,
      importData,
      resetData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
