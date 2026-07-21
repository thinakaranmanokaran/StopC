import { create } from "zustand";
import type { ClipboardEventPayload } from "@/types/clipboard";

interface ClipboardState {
  lastEvent: ClipboardEventPayload | null;
  history: ClipboardEventPayload[];
  todayCount: number;
  totalCount: number;
  pushEvent: (event: ClipboardEventPayload) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 50; // capped for the MVP; configurable later via settings

export const useClipboardStore = create<ClipboardState>((set) => ({
  lastEvent: null,
  history: [],
  todayCount: 0,
  totalCount: 0,
  pushEvent: (event) =>
    set((state) => {
      if (event.is_duplicate) {
        // Duplicates feed Funny Mode elsewhere; they don't count as new copies.
        return { lastEvent: event };
      }
      return {
        lastEvent: event,
        history: [event, ...state.history].slice(0, MAX_HISTORY),
        todayCount: state.todayCount + 1,
        totalCount: state.totalCount + 1,
      };
    }),
  clearHistory: () => set({ history: [] }),
}));
