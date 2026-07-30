import type { ClipboardEventPayload, FunnyModeEvent } from "@/types/clipboard";

export type ToastKind = "copy" | "funny" | "system";

export interface ActiveToast {
  /** Unique per toast instance — used as the Framer Motion animation key. */
  id: string;
  kind: ToastKind;
  copy?: ClipboardEventPayload;
  funny?: FunnyModeEvent;
  system?: { title: string; message: string };
}
