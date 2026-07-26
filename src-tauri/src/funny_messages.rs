use serde::Serialize;

/// A funny-mode mood, used by the frontend to pick which original cat
/// illustration (src/components/mascot/CatIllustrations.tsx) accompanies
/// the message. Kept as a flat string enum so adding a new message never
/// requires touching the frontend's switch statement — worst case an
/// unrecognized mood just falls back to a default face.
#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Mood {
    Annoyed,
    Laughing,
    Shocked,
    Judging,
    Crying,
    Proud,
    Sleepy,
}

pub struct FunnyMessage {
    pub text: &'static str,
    pub mood: Mood,
}

pub const MESSAGES: &[FunnyMessage] = &[
    FunnyMessage { text: "Bro... It already copied 😭", mood: Mood::Crying },
    FunnyMessage { text: "Relax... I got it the first time 😂", mood: Mood::Laughing },
    FunnyMessage { text: "Still not trusting me? 🥲", mood: Mood::Crying },
    FunnyMessage { text: "Ctrl+C isn't a stress ball.", mood: Mood::Annoyed },
    FunnyMessage { text: "Bro... Really?", mood: Mood::Judging },
    FunnyMessage { text: "That's Copy #5. I'm starting to take this personally.", mood: Mood::Annoyed },
    FunnyMessage { text: "You and Ctrl+C have attachment issues.", mood: Mood::Judging },
    FunnyMessage { text: "Certified Professional Ctrl+C Spammer. Achievement Unlocked.", mood: Mood::Proud },
    FunnyMessage { text: "I promise... It's copied.", mood: Mood::Sleepy },
    FunnyMessage { text: "Copy Anxiety Detected.", mood: Mood::Shocked },
    FunnyMessage { text: "Bro... The clipboard is crying.", mood: Mood::Crying },
    FunnyMessage { text: "Please stop bullying Ctrl+C.", mood: Mood::Crying },
    FunnyMessage { text: "You're pressing harder, not copying harder.", mood: Mood::Judging },
    FunnyMessage { text: "Keyboard: \"Help.\"", mood: Mood::Shocked },
    FunnyMessage { text: "Clipboard: \"I'm full bro.\"", mood: Mood::Annoyed },
    FunnyMessage { text: "This isn't Mortal Kombat.", mood: Mood::Judging },
    FunnyMessage { text: "You win. The text has surrendered.", mood: Mood::Laughing },
    FunnyMessage { text: "Trust me... I'm literally watching the clipboard.", mood: Mood::Sleepy },
    FunnyMessage { text: "Stop. Take a deep breath. It's copied.", mood: Mood::Sleepy },
    FunnyMessage { text: "The clipboard is already doing its job. Go paste it 😭", mood: Mood::Crying },
    FunnyMessage { text: "Achievement: CTRL+C Speedrunner.", mood: Mood::Proud },
    FunnyMessage { text: "Breaking News: Local keyboard abused by office worker.", mood: Mood::Shocked },
    FunnyMessage { text: "Ctrl+C Combo x7. Legendary.", mood: Mood::Proud },
    FunnyMessage { text: "The clipboard called. It wants a restraining order.", mood: Mood::Annoyed },
    FunnyMessage { text: "I'm beginning to think you don't trust me.", mood: Mood::Judging },
    FunnyMessage { text: "That's a new personal record for pressing the same key.", mood: Mood::Laughing },
    FunnyMessage { text: "Your finger and Ctrl+C need a break from each other.", mood: Mood::Sleepy },
    FunnyMessage { text: "I already told the clipboard. It knows. It's fine.", mood: Mood::Sleepy },
    FunnyMessage { text: "One more press and I'm filing a complaint.", mood: Mood::Annoyed },
    FunnyMessage { text: "This is between you and your keyboard now.", mood: Mood::Judging },
];

pub fn random_message() -> (&'static str, Mood) {
    use rand::seq::SliceRandom;
    let mut rng = rand::thread_rng();
    let msg = MESSAGES.choose(&mut rng).unwrap_or(&MESSAGES[0]);
    (msg.text, msg.mood)
}
