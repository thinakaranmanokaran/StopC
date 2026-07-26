/**
 * Mirrors the `ClipboardPayload` enum emitted by the Rust backend
 * (see src-tauri/src/clipboard.rs). Keep these in sync.
 */
export type ClipboardKind =
  | "text"
  | "rich_text"
  | "html"
  | "image"
  | "file"
  | "files"
  | "folder";

export interface ClipboardEventPayload {
  kind: ClipboardKind;
  /** Short preview string, already truncated by the backend for safety/perf. */
  preview: string;
  /** Byte length of the raw content, when known (e.g. image size). */
  sizeBytes?: number;
  /** For images: "1920x1080" style dimensions. */
  dimensions?: string;
  /** For files/folders: number of items. */
  itemCount?: number;
  /** Unix millis timestamp from the backend clock. */
  timestamp: number;
  /** True if this event was suppressed as a duplicate (same hash as last copy). */
  isDuplicate: boolean;
}

import type { Mood } from "@/utils/mood";

export interface FunnyModeEvent {
  /** Consecutive Ctrl+C presses detected without a clipboard change. */
  repeatCount: number;
  message: string;
  mood: Mood;
}
