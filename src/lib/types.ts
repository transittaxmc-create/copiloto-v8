export type Platform =
  | "Uber"
  | "Lyft"
  | "Eco Ride"
  | "Throo"
  | "AKI Technology"
  | "Classic Ryde"
  | "Aventus Ride"
  | "Cash"
  | "Other";

export type TripStatus = "pending" | "matched" | "difference";

export type Trip = {
  id: string;
  createdAt: string;
  date: string;
  platform: Platform;
  earnings: number;
  extraCash: number;
  tips: number;
  toll: number;
  platformFee: number;
  pickup: string;
  dropoff: string;
  notes: string;
  status: TripStatus;
  isVoucher?: boolean;
};

export type ShiftState = {
  active: boolean;
  onBreak: boolean;
  startedAt: string | null;
  breakStartedAt: string | null;
  totalBreakMs: number;
};

export type Deposit = {
  id: string;
  date: string;
  amount: number;
  note: string;
  matchedTripIds: string[];
};

export type AppSettings = {
  dailyGoal: number;
  hourlyGoal: number;
  currency: string;
};

export type AppData = {
  trips: Trip[];
  deposits: Deposit[];
  shift: ShiftState;
  settings: AppSettings;
  version: number;
};

export const PLATFORMS: Platform[] = [
  "Uber",
  "Lyft",
  "Eco Ride",
  "Throo",
  "AKI Technology",
  "Classic Ryde",
  "Aventus Ride",
  "Cash",
  "Other",
];

export const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 400,
  hourlyGoal: 60,
  currency: "USD",
};

export const EMPTY_SHIFT: ShiftState = {
  active: false,
  onBreak: false,
  startedAt: null,
  breakStartedAt: null,
  totalBreakMs: 0,
};
