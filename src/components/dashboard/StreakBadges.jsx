/**
 * StreakBadges — Achievement badges across streaks, journaling, and symptom tracking.
 */
import { format, subDays } from "date-fns";
import { ALL_SYMPTOMS } from "@/lib/symptoms";

const BADGES = [
  // Streak / logging milestones
  { id: "first_spark",    emoji: "✨", name: "First Spark",      desc: "Logged your first day",                metric: "streak", threshold: 1,   special: false },
  { id: "three_days",     emoji: "🌱", name: "Seedling",         desc: "3 days logged in a row",               metric: "streak", threshold: 3,   special: false },
  { id: "one_week",       emoji: "🔥", name: "Week Warrior",     desc: "7-day logging streak",                  metric: "streak", threshold: 7,   special: false },
  { id: "two_weeks",      emoji: "💜", name: "Cycle Keeper",     desc: "14 days of consistent tracking",        metric: "streak", threshold: 14,  special: false },
  { id: "one_cycle",      emoji: "🌕", name: "Full Moon",        desc: "28 days tracked — one full cycle",      metric: "streak", threshold: 28,  special: false },
  { id: "six_weeks",      emoji: "🌗", name: "Steady Star",      desc: "45 days tracked",                       metric: "streak", threshold: 45,  special: false },
  { id: "two_cycles",     emoji: "🔭", name: "Pattern Seeker",   desc: "56 days logged — two full cycles",      metric: "streak", threshold: 56,  special: false },
  { id: "three_months",   emoji: "🏆", name: "PMDD Analyst",     desc: "90 days tracked — clinical PMDD data",  metric: "streak", threshold: 90,  special: true  },
  { id: "four_months",    emoji: "🛰️", name: "Cycle Voyager",    desc: "120 days of tracking",                  metric: "streak", threshold: 120, special: true  },
  { id: "half_year",      emoji: "🌟", name: "Cycle Sage",       desc: "180 days of daily logging",             metric: "streak", threshold: 180, special: true  },
  { id: "nine_months",    emoji: "💫", name: "Devotion",         desc: "270 days tracked",                      metric: "streak", threshold: 270, special: true  },
  { id: "one_year",       emoji: "👑", name: "Health Royalty",   desc: "365 days tracked — a full year!",       metric: "streak", threshold: 365, special: true  },
  { id: "five_hundred",   emoji: "🏅", name: "Legend",           desc: "500 days tracked",                      metric: "streak", threshold: 500, special: true  },

  // Journaling milestones
  { id: "journal_1",      emoji: "📝", name: "First Words",      desc: "Wrote your first journal entry",        metric: "journal", threshold: 1,   special: false },
  { id: "journal_10",     emoji: "📖", name: "Storyteller",      desc: "10 journal entries written",            metric: "journal", threshold: 10,  special: false },
  { id: "journal_30",     emoji: "✍️", name: "Reflective Soul",  desc: "30 journal entries written",            metric: "journal", threshold: 30,  special: false },
  { id: "journal_100",    emoji: "📚", name: "Memoirist",        desc: "100 journal entries written",           metric: "journal", threshold: 100, special: true  },

  // Symptom-tracking milestones
  { id: "symptom_1",      emoji: "🩺", name: "Body Aware",       desc: "Rated symptoms on your first day",      metric: "symptom", threshold: 1,   special: false },
  { id: "symptom_25",     emoji: "📊", name: "Data Builder",     desc: "Symptoms rated on 25 days",             metric: "symptom", threshold: 25,  special: false },
  { id: "symptom_75",     emoji: "🧬", name: "Insight Engine",   desc: "Symptoms rated on 75 days",             metric: "symptom", threshold: 75,  special: false },
  { id: "symptom_200",    emoji: "🔬", name: "Health Scientist", desc: "Symptoms rated on 200 days",            metric: "symptom", threshold: 200, special: true  },
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

const calculateTotalDaysLogged = (entries) => new Set(entries.map(e => e.date)).size;

const calculateJournalCount = (entries) =>
  entries.filter(e => e.journal_entry && e.journal_entry.trim().length > 0).length;

const calculateSymptomDays = (entries) =>
  entries.filter(e => ALL_SYMPTOMS.some(s => (e[s.key] || 0) > 0)).length;

export default function StreakBadges({ entries }) {
  const streak = calculateStreak(entries);
  const totalDays = calculateTotalDaysLogged(entries);
  const journalCount = calculateJournalCount(entries);
  const symptomDays = calculateSymptomDays(entries);

  const metricValue = (metric) => {
    if (metric === "journal") return journalCount;
    if (metric === "symptom") return symptomDays;
    return Math.max(streak, totalDays);
  };

  const earnedIds = new Set(BADGES.filter(b => metricValue(b.metric) >= b.threshold).map(b => b.id));
  const earned = BADGES.filter(b => earnedIds.has(b.id));
  const locked = BADGES.filter(b => !earnedIds.has(b.id));
  const next = locked[0] || null;
  const nextRemaining = next ? next.threshold - metricValue(next.metric) : 0;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Badges Earned</p>
        <span className="text-xs text-muted-foreground">{earned.length}/{BADGES.length}</span>
      </div>

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
        {locked.map(badge => (
          <div
            key={badge.id}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl border w-[80px] text-center opacity-30 grayscale"
            title={badge.desc}
          >
            <span className="text-2xl">{badge.emoji}</span>
            <span className="text-[10px] font-semibold text-foreground leading-tight">{badge.name}</span>
          </div>
        ))}
      </div>

      {next && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-lg grayscale opacity-50">{next.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-foreground">{next.name} — {nextRemaining} to go</p>
            <p className="text-[10px] text-muted-foreground">{next.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}