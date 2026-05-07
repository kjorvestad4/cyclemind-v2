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

export default function MoodScales({ phq9Responses = {}, gad7Responses = {}, onPHQ9Change, onGAD7Change, hidePhq9 = false }) {
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

  const phqTotal = Object.values(phq9Responses).reduce((a, b) => a + (b ?? 0), 0);
  const gadTotal = Object.values(gad7Responses).reduce((a, b) => a + (b ?? 0), 0);
  const phqSev = getSeverityLabel(phqTotal, 27);
  const gadSev = getSeverityLabel(gadTotal, 21);
  const hasScores = (!hidePhq9 && phqTotal > 0) || gadTotal > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-semibold">{hidePhq9 ? "GAD-7 Anxiety Scale" : "Mood Scales (for Clinical Tracking)"}</p>
          {hasScores ? (
            <p className="text-xs text-muted-foreground mt-0.5">{!hidePhq9 && `PHQ-9: ${phqTotal}/27 · `}GAD-7: {gadTotal}/21</p>
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

          <p className="text-[10px] text-muted-foreground">These validated screening tools are not a diagnosis. Always consult a licensed healthcare professional.</p>
        </div>
      )}
    </div>
  );
}