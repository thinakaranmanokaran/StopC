/// Starter set of Funny Mode one-liners. The product spec calls for 100+;
/// this skeleton ships a representative subset so the pipeline (detection
/// -> selection -> event -> toast) can be verified end to end. Swap this
/// for a JSON-loaded, user-editable list once the Settings > Funny Mode
/// import/export UI lands (see README roadmap).
pub const MESSAGES: &[&str] = &[
    "Bro... It already copied 😭",
    "Relax... I got it the first time 😂",
    "Still not trusting me? 🥲",
    "Ctrl+C isn't a stress ball.",
    "Bro... Really?",
    "That's Copy #5. I'm starting to take this personally.",
    "You and Ctrl+C have attachment issues.",
    "Certified Professional Ctrl+C Spammer. Achievement Unlocked.",
    "I promise... It's copied.",
    "Copy Anxiety Detected.",
    "Bro... The clipboard is crying.",
    "Please stop bullying Ctrl+C.",
    "You're pressing harder, not copying harder.",
    "Keyboard: \"Help.\"",
    "Clipboard: \"I'm full bro.\"",
    "This isn't Mortal Kombat.",
    "You win. The text has surrendered.",
    "Trust me... I'm literally watching the clipboard.",
    "Stop. Take a deep breath. It's copied.",
    "The clipboard is already doing its job. Go paste it 😭",
];

pub const MASCOTS: &[&str] = &["🐱", "🐶", "🐼", "🦊", "🐸", "🐵", "🐧", "🐻", "🐰"];

pub fn random_message() -> (&'static str, &'static str) {
    use rand::seq::SliceRandom;
    let mut rng = rand::thread_rng();
    let message = MESSAGES.choose(&mut rng).copied().unwrap_or(MESSAGES[0]);
    let mascot = MASCOTS.choose(&mut rng).copied().unwrap_or(MASCOTS[0]);
    (message, mascot)
}
