/**
 * Mirrors `funny_messages::Mood` on the Rust side (src-tauri/src/funny_messages.rs).
 * Drives which cat illustration + accent color a funny-mode toast uses.
 */
export type Mood = "annoyed" | "laughing" | "shocked" | "judging" | "crying" | "proud" | "sleepy";

export const MOOD_EMOJI: Record<Mood, string> = {
  annoyed: "😤",
  laughing: "😂",
  shocked: "😱",
  judging: "🙄",
  crying: "😭",
  proud: "🏆",
  sleepy: "😴",
};

export const MOOD_ACCENT: Record<Mood, string> = {
  annoyed: "#FF7043",
  laughing: "#FFD23F",
  shocked: "#7C5CFC",
  judging: "#9575CD",
  crying: "#4FC3F7",
  proud: "#66BB6A",
  sleepy: "#B39DDB",
};
