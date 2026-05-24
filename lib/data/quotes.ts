export interface Quote {
  text: string;
  author: string;
  context?: "morning" | "evening" | "pr" | "stall" | "any";
}

// David Laid and adjacent — grounded discipline, classical aesthetic mindset.
// No villain-arc cringe. Things that actually land.
export const QUOTES: Quote[] = [
  { text: "It's never too late to start. The only person you compete with is who you were yesterday.", author: "David Laid", context: "morning" },
  { text: "I was that skinny kid. I just decided I was done being him.", author: "David Laid", context: "any" },
  { text: "Symmetry is the difference between strong and statuesque.", author: "David Laid", context: "any" },
  { text: "Aesthetic isn't vanity. It's discipline made visible.", author: "David Laid", context: "any" },
  { text: "The body is sculpted by the mind that refuses to quit.", author: "David Laid", context: "morning" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", context: "any" },
  { text: "Pain is temporary. Pride is permanent.", author: "Lance Armstrong", context: "any" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", context: "morning" },
  { text: "Comparison is the thief of joy. Build your own version.", author: "Theodore Roosevelt", context: "stall" },
  { text: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weight.", author: "Ronnie Coleman", context: "any" },
  { text: "The mind is a muscle. Train it like one.", author: "Aphorism", context: "any" },
  { text: "Hard choices, easy life. Easy choices, hard life.", author: "Jerzy Gregorek", context: "evening" },
  { text: "Be the mirror you needed when you were fourteen.", author: "Anonymous", context: "morning" },
  { text: "Show up on the days you don't want to. That's where the gap is built.", author: "Anonymous", context: "any" },
  { text: "Aesthetics is the art of looking better than you have any right to.", author: "David Laid", context: "any" },
  { text: "Discipline equals freedom.", author: "Jocko Willink", context: "any" },
  { text: "When you feel like quitting, think about why you started.", author: "David Laid", context: "stall" },
  { text: "The pump is mortal. Consistency is sacred.", author: "Aphorism", context: "any" },
  { text: "Do something today your future self will thank you for.", author: "Anonymous", context: "morning" },
  { text: "Your body hears everything your mind says. Speak well.", author: "Naomi Judd", context: "any" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito", context: "any" },
  { text: "The squat rack doesn't care about your feelings.", author: "Anonymous", context: "any" },
  { text: "Excuses are easy. Reps are not.", author: "Anonymous", context: "any" },
  { text: "Marble doesn't ask for permission. It just gets carved.", author: "Anonymous", context: "any" },
  { text: "What you allow is what will continue.", author: "Anonymous", context: "stall" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill", context: "any" },
  { text: "First, we make our habits. Then our habits make us.", author: "John Dryden", context: "morning" },
  { text: "Sleep is the cheapest legal anabolic.", author: "Anonymous", context: "evening" },
  { text: "Lift the weight. Read the book. Hold the line.", author: "Anonymous", context: "any" },
  { text: "Train like someone is watching. Eat like nobody is.", author: "Anonymous", context: "any" },
  { text: "The pain of discipline weighs ounces. The pain of regret weighs tons.", author: "Jim Rohn", context: "evening" },
];

export function getQuoteForToday(streak: number): Quote {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const hour = now.getHours();

  // Pick a context window based on time
  const ctx: Quote["context"] = hour < 12 ? "morning" : hour > 19 ? "evening" : "any";
  const ctxQuotes = QUOTES.filter((q) => q.context === ctx || q.context === "any");

  // Seed deterministically by day + streak so it changes daily and as you progress
  const seed = (dayOfYear * 31 + streak * 7) % ctxQuotes.length;
  return ctxQuotes[seed];
}

export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

// Short, punchy lines used in the marquee strip
export const PHILOSOPHY_TICKER = [
  "Show up on the bad days.",
  "Symmetry over size.",
  "Discipline is freedom.",
  "The mirror doesn't lie.",
  "Eat for the body you want.",
  "Sleep is sacred.",
  "Tempo, not ego.",
  "Aesthetic. Healthy. Strong.",
  "Train hard. Recover harder.",
  "Earn every rep.",
  "Be carved, not pumped.",
  "Marble doesn't crack.",
];
