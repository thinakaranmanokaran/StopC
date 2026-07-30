/**
 * A subset of funny-mode messages contain the literal token "{name}"
 * (see src-tauri/src/funny_messages.rs). This swaps it for ", <Name>"
 * when the user has set one in Settings, or removes it entirely
 * otherwise — so "Relax{name}... I got it" becomes either
 * "Relax, John... I got it" or plain "Relax... I got it".
 */
export function personalizeMessage(message: string, userName: string): string {
  const trimmed = userName.trim();
  return message.replace("{name}", trimmed ? `, ${trimmed}` : "");
}
