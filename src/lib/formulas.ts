import type { Trip, ShiftState } from "./types";

/** Gross: fare + extra + tips + toll (toll only if not Uber/Lyft) */
export function tripGross(t: Trip): number {
  const includeToll = t.platform !== "Uber" && t.platform !== "Lyft";
  return (
    (t.earnings || 0) +
    (t.extraCash || 0) +
    (t.tips || 0) +
    (includeToll ? t.toll || 0 : 0)
  );
}

/** Net = gross - platform fee */
export function tripNet(t: Trip): number {
  return tripGross(t) - (t.platformFee || 0);
}

export function sumGross(trips: Trip[]): number {
  return trips.reduce((s, t) => s + tripGross(t), 0);
}

export function sumNet(trips: Trip[]): number {
  return trips.reduce((s, t) => s + tripNet(t), 0);
}

export function sumField(
  trips: Trip[],
  key: keyof Pick<Trip, "earnings" | "tips" | "extraCash" | "toll" | "platformFee">
): number {
  return trips.reduce((s, t) => s + (Number(t[key]) || 0), 0);
}

export function dutyMs(shift: ShiftState, now = Date.now()): number {
  if (!shift.active || !shift.startedAt) return 0;
  const start = new Date(shift.startedAt).getTime();
  let breakMs = shift.totalBreakMs || 0;
  if (shift.onBreak && shift.breakStartedAt) {
    breakMs += now - new Date(shift.breakStartedAt).getTime();
  }
  return Math.max(0, now - start - breakMs);
}

export function dutyHours(shift: ShiftState, now = Date.now()): number {
  return dutyMs(shift, now) / 3_600_000;
}

export function perHour(amount: number, hours: number): number | null {
  if (!hours || hours <= 0.02) return null;
  return amount / hours;
}

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function tripHash(t: {
  platform: string;
  pickup: string;
  dropoff: string;
  earnings: number;
  createdAt?: string;
}): string {
  const minute = t.createdAt
    ? t.createdAt.slice(0, 16)
    : new Date().toISOString().slice(0, 16);
  return [t.platform, minute, t.pickup.trim().toLowerCase(), t.dropoff.trim().toLowerCase(), t.earnings.toFixed(2)].join("|");
}

export function money(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n || 0);
}
