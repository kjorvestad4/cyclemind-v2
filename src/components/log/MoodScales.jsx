import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const PHQ9 = [
  { key: "q1", label: "Little interest or pleasure in doing things?" },
  { key: "q2", label: "Feeling down, depressed, or hopeless?" },
  { key: "q3", label: "Trouble falling or staying asleep, or sleeping too much?" },
  { key: "q4", label: "Feeling tired or having little energy?" },
  { key: "q5", label: "Poor appetite or overeating?" },
  { key: "q6", label: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?" },
  { key: "q7", label: "Trouble concentrating on things, such as reading the newspaper or watching television?" },
  { key: "q8", label: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?" },
  { key: "q9", label: "Thoughts that you would be better off dead or of hurting yourself in some way?" },
];

const GAD7 = [
  { key: "q1", label: "Feeling nervous, anxious, or on edge?" },
  { key: "q2", label: "Not being able to stop or control worrying?" },
  { key: "q3", label: "Worrying too much about different things?" },
  { key: "q4", label: "Trouble relaxing?" },
  { key: "q5", label: "Being so restless that it's hard to sit still?" },
  { key: "q6", label: "Becoming easily annoyed or irritable?" },
  { key: "q7", label: "Feeling afraid, as if something awful might happen?" },
];

const OPTS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
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

function ScaleQuestion({ q, value, onChange }) {
  return (
    <div className="space-y-2 py-3 border-b border-border/40 last:border-0">
      <p className="text-sm font-medium text-foreground leading-snug">{q.label}</p>
      <div className="grid grid-cols-2 gap-2">
        {OPTS.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(q.key, value === o.value ? null : o.value)}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 text-left ${
              value === o.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="font-bold mr-1">{o.value}</span> {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getSeverityLabel(score, max) {
  const pct = score / max;
  if (pct === 0) return null;
  if (max === 27) {
    if (score < 5) return { text: "Minimal depression", color: "text-emerald-600" };
    if (score < 10) return { text: "Mild depression", color: "text-yellow-600" };
    if (score < 15) return { text: "Moderate depression", color: "text-orange-600" };
    if (score < 20) return { text: "Moderately severe depression", color: "text-red-600" };
    return { text: "Severe depression", color: "text-red-700 font-bold" };
  } else {
    if (score < 5) return { text: "Minimal anxiety", color: "text-emerald-600" };
    if (score < 10) return { text: "Mild anxiety", color: "text-yellow-600" };
    if (score < 15) return { text: "Moderate anxiety", color: "text-orange-600" };
    return { text: "Severe anxiety", color: "text-red-600" };
  }
}

function ScoreBadge({ score, max, thresholds }) {
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

export default function MoodScales({
  phq9Responses = {}, gad7Responses = {}, onPHQ9Change, onGAD7Change, hidePhq9 = false,
  pcl5Responses = {}, onPCL5Change,
  fsfiResponses = {}, onFSFIChange,
  showPCL5 = false, showFSFI = false,
}) {
  const [open, setOpen] = useState(false);

  const handlePHQ = (key, val) => {
    const updated = { ...phq9Responses, [key]: val };
    const total = Object.values(updated).reduce((a, b) => a + (b ?? 0), 0);
    onPHQ9Change(total, updated);
  };

  const handleGAD = (key, val) => {
    const updated = { ...gad7Responses, [key]: val };
    const total = Object.values(updated).reduce((a, b) => a + (b ?? 0), 0);
    onGAD7Change(total, updated);
  };

  const handlePCL5 = (key, value) => {
    const updated = { ...pcl5Responses, [key]: value };
    const total = Object.values(updated).reduce((s, v) => s + (parseInt(v) || 0), 0);
    onPCL5Change && onPCL5Change(total, updated);
  };

  const handleFSFI = (key, value) => {
    const updated = { ...fsfiResponses, [key]: value };
    const total = Object.values(updated).reduce((s, v) => s + (parseInt(v) || 0), 0);
    onFSFIChange && onFSFIChange(total, updated);
  };

  const phqTotal = Object.values(phq9Responses).reduce((a, b) => a + (b ?? 0), 0);
  const gadTotal = Object.values(gad7Responses).reduce((a, b) => a + (b ?? 0), 0);
  const pcl5Total = Object.values(pcl5Responses).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const phqSev = getSeverityLabel(phqTotal, 27);
  const gadSev = getSeverityLabel(gadTotal, 21);
  const hasScores = (!hidePhq9 && phqTotal > 0) || gadTotal > 0 || (showPCL5 && pcl5Total > 0);

  const pcl5Opts = ["0 - Not at all", "1 - A little bit", "2 - Moderately", "3 - Quite a bit", "4 - Extremely"];

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-semibold">Clinical Scales</p>
          {hasScores ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              {!hidePhq9 && `PHQ-9: ${phqTotal}/27 · `}GAD-7: {gadTotal}/21{showPCL5 && pcl5Total > 0 ? ` · PCL-5: ${pcl5Total}/80` : ""}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">Complete weekly or when symptoms are high — improves doctor reports</p>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />}
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-6">
          <p className="text-xs text-muted-foreground italic bg-muted/40 rounded-xl p-3">
            Over the <strong>past 2 weeks</strong>, how often have you been bothered by any of the following problems?
          </p>

          {/* PHQ-9 — hidden in perinatal mode */}
          {!hidePhq9 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">PHQ-9 · Depression Screening</p>
                {phqTotal > 0 && (
                  <span className={`text-xs font-semibold ${phqSev?.color}`}>{phqTotal}/27 — {phqSev?.text}</span>
                )}
              </div>
              {PHQ9.map((q) => (
                <ScaleQuestion key={q.key} q={q} value={phq9Responses[q.key] ?? null} onChange={handlePHQ} />
              ))}
              {phqTotal >= 10 && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mt-2">
                  <p className="text-xs text-amber-800 dark:text-amber-200">⚠ Score {phqTotal}/27 suggests moderate-to-severe depression. Consider sharing this with your healthcare provider.</p>
                </div>
              )}
              {(phq9Responses.q9 === 2 || phq9Responses.q9 === 3) && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 rounded-xl p-3 mt-2">
                  <p className="text-xs text-red-800 dark:text-red-200 font-semibold">🆘 You indicated thoughts of self-harm. Please reach out to a crisis line or healthcare provider. If in the US, call or text 988.</p>
                </div>
              )}
            </div>
          )}

          {/* GAD-7 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">GAD-7 · Anxiety Screening</p>
              {gadTotal > 0 && (
                <span className={`text-xs font-semibold ${gadSev?.color}`}>{gadTotal}/21 — {gadSev?.text}</span>
              )}
            </div>
            {GAD7.map((q) => (
              <ScaleQuestion key={q.key} q={q} value={gad7Responses[q.key] ?? null} onChange={handleGAD} />
            ))}
            {gadTotal >= 10 && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mt-2">
                <p className="text-xs text-amber-800 dark:text-amber-200">⚠ Score {gadTotal}/21 suggests moderate-to-severe anxiety. Consider sharing this with your healthcare provider.</p>
              </div>
            )}
          </div>

          {/* PCL-5 — Premium only */}
          {showPCL5 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">PCL-5 · Trauma Symptom Screening</p>
                {pcl5Total > 0 && <ScoreBadge score={pcl5Total} max={80} thresholds={{ moderate: 23, high: 33 }} />}
              </div>
              <p className="text-[11px] text-muted-foreground pb-1">In the past month, how much were you bothered by: (PCL-5, Weathers et al., 2013 — public domain VA)</p>
              {PCL5_ITEMS.map(({ key, label }) => (
                <div key={key} className="space-y-1.5 py-2 border-b border-border/40 last:border-0">
                  <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pcl5Opts.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handlePCL5(key, i)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                          pcl5Responses[key] === i
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
              <p className="text-[10px] text-muted-foreground pt-1">PCL-5 score ≥31–33 may indicate PTSD — discuss with a mental health professional. Not diagnostic.</p>
            </div>
          )}

          {/* FSFI — Premium only */}
          {showFSFI && (
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">FSFI · Sexual Function Screening</p>
              <p className="text-[11px] text-muted-foreground pb-1">Optional and confidential. Rate based on the past 4 weeks. (Rosen et al., 2000 — public domain)</p>
              {FSFI_DOMAINS.map(({ domain, items }) => (
                <div key={domain} className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{domain}</p>
                  {items.map(({ key, label, options }) => (
                    <div key={key} className="space-y-1.5">
                      <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleFSFI(key, i)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                              fsfiResponses[key] === i
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
              <p className="text-[10px] text-muted-foreground pt-2">FSFI is a validated research instrument. Scores are not diagnostic — discuss with your provider.</p>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">These validated screening tools are not a diagnosis. Always consult a licensed healthcare professional.</p>
        </div>
      )}
    </div>
  );
}