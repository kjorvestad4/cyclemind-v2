/**
 * StreakBadges — Cycle-aware achievement badges earned by logging streaks.
 */
import { format, subDays } from "date-fns";

const BADGES = [
  { id: "first_spark",    emoji: "✨", name: "First Spark",      desc: "Logged your first day",                streak: 1,   special: false },
  { id: "three_days",     emoji: "🌱", name: "Seedling",         desc: "3 days logged in a row",               streak: 3,   special: false },
  { id: "one_week",       emoji: "🔥", name: "Week Warrior",     desc: "7-day logging streak",                  streak: 7,   special: false },
  { id: "two_weeks",      emoji: "💜", name: "Cycle Keeper",     desc: "14 days of consistent tracking",        streak: 14,  special: false },
  { id: "one_cycle",      emoji: "🌕", name: "Full Moon",        desc: "28 days tracked — one full cycle",      streak: 28,  special: false },
  { id: "two_cycles",     emoji: "🔭", name: "Pattern Seeker",   desc: "56 days logged — two full cycles",      streak: 56,  special: false },
  { id: "three_months",   emoji: "🏆", name: "PMDD Analyst",     desc: "90 days tracked — clinical PMDD data",  streak: 90,  special: true  },
  { id: "half_year",      emoji: "🌟", name: "Cycle Sage",       desc: "180 days of daily logging",             streak: 180, special: true  },
  { id: "one_year",       emoji: "👑", name: "Health Royalty",   desc: "365 days tracked — a full year!",       streak: 365, special: true  },
];

function calculateStreak(entries) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 400; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    if (entries.find((e) => e.date === d)) streak++;
    else break;
  }
  return streak;
}

function calculateTotalDaysLogged(entries) {
  return new Set(entries.map(e => e.date)).size;
}

export default function StreakBadges({ entries }) {
  const streak = calculateStreak(entries);
  const totalDays = calculateTotalDaysLogged(entries);

  const earned = BADGES.filter(b => streak >= b.streak || totalDays >= b.streak);
  const next = BADGES.find(b => streak < b.streak && totalDays < b.streak);

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Badges Earned</p>
        <span className="text-xs text-muted-foreground">{earned.length}/{BADGES.length}</span>
      </div>

      {earned.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Log your first day to earn your first badge!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {earned.map(badge => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border w-[80px] text-center transition-all
                ${badge.special
                  ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 dark:from-amber-950/40 dark:to-amber-900/40 dark:border-amber-700"
                  : "bg-muted/50 border-border/50"
                }`}
              title={badge.desc}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-[10px] font-semibold text-foreground leading-tight">{badge.name}</span>
            </div>
          ))}

          {/* Locked badges — greyed out */}
          {BADGES.filter(b => !earned.includes(b)).map(badge => (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border w-[80px] text-center opacity-30 grayscale"
              title={`${badge.desc} (${badge.streak} day streak required)`}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-[10px] font-semibold text-foreground leading-tight">{badge.name}</span>
            </div>
          ))}
        </div>
      )}

      {next && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-lg grayscale opacity-50">{next.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-foreground">{next.name} — {next.streak - streak} days to go</p>
            <p className="text-[10px] text-muted-foreground">{next.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}