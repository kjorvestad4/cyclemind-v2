/**
 * StreakBadges — Achievement badges across streaks, journaling, and symptom tracking.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { format, subDays } from "date-fns";
import { ALL_SYMPTOMS } from "@/lib/symptoms";
import { X } from "lucide-react";

const BADGES = [
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
  { id: "journal_1",      emoji: "📝", name: "First Words",      desc: "Wrote your first journal entry",        metric: "journal", threshold: 1,   special: false },
  { id: "journal_10",     emoji: "📖", name: "Storyteller",      desc: "10 journal entries written",            metric: "journal", threshold: 10,  special: false },
  { id: "journal_30",     emoji: "✍️", name: "Reflective Soul",  desc: "30 journal entries written",            metric: "journal", threshold: 30,  special: false },
  { id: "journal_100",    emoji: "📚", name: "Memoirist",        desc: "100 journal entries written",           metric: "journal", threshold: 100, special: true  },
  { id: "symptom_1",      emoji: "🩺", name: "Body Aware",       desc: "Rated symptoms on your first day",      metric: "symptom", threshold: 1,   special: false },
  { id: "symptom_25",     emoji: "📊", name: "Data Builder",     desc: "Symptoms rated on 25 days",             metric: "symptom", threshold: 25,  special: false },
  { id: "symptom_75",     emoji: "🧬", name: "Insight Engine",   desc: "Symptoms rated on 75 days",             metric: "symptom", threshold: 75,  special: false },
  { id: "symptom_200",    emoji: "🔬", name: "Health Scientist", desc: "Symptoms rated on 200 days",            metric: "symptom", threshold: 200, special: true  },
];

const METRIC_LABELS = { streak: "Logging streak", journal: "Journal entries", symptom: "Symptom-rated days" };

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
const calculateJournalCount = (entries) => entries.filter(e => e.journal_entry && e.journal_entry.trim().length > 0).length;
const calculateSymptomDays = (entries) => entries.filter(e => ALL_SYMPTOMS.some(s => (e[s.key] || 0) > 0)).length;

function BadgeDetailSheet({ badge, isEarned, metricVal, onClose }) {
  const progress = Math.min(100, (metricVal / badge.threshold) * 100);

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px", padding: "24px",
          width: "100%", maxWidth: "380px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column", gap: "16px",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "2.5rem", filter: isEarned ? "none" : "grayscale(1)", opacity: isEarned ? 1 : 0.4 }}>
              {badge.emoji}
            </span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "16px", margin: 0, color: "var(--foreground, #111)" }}>{badge.name}</p>
              <span style={{
                fontSize: "11px", padding: "2px 8px", borderRadius: "99px", fontWeight: 600,
                display: "inline-block", marginTop: "4px",
                background: isEarned ? "#d1fae5" : "#f3f4f6",
                color: isEarned ? "#065f46" : "#6b7280",
              }}>
                {isEarned ? "✓ Earned" : "🔒 Locked"}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: "6px", border: "none", background: "transparent", cursor: "pointer", borderRadius: "8px", color: "#9ca3af", fontSize: "18px", lineHeight: 1 }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{badge.desc}</p>

        <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", margin: 0 }}>
            {METRIC_LABELS[badge.metric]}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", margin: 0 }}>{metricVal} / {badge.threshold}</p>
            {!isEarned && <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{badge.threshold - metricVal} more to go</p>}
          </div>
          <div style={{ width: "100%", height: "6px", background: "#e5e7eb", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "6px", width: `${progress}%`, background: "#0d9488", borderRadius: "99px", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function StreakBadges({ entries }) {
  const [selected, setSelected] = useState(null);

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

  const isEarned = selected ? earnedIds.has(selected.id) : false;
  const selectedMetricVal = selected ? metricValue(selected.metric) : 0;

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Badges Earned</p>
          <span className="text-xs text-muted-foreground">{earned.length}/{BADGES.length}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {earned.map(badge => (
            <button
              key={badge.id}
              onClick={() => setSelected(badge)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                padding: "10px", borderRadius: "12px", width: "80px", textAlign: "center",
                border: badge.special ? "1px solid #fcd34d" : "1px solid rgba(0,0,0,0.08)",
                background: badge.special ? "linear-gradient(135deg,#fffbeb,#fef3c7)" : "rgba(0,0,0,0.03)",
                cursor: "pointer", transition: "transform 0.1s",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{badge.emoji}</span>
              <span style={{ fontSize: "10px", fontWeight: 600, lineHeight: 1.2, color: "var(--foreground, #111)" }}>{badge.name}</span>
            </button>
          ))}

          {locked.map(badge => (
            <button
              key={badge.id}
              onClick={() => setSelected(badge)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                padding: "10px", borderRadius: "12px", width: "80px", textAlign: "center",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(0,0,0,0.03)",
                cursor: "pointer", opacity: 0.35, filter: "grayscale(1)",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{badge.emoji}</span>
              <span style={{ fontSize: "10px", fontWeight: 600, lineHeight: 1.2, color: "var(--foreground, #111)" }}>{badge.name}</span>
            </button>
          ))}
        </div>

        {next && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <span style={{ fontSize: "1.125rem", filter: "grayscale(1)", opacity: 0.5 }}>{next.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-foreground">{next.name} — {nextRemaining} to go</p>
              <p className="text-[10px] text-muted-foreground">{next.desc}</p>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <BadgeDetailSheet
          badge={selected}
          isEarned={isEarned}
          metricVal={selectedMetricVal}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
