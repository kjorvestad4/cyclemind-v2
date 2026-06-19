import { useNavigate } from "react-router-dom";
import { differenceInDays, format, subDays } from "date-fns";
import { Baby, Flame, Waves, AlertCircle, CheckCircle2 } from "lucide-react";
import { ALL_SYMPTOMS } from "@/lib/symptoms";
import EDDDisplay from "@/components/pregnancy/EDDDisplay";

const PP_KEYS = ["pp_lochiaBleeding","pp_perinealPain","pp_fatigue","pp_sleepWithBaby","pp_bondingDifficulties","pp_moodChanges","pp_anxietyAboutBaby"];
const PP_LABELS = { pp_lochiaBleeding: "Bleeding", pp_perinealPain: "Perineal Pain", pp_fatigue: "Fatigue", pp_sleepWithBaby: "Sleep Disruption", pp_bondingDifficulties: "Bonding", pp_moodChanges: "Mood", pp_anxietyAboutBaby: "Baby Anxiety" };
const MENO_KEYS = ["m_hot_flashes","m_night_sweats","m_mood_swings","m_sleep_disturbance","m_fatigue","m_brain_fog"];
const MENO_LABELS = { m_hot_flashes: "Hot Flashes", m_night_sweats: "Night Sweats", m_mood_swings: "Mood Swings", m_sleep_disturbance: "Sleep", m_fatigue: "Fatigue", m_brain_fog: "Brain Fog" };

function ScoreBar({ value, max = 6, label }) {
  const pct = Math.round((value / max) * 100);
  const color = value <= 2 ? "bg-emerald-400" : value <= 4 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value || "–"}/6</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MenstrualContent({ entries, cycleDay, latestCycle }) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);
  const phase = !cycleDay ? null
    : cycleDay <= 5 ? "menstrual"
    : cycleDay <= 13 ? "follicular"
    : cycleDay <= 16 ? "ovulatory"
    : "luteal";

  const phases = ["menstrual", "follicular", "ovulatory", "luteal"];
  const phaseColorActive = { menstrual: "#f43f5e", follicular: "#10b981", ovulatory: "#8b5cf6", luteal: "#3b82f6" };
  const phaseColorDim    = { menstrual: "#fda4af", follicular: "#6ee7b7", ovulatory: "#c4b5fd", luteal: "#93c5fd" };
  const phaseWidthPct    = { menstrual: "18%", follicular: "32%", ovulatory: "7%", luteal: "43%" };
  const phaseLabel       = { menstrual: "Menstrual", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };

  const topSymptoms = todayEntry
    ? ALL_SYMPTOMS.filter((s) => (todayEntry[s.key] || 0) >= 3)
        .sort((a, b) => (todayEntry[b.key] || 0) - (todayEntry[a.key] || 0))
        .slice(0, 4)
    : [];

  return (
    <div className="space-y-3">
      {cycleDay && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cycle Phase</p>
          <div style={{ display: "flex", gap: "3px", height: "12px", borderRadius: "99px", overflow: "hidden" }}>
            {phases.map((p) => (
              <div
                key={p}
                style={{
                  width: phaseWidthPct[p],
                  background: phase === p ? phaseColorActive[p] : phaseColorDim[p],
                  borderRadius: "4px",
                  transition: "background 0.3s ease",
                  boxShadow: phase === p ? `0 0 0 2px ${phaseColorActive[p]}44` : "none",
                }}
              />
            ))}
          </div>
          {phase && (
            <p style={{ fontSize: "11px", fontWeight: 600, color: phaseColorActive[phase], margin: "4px 0 0" }}>
              ● {phaseLabel[phase]} — Day {cycleDay}
            </p>
          )}
          <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
            <span>Day 1</span><span>Day 14</span><span>Day {latestCycle?.cycle_length || 28}</span>
          </div>
          {latestCycle?.cycle_length && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Last cycle length:</span>
              <span className="font-bold text-primary">{latestCycle.cycle_length} days</span>
            </div>
          )}
        </div>
      )}

      {topSymptoms.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Today's Elevated Symptoms</p>
          <div className="space-y-2.5">
            {topSymptoms.map((s) => (
              <ScoreBar key={s.key} label={s.shortLabel} value={todayEntry[s.key] || 0} />
            ))}
          </div>
        </div>
      )}

      {!todayEntry && (
        <div className="bg-muted/40 rounded-2xl p-4 text-center">
          <p className="text-sm text-muted-foreground">No entry for today yet — tap the button above to log your symptoms.</p>
        </div>
      )}
    </div>
  );
}

function PregnancyContent({ latestCycle, entries }) {
  const navigate = useNavigate();
  const edd = latestCycle?.estimated_due_date;
  const eddPassed = edd && new Date(edd) < new Date();

  const pregnancyWeek = latestCycle?.pregnancy_week
    || (latestCycle?.last_menstrual_period
      ? Math.floor(differenceInDays(new Date(), new Date(latestCycle.last_menstrual_period)) / 7)
      : null);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);
  const fetalFelt = todayEntry?.fetal_movement_felt;

  const milestones = [
    { week: 12, label: "End of 1st trimester" },
    { week: 20, label: "Anatomy scan week" },
    { week: 28, label: "3rd trimester begins" },
    { week: 40, label: "Due date" },
  ];
  const nextMilestone = pregnancyWeek ? milestones.find((m) => m.week > pregnancyWeek) : null;

  return (
    <div className="space-y-3">
      {eddPassed && (
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">Your due date has passed</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">If you've had your baby, switch to Postpartum mode to continue tracking your recovery.</p>
            <button onClick={() => navigate('/profile')} className="mt-2 text-xs font-semibold text-purple-700 dark:text-purple-300 underline">Switch to Postpartum mode →</button>
          </div>
        </div>
      )}
      <EDDDisplay
        lmp={latestCycle?.last_menstrual_period}
        ovulationDate={latestCycle?.ovulation_date}
        estimatedDueDate={latestCycle?.estimated_due_date}
        pregnancyWeek={pregnancyWeek}
      />
      {pregnancyWeek && (
        <div className="bg-card rounded-2xl border border-pink-200 dark:border-pink-900 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-pink-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pregnancy Progress</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground">{pregnancyWeek}</span>
            <span className="text-sm text-muted-foreground mb-1">weeks</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-pink-400 transition-all" style={{ width: `${Math.min(100, (pregnancyWeek / 40) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Week 1</span><span>Week 20</span><span>Week 40</span>
          </div>
          {nextMilestone && (
            <p className="text-xs text-muted-foreground">
              Next milestone: <strong>{nextMilestone.label}</strong> in {nextMilestone.week - pregnancyWeek} weeks
            </p>
          )}
        </div>
      )}
      {pregnancyWeek >= 18 && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${fetalFelt ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-border/50 bg-card"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fetalFelt ? "bg-emerald-100 dark:bg-emerald-900" : "bg-muted"}`}>
            <span className="text-xl">👶</span>
          </div>
          <div>
            <p className="text-sm font-semibold">{fetalFelt ? "Movement felt today ✓" : "Log fetal movement today"}</p>
            <p className="text-[11px] text-muted-foreground">{fetalFelt ? `${todayEntry?.fetal_movement_count || 0} kicks logged` : "Tap 'Log Today' to record kick counts"}</p>
            <p className="text-[10px] text-muted-foreground italic mt-0.5">ACOG guideline: 10 movements within 2 hours is reassuring.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PostpartumContent({ latestCycle, entries }) {
  const postpartumDay = latestCycle?.start_date
    ? Math.max(1, differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1)
    : null;

  const latestEpds = [...entries].filter((e) => e.epds_score > 0).sort((a, b) => b.date.localeCompare(a.date))[0];
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);
  const topSymptoms = PP_KEYS.filter((k) => (todayEntry?.[k] || 0) >= 3).slice(0, 4);

  return (
    <div className="space-y-3">
      {postpartumDay && (
        <div className="bg-card rounded-2xl border border-purple-200 dark:border-purple-900 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-purple-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recovery Progress</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground">{postpartumDay}</span>
            <span className="text-sm text-muted-foreground mb-1">days postpartum</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {postpartumDay <= 14 ? "Early recovery — rest and accept all support offered." : postpartumDay <= 42 ? "6-week check approaching — note any concerns to discuss." : "Beyond 6 weeks — EPDS screening is still recommended."}
          </p>
        </div>
      )}
      <div className={`rounded-2xl border p-4 space-y-2 ${latestEpds?.epds_score >= 10 ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : "border-border/50 bg-card"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {latestEpds?.epds_score >= 10
              ? <AlertCircle className="w-4 h-4 text-amber-500" />
              : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            <p className="text-sm font-semibold">EPDS Check</p>
          </div>
          {latestEpds && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${latestEpds.epds_score >= 10 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"}`}>
              {latestEpds.epds_score}/30
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {latestEpds
            ? latestEpds.epds_score >= 10
              ? `Score ${latestEpds.epds_score}/30 on ${format(new Date(latestEpds.date), "MMM d")} — consider sharing with your healthcare provider.`
              : `Last score: ${latestEpds.epds_score}/30 on ${format(new Date(latestEpds.date), "MMM d")} — within normal range.`
            : "Complete the EPDS in today's log to track postnatal mood."}
        </p>
      </div>
      {topSymptoms.length > 0 && todayEntry && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Today's Elevated Symptoms</p>
          <div className="space-y-2.5">
            {topSymptoms.map((k) => (
              <ScoreBar key={k} label={PP_LABELS[k]} value={todayEntry[k] || 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MenopauseContent({ latestCycle, entries }) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));
  const weekEntries = last7.map((d) => entries.find((e) => e.date === d)).filter(Boolean);
  const avgHotFlash = weekEntries.length
    ? (weekEntries.reduce((s, e) => s + (e.m_hot_flashes || 0), 0) / weekEntries.length).toFixed(1)
    : null;
  const todayEntry = entries.find((e) => e.date === todayStr);
  const topSymptoms = MENO_KEYS.filter((k) => (todayEntry?.[k] || 0) >= 3).slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-2xl border border-orange-200 dark:border-orange-900 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">This Week</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgHotFlash ?? "–"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Avg hot flash / day</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{weekEntries.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Days logged</p>
          </div>
        </div>
        {latestCycle?.hrt_type && (
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl px-3 py-2">
            <Waves className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">HRT: {latestCycle.hrt_type}</p>
          </div>
        )}
      </div>
      {topSymptoms.length > 0 && todayEntry && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Today's Elevated Symptoms</p>
          <div className="space-y-2.5">
            {topSymptoms.map((k) => (
              <ScoreBar key={k} label={MENO_LABELS[k]} value={todayEntry[k] || 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModeContent({ cycleType, latestCycle, entries, cycleDay }) {
  if (cycleType === "pregnancy") return <PregnancyContent latestCycle={latestCycle} entries={entries} />;
  if (cycleType === "postpartum") return <PostpartumContent latestCycle={latestCycle} entries={entries} />;
  if (cycleType === "menopause" || cycleType === "perimenopause") return <MenopauseContent latestCycle={latestCycle} entries={entries} />;
  return <MenstrualContent entries={entries} cycleDay={cycleDay} latestCycle={latestCycle} />;
}
