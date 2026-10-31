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
import type { AppData, Deposit, Trip, TripStatus } from "./types";
import { loadData, saveData } from "./storage";
import { sumNet, todayISO } from "./formulas";

type StoreValue = {
  ready: boolean;
  data: AppData;
  todayTrips: Trip[];
  netToday: number;
  addDeposit: (amount: number, note: string) => void;
  setTripStatus: (id: string, status: TripStatus) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

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
      update({
        ...data,
        deposits: [...data.deposits, deposit],
      });
    },
    [data, update]
  );

  const setTripStatus = useCallback(
    (id: string, status: TripStatus) => {
      if (!data) return;
      update({
        ...data,
        trips: data.trips.map((t) => (t.id === id ? { ...t, status } : t)),
      });
    },
    [data, update]
  );

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      data: data ?? {
        trips: [],
        deposits: [],
        shift: {
          active: false,
          onBreak: false,
          startedAt: null,
          breakStartedAt: null,
          totalBreakMs: 0,
        },
        settings: { dailyGoal: 400, hourlyGoal: 60, currency: "USD" },
        version: 1,
      },
      todayTrips,
      netToday,
      addDeposit,
      setTripStatus,
    }),
    [ready, data, todayTrips, netToday, addDeposit, setTripStatus]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
