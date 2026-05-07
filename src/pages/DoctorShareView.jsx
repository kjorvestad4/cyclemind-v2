import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, differenceInDays, isPast } from "date-fns";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { ALL_SYMPTOMS, SYMPTOM_CATEGORIES, calculateDayTotal } from "@/lib/symptoms";

export default function DoctorShareView() {
  const token = window.location.pathname.split("/share/")[1];
  const [state, setState] = useState("loading"); // loading | valid | expired | invalid
  const [share, setShare] = useState(null);
  const [entries, setEntries] = useState([]);
  const [cycles, setCycles] = useState([]);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }

    base44.entities.DoctorShare.filter({ share_token: token })
      .then(async (results) => {
        if (!results || results.length === 0) { setState("invalid"); return; }
        const s = results[0];
        if (!s.is_active || isPast(new Date(s.expires_at))) { setState("expired"); return; }

        // Increment access count
        base44.entities.DoctorShare.update(s.id, { access_count: (s.access_count || 0) + 1 }).catch(() => {});

        // Fetch data owned by the share creator
        const [allEntries, allCycles] = await Promise.all([
          base44.entities.DailyEntry.filter({ created_by: s.created_by }, "-date", 200),
          base44.entities.Cycle.filter({ created_by: s.created_by }, "-start_date", 20),
        ]);

        setShare(s);
        setEntries(allEntries || []);
        setCycles(allCycles || []);
        setState("valid");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying secure link…</p>
        </div>
      </div>
    );
  }

  if (state === "expired") {
    return <ErrorScreen icon={<Clock className="w-12 h-12 text-muted-foreground mx-auto" />} title="Link Expired" message="This share link has expired or been revoked by the patient." />;
  }

  if (state === "invalid") {
    return <ErrorScreen icon={<AlertTriangle className="w-12 h-12 text-destructive mx-auto" />} title="Invalid Link" message="This link is not valid. Please ask the patient to generate a new one." />;
  }

  return <SharedDashboard share={share} entries={entries} cycles={cycles} />;
}

function ErrorScreen({ icon, title, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-sm text-center space-y-4">
        {icon}
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="text-xs text-muted-foreground border border-border rounded-xl p-3">
          CycleMind — Secure Clinical Data Sharing
        </div>
      </div>
    </div>
  );
}

function SharedDashboard({ share, entries, cycles }) {
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const sortedCycles = [...cycles].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const expiresDate = new Date(share.expires_at);
  const daysLeft = Math.max(0, Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24)));

  // Phase averages
  const lutealEntries = [];
  const follicularEntries = [];
  sortedCycles.forEach((cycle, i) => {
    const cycleStart = new Date(cycle.start_date);
    const nextStart = sortedCycles[i + 1] ? new Date(sortedCycles[i + 1].start_date) : new Date();
    const cycleLen = differenceInDays(nextStart, cycleStart);
    const lutealStart = Math.max(1, (cycleLen || 28) - 13);
    entries.forEach((entry) => {
      const dayNum = differenceInDays(new Date(entry.date), cycleStart) + 1;
      if (dayNum >= 1 && dayNum <= (cycleLen || 28)) {
        if (dayNum >= lutealStart) lutealEntries.push(entry);
        else follicularEntries.push(entry);
      }
    });
  });

  const lutealAvgs = {};
  ALL_SYMPTOMS.forEach((s) => {
    const vals = lutealEntries.map((e) => e[s.key] || 0);
    lutealAvgs[s.key] = vals.length > 0 ? vals.reduce((a, b) => a + b) / vals.length : 0;
  });

  const topSymptoms = ALL_SYMPTOMS
    .map((s) => ({ label: s.shortLabel || s.label, avg: lutealAvgs[s.key] }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

  const recentEntries = sortedEntries.slice(-30);
  const screeningEntries = sortedEntries.filter(e => e.phq9_score > 0 || e.gad7_score > 0);
  const medEntries = share.include_medications ? sortedEntries.filter(e => e.medications_taken?.length > 0) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Clinician Banner */}
      <div className="bg-primary text-primary-foreground px-5 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-semibold">CycleMind — Secure Clinical View</span>
        </div>
        <span className="text-xs opacity-80 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Expires in {daysLeft} days · Read-only
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl font-bold font-serif">Clinical DRSP Report</h1>
            <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
              {share.anonymized ? "Anonymized Patient Data" : "Patient Report"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Shared on {format(new Date(share.created_date), "MMMM d, yyyy")} ·
            Label: {share.label || "—"}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <strong>⚕ Clinical Note:</strong> This data is based on the Daily Record of Severity of Problems (DRSP) via prospective self-report.
            It has not been clinically verified. A minimum 2-cycle review is recommended for PMDD diagnosis per DSM-5 criteria (B11.9).
            Mood disorder and medical exclusions should be evaluated prior to diagnosis.
            PHQ-9 and GAD-7 are validated screening tools, not diagnostic replacements.
          </p>
        </div>

        {/* Cycle Summary */}
        <Section title="Cycle Summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Cycles Tracked", value: cycles.length },
              { label: "Entries Logged", value: entries.length },
              { label: "Tracking Since", value: sortedCycles[0] ? format(new Date(sortedCycles[0].start_date), "MMM yyyy") : "—" },
              { label: "Avg Luteal Score", value: lutealEntries.length > 0 ? (ALL_SYMPTOMS.reduce((s, sym) => s + lutealAvgs[sym.key], 0) / ALL_SYMPTOMS.length).toFixed(1) + "/6" : "—" },
            ].map(m => (
              <div key={m.label} className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Top DRSP Symptoms */}
        {topSymptoms.some(s => s.avg > 0) && (
          <Section title="Top Luteal Phase Symptoms (DRSP avg, scale 1–6)">
            <div className="space-y-2">
              {topSymptoms.filter(s => s.avg > 0.3).map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-36 text-xs text-muted-foreground truncate shrink-0">{s.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.avg >= 4 ? "bg-red-400" : s.avg >= 3 ? "bg-orange-400" : s.avg >= 2 ? "bg-yellow-400" : "bg-emerald-400"}`}
                      style={{ width: `${(s.avg / 6) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 text-right">{s.avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* PHQ-9 & GAD-7 */}
        {share.include_screening && screeningEntries.length > 0 && (
          <Section title="PHQ-9 & GAD-7 Scores">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 text-xs font-semibold">Date</th>
                    <th className="text-center p-2 text-xs font-semibold">PHQ-9 (/27)</th>
                    <th className="text-center p-2 text-xs font-semibold">GAD-7 (/21)</th>
                    <th className="text-left p-2 text-xs font-semibold">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {screeningEntries.slice(-20).map((e, i) => {
                    const phqSev = e.phq9_score >= 20 ? "Severe" : e.phq9_score >= 15 ? "Mod-Severe" : e.phq9_score >= 10 ? "Moderate" : e.phq9_score >= 5 ? "Mild" : e.phq9_score > 0 ? "Minimal" : null;
                    const gadSev = e.gad7_score >= 15 ? "Severe" : e.gad7_score >= 10 ? "Moderate" : e.gad7_score >= 5 ? "Mild" : e.gad7_score > 0 ? "Minimal" : null;
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                        <td className="p-2 text-xs">{format(new Date(e.date), "MMM d, yyyy")}</td>
                        <td className={`p-2 text-xs text-center font-bold ${e.phq9_score >= 10 ? "text-red-600" : "text-foreground"}`}>{e.phq9_score > 0 ? e.phq9_score : "—"}</td>
                        <td className={`p-2 text-xs text-center font-bold ${e.gad7_score >= 10 ? "text-orange-600" : "text-foreground"}`}>{e.gad7_score > 0 ? e.gad7_score : "—"}</td>
                        <td className="p-2 text-xs text-muted-foreground">{[phqSev && `Dep: ${phqSev}`, gadSev && `Anx: ${gadSev}`].filter(Boolean).join(" / ") || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Medications */}
        {share.include_medications && medEntries.length > 0 && (
          <Section title="Medication Log">
            <div className="space-y-1.5">
              {medEntries.slice(-20).map((e, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground shrink-0 w-28">{format(new Date(e.date), "MMM d, yyyy")}</span>
                  <span>{e.medications_taken.join(", ")}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Journal (if included) */}
        {share.include_journal && sortedEntries.filter(e => e.journal_entry || e.notes).length > 0 && (
          <Section title="Journal Notes">
            <div className="space-y-3">
              {sortedEntries.filter(e => e.journal_entry || e.notes).slice(-15).map((e, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-xs text-primary font-semibold mb-0.5">{format(new Date(e.date), "MMM d, yyyy")}</p>
                  <p className="text-sm text-foreground">{e.journal_entry || e.notes}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center space-y-1">
          <p className="text-xs text-muted-foreground font-medium">CycleMind — Built in collaboration with psychiatrists.</p>
          <p className="text-xs text-muted-foreground">Not a diagnostic tool. For clinical discussion only.</p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Based on DRSP (Endicott et al., 2006) · PHQ-9 (Kroenke & Spitzer, 2001) · GAD-7 (Spitzer et al., 2006)
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-base border-b border-border pb-2">{title}</h2>
      {children}
    </div>
  );
}