/**
 * AdditionalScales — Premium-only clinical scales:
 *   - MRS (Menopause Rating Scale) for menopause/perimenopause
 *   - PCL-5 (PTSD Checklist) — free public domain
 *   - FSFI (Female Sexual Function Index) — public domain
 *
 * All behind Premium tier gate.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// ── MRS ───────────────────────────────────────────────────────────────────────
const MRS_ITEMS = [
  { key: "mrs_hot_flashes", label: "Hot flushes, sweating (episodes of sweating)" },
  { key: "mrs_heart_discomfort", label: "Heart discomfort (unusual awareness of heartbeat, palpitations)" },
  { key: "mrs_sleep_problems", label: "Sleep problems (difficulty falling asleep, sleeping through the night, waking up early)" },
  { key: "mrs_depressive_mood", label: "Depressive mood (feeling down, sad, on the verge of tears, lack of drive, mood swings)" },
  { key: "mrs_irritability", label: "Irritability (feeling nervous, inner tension, feeling aggressive)" },
  { key: "mrs_anxiety", label: "Anxiety (inner restlessness, feeling panicky)" },
  { key: "mrs_physical_mental_exhaustion", label: "Physical and mental exhaustion (general decrease in performance, impaired memory, concentration, forgetfulness)" },
  { key: "mrs_sexual_problems", label: "Sexual problems (change in sexual desire, activity, and/or satisfaction)" },
  { key: "mrs_bladder_problems", label: "Bladder problems (difficulty urinating, frequent urge to urinate, bladder incontinence)" },
  { key: "mrs_vaginal_dryness", label: "Vaginal dryness (sensation of dryness or burning, difficulty with sexual intercourse)" },
  { key: "mrs_joint_muscle", label: "Joint and muscular discomfort (pain in joints, rheumatoid complaints)" },
];

// ── PCL-5 (PTSD Checklist) ────────────────────────────────────────────────────
const PCL5_ITEMS = [
  { key: "pcl5_q1", label: "Repeated, disturbing, and unwanted memories of a stressful experience?" },
  { key: "pcl5_q2", label: "Repeated, disturbing dreams of a stressful experience?" },
  { key: "pcl5_q3", label: "Suddenly feeling or acting as if a stressful experience were actually happening again (as if you were actually back there reliving it)?" },
  { key: "pcl5_q4", label: "Feeling very upset when something reminded you of a stressful experience?" },
  { key: "pcl5_q5", label: "Having strong physical reactions when something reminded you of a stressful experience?" },
  { key: "pcl5_q6", label: "Avoiding memories, thoughts, or feelings related to a stressful experience?" },
  { key: "pcl5_q7", label: "Avoiding external reminders (people, places, conversations, activities) of a stressful experience?" },
  { key: "pcl5_q8", label: "Trouble remembering important parts of a stressful experience?" },
  { key: "pcl5_q9", label: "Having strong negative beliefs about yourself, other people, or the world?" },
  { key: "pcl5_q10", label: "Blaming yourself or someone else for a stressful experience or what happened after it?" },
  { key: "pcl5_q11", label: "Having strong negative feelings such as fear, horror, anger, guilt, or shame?" },
  { key: "pcl5_q12", label: "Loss of interest in activities that you used to enjoy?" },
  { key: "pcl5_q13", label: "Feeling distant or cut off from other people?" },
  { key: "pcl5_q14", label: "Trouble experiencing positive feelings (being unable to feel happiness or have loving feelings)?" },
  { key: "pcl5_q15", label: "Irritable behavior, angry outbursts, or acting aggressively?" },
  { key: "pcl5_q16", label: "Taking too many risks or doing things that could cause you harm?" },
  { key: "pcl5_q17", label: "Being 'superalert' or watchful or on guard?" },
  { key: "pcl5_q18", label: "Feeling jumpy or easily startled?" },
  { key: "pcl5_q19", label: "Having difficulty concentrating?" },
  { key: "pcl5_q20", label: "Trouble falling or staying asleep?" },
];

// ── FSFI ─────────────────────────────────────────────────────────────────────
const FSFI_DOMAINS = [
  {
    domain: "Desire",
    items: [
      { key: "fsfi_q1", label: "Over the past 4 weeks, how often did you feel sexual desire or interest?", options: ["0 - No sexual activity", "1 - Almost never/never", "2 - A few times", "3 - Sometimes", "4 - Most times", "5 - Almost always/always"] },
      { key: "fsfi_q2", label: "Over the past 4 weeks, how would you rate your level of sexual desire or interest?", options: ["0 - No sexual activity", "1 - Very low/none", "2 - Low", "3 - Moderate", "4 - High", "5 - Very high"] },
    ]
  },
  {
    domain: "Arousal",
    items: [
      { key: "fsfi_q3", label: "Over the past 4 weeks, how often did you feel sexually aroused during sexual activity?", options: ["0 - No sexual activity", "1 - Almost never/never", "2 - A few times", "3 - Sometimes", "4 - Most times", "5 - Almost always/always"] },
      { key: "fsfi_q4", label: "Over the past 4 weeks, how would you rate your level of sexual arousal during sexual activity?", options: ["0 - No sexual activity", "1 - Very low/none", "2 - Low", "3 - Moderate", "4 - High", "5 - Very high"] },
    ]
  },
  {
    domain: "Lubrication",
    items: [
      { key: "fsfi_q5", label: "Over the past 4 weeks, how often did you become lubricated (wet) during sexual activity?", options: ["0 - No sexual activity", "1 - Almost never/never", "2 - A few times", "3 - Sometimes", "4 - Most times", "5 - Almost always/always"] },
      { key: "fsfi_q6", label: "Over the past 4 weeks, how difficult was it to become lubricated during sexual activity?", options: ["0 - No sexual activity", "1 - Extremely difficult/impossible", "2 - Very difficult", "3 - Difficult", "4 - Slightly difficult", "5 - Not difficult"] },
    ]
  },
  {
    domain: "Pain",
    items: [
      { key: "fsfi_q7", label: "Over the past 4 weeks, how often did you experience discomfort or pain during vaginal penetration?", options: ["0 - Did not attempt", "1 - Almost always/always", "2 - Most times", "3 - Sometimes", "4 - A few times", "5 - Almost never/never"] },
    ]
  },
];

// ── Score badge helper ────────────────────────────────────────────────────────
function ScoreBadge({ score, max, thresholds }) {
  const pct = max > 0 ? score / max : 0;
  let label = "Low concern";
  let color = "bg-emerald-100 text-emerald-700";
  if (thresholds) {
    if (score >= thresholds.high) { label = "High — speak to your provider"; color = "bg-destructive/10 text-destructive"; }
    else if (score >= thresholds.moderate) { label = "Moderate"; color = "bg-amber-100 text-amber-700"; }
  }
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${color}`}>
      Score {score}/{max} — {label}
    </span>
  );
}

// ── Scale wrapper ─────────────────────────────────────────────────────────────
function ScaleSection({ title, subtitle, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{title}</span>
            {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{badge}</span>}
          </div>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ── MRS Scale ─────────────────────────────────────────────────────────────────
export function MRSScale({ responses, onComplete }) {
  const [localResponses, setLocalResponses] = useState(responses || {});

  const handleChange = (key, value) => {
    const updated = { ...localResponses, [key]: value };
    setLocalResponses(updated);
    const total = Object.values(updated).reduce((s, v) => s + (parseInt(v) || 0), 0);
    onComplete(total, updated);
  };

  const total = Object.values(localResponses).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const options = ["0 - None", "1 - Mild", "2 - Moderate", "3 - Severe", "4 - Very severe"];

  return (
    <ScaleSection
      title="Menopause Rating Scale (MRS)"
      subtitle="Rate menopausal symptoms over the past week · 0=None → 4=Very severe"
      badge="MRS"
    >
      <div className="space-y-4 pt-2">
        <p className="text-[11px] text-muted-foreground">The MRS is a validated quality-of-life scale for menopausal symptoms (Heinemann et al., 2004). Rate each symptom.</p>
        {MRS_ITEMS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChange(key, i)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    localResponses[key] === i
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <ScoreBadge score={total} max={44} thresholds={{ moderate: 9, high: 17 }} />
        </div>
        <p className="text-[10px] text-muted-foreground">MRS: 0–8 No/minimal impairment · 9–16 Mild/moderate · 17+ Severe. Consult your healthcare provider.</p>
      </div>
    </ScaleSection>
  );
}

// ── PCL-5 Scale ───────────────────────────────────────────────────────────────
export function PCL5Scale({ responses, onComplete }) {
  const [localResponses, setLocalResponses] = useState(responses || {});

  const handleChange = (key, value) => {
    const updated = { ...localResponses, [key]: value };
    setLocalResponses(updated);
    const total = Object.values(updated).reduce((s, v) => s + (parseInt(v) || 0), 0);
    onComplete(total, updated);
  };

  const total = Object.values(localResponses).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const options = ["0 - Not at all", "1 - A little bit", "2 - Moderately", "3 - Quite a bit", "4 - Extremely"];

  return (
    <ScaleSection
      title="Trauma Symptom Screening (PCL-5)"
      subtitle="PTSD Checklist for DSM-5 · Rate past-month symptoms · Public domain (VA)"
      badge="PCL-5"
    >
      <div className="space-y-4 pt-2">
        <p className="text-[11px] text-muted-foreground">The PCL-5 (Weathers et al., 2013) screens for PTSD symptoms. In the past month, how much were you bothered by:</p>
        {PCL5_ITEMS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChange(key, i)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    localResponses[key] === i
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <ScoreBadge score={total} max={80} thresholds={{ moderate: 23, high: 33 }} />
        </div>
        <p className="text-[10px] text-muted-foreground">PCL-5 score ≥31-33 may indicate PTSD — discuss with a mental health professional. Not diagnostic.</p>
      </div>
    </ScaleSection>
  );
}

// ── FSFI Scale ────────────────────────────────────────────────────────────────
export function FSFIScale({ responses, onComplete }) {
  const [localResponses, setLocalResponses] = useState(responses || {});

  const handleChange = (key, value) => {
    const updated = { ...localResponses, [key]: value };
    setLocalResponses(updated);
    const total = Object.values(updated).reduce((s, v) => s + (parseInt(v) || 0), 0);
    onComplete(total, updated);
  };

  const total = Object.values(localResponses).reduce((s, v) => s + (parseInt(v) || 0), 0);

  return (
    <ScaleSection
      title="Sexual Function Screening (FSFI)"
      subtitle="Female Sexual Function Index — select domains · Public domain (Rosen et al., 2000)"
      badge="FSFI"
    >
      <div className="space-y-5 pt-2">
        <p className="text-[11px] text-muted-foreground">The FSFI assesses sexual function in women. This is optional and completely confidential. Rate based on the past 4 weeks.</p>
        {FSFI_DOMAINS.map(({ domain, items }) => (
          <div key={domain} className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{domain}</p>
            {items.map(({ key, label, options }) => (
              <div key={key} className="space-y-1.5">
                <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleChange(key, i)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        localResponses[key] === i
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="pt-2">
          <p className="text-[11px] text-muted-foreground font-medium">Items answered: {Object.keys(localResponses).length}/{FSFI_DOMAINS.flatMap(d => d.items).length}</p>
        </div>
        <p className="text-[10px] text-muted-foreground">FSFI is a validated research instrument (Rosen et al., 2000). Scores are not diagnostic — discuss with your provider.</p>
      </div>
    </ScaleSection>
  );
}