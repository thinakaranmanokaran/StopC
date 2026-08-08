import { create } from "zustand";

interface SnoozeState {
  /** Unix-millis timestamp until which notifications are snoozed. 0 = not snoozed. */
  snoozedUntilMs: number;
  setSnoozedUntilMs: (ms: number) => void;
}

export const useSnoozeStore = create<SnoozeState>((set) => ({
  snoozedUntilMs: 0,
  setSnoozedUntilMs: (snoozedUntilMs) => set({ snoozedUntilMs }),
}));
