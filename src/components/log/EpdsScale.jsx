import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Bell } from "lucide-react";

const EPDS_QUESTIONS = [
  {
    id: "q1",
    text: "I have been able to laugh and see the funny side of things",
    options: [
      { value: 0, label: "As much as I always could" },
      { value: 1, label: "Not quite so much now" },
      { value: 2, label: "Definitely not so much now" },
      { value: 3, label: "Not at all" },
    ],
  },
  {
    id: "q2",
    text: "I have looked forward with enjoyment to things",
    options: [
      { value: 0, label: "As much as I ever did" },
      { value: 1, label: "Rather less than I used to" },
      { value: 2, label: "Definitely less than I used to" },
      { value: 3, label: "Hardly at all" },
    ],
  },
  {
    id: "q3",
    text: "I have blamed myself unnecessarily when things went wrong",
    reversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, some of the time" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, never" },
    ],
  },
  {
    id: "q4",
    text: "I have been anxious or worried for no good reason",
    reversed: true,
    options: [
      { value: 0, label: "No, not at all" },
      { value: 1, label: "Hardly ever" },
      { value: 2, label: "Yes, sometimes" },
      { value: 3, label: "Yes, very often" },
    ],
  },
  {
    id: "q5",
    text: "I have felt scared or panicky for no very good reason",
    reversed: true,
    options: [
      { value: 3, label: "Yes, quite a lot" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "No, not much" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: "q6",
    text: "Things have been getting on top of me",
    reversed: true,
    options: [
      { value: 3, label: "Yes, most of the time I haven't been able to cope at all" },
      { value: 2, label: "Yes, sometimes I haven't been coping as well as usual" },
      { value: 1, label: "No, most of the time I have coped quite well" },
      { value: 0, label: "No, I have been coping as well as ever" },
    ],
  },
  {
    id: "q7",
    text: "I have been so unhappy that I have had difficulty sleeping",
    reversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: "q8",
    text: "I have felt sad or miserable",
    reversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: "q9",
    text: "I have been so unhappy that I have been crying",
    reversed: true,
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Only occasionally" },
      { value: 0, label: "No, never" },
    ],
  },
  {
    id: "q10",
    text: "The thought of harming myself has occurred to me",
    isQ10: true,
    reversed: true,
    options: [
      { value: 3, label: "Yes, quite often" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Hardly ever" },
      { value: 0, label: "Never" },
    ],
  },
];

function epdsInterpretation(score) {
  if (score <= 8) return { label: "Low concern", color: "text-emerald-600" };
  if (score <= 11) return { label: "Possible depression — monitor closely", color: "text-yellow-600" };
  if (score <= 14) return { label: "Likely depression — discuss with your provider", color: "text-orange-600" };
  return { label: "High concern — seek support soon", color: "text-destructive" };
}

// Returns true if the entries array has an EPDS score for the given trimester
function hasEpdsForTrimester(entries = [], trimester) {
  if (!trimester || !entries.length) return false;
  return entries.some((e) => e.trimester === trimester && e.epds_score > 0);
}

export default function EpdsScale({ responses = {}, onComplete, isPostpartum, trimester, entries = [] }) {
  const [open, setOpen] = useState(false);

  const total = Object.values(responses).reduce((s, v) => s + (v || 0), 0);
  const answered = Object.keys(responses).length;
  const complete = answered === 10;
  const doneThisTrimester = isPostpartum ? true : hasEpdsForTrimester(entries, trimester);
  const q10val = responses["q10"];
  const showQ10Alert = q10val > 0;
  const interp = complete ? epdsInterpretation(total) : null;

  const handleChange = (qid, value) => {
    const next = { ...responses, [qid]: value };
    const nextTotal = Object.values(next).reduce((s, v) => s + (v || 0), 0);
    onComplete(nextTotal, next);
  };

  const trimesterLabel = trimester === "first" ? "1st" : trimester === "second" ? "2nd" : trimester === "third" ? "3rd" : null;
  const showNudge = !isPostpartum && trimester && !doneThisTrimester && !complete;

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden ${showNudge ? "border-pink-300 dark:border-pink-800" : "border-border/60"}`}>
      {showNudge && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-pink-50 dark:bg-pink-950/30 border-b border-pink-200 dark:border-pink-800">
          <Bell className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
          <p className="text-xs text-pink-700 dark:text-pink-300 font-medium leading-snug">
            ACOG recommends an EPDS screening each trimester. You haven't completed one this {trimesterLabel} trimester yet — tap below to start.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">EPDS — Edinburgh Postnatal Depression Scale</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold">
              {isPostpartum ? "Postpartum" : "Perinatal"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {complete ? `Score: ${total}/30 · ${epdsInterpretation(total).label}` : `${answered}/10 answered · Recommended by ACOG & PSI`}
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">How to use:</strong> Please choose the answer that comes closest to how you have felt <strong>in the past 7 days</strong>, not just how you feel today.
          </div>

          {EPDS_QUESTIONS.map((q, idx) => (
            <div key={q.id} className={`space-y-2 ${q.isQ10 ? "rounded-xl border border-destructive/20 bg-destructive/5 p-3" : ""}`}>
              <p className="text-xs font-semibold text-foreground leading-snug">
                <span className="text-muted-foreground mr-1">{idx + 1}.</span> {q.text}
                {q.isQ10 && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">Q10 — Self-harm</span>}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt) => {
                  const selected = responses[q.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleChange(q.id, opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs border-2 transition-all active:scale-[0.99] ${
                        selected
                          ? q.isQ10 && opt.value > 0
                            ? "bg-destructive/10 border-destructive text-destructive font-semibold"
                            : "bg-primary/10 border-primary text-primary font-semibold"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Q10 alert */}
          {showQ10Alert && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-destructive">Please reach out for support</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  If you're having thoughts of harming yourself, please call or text <strong>988</strong> (US) or <strong>116 123</strong> (UK Samaritans) now. You are not alone.
                </p>
              </div>
            </div>
          )}

          {/* Score summary */}
          {complete && interp && (
            <div className="rounded-xl bg-muted/50 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Total EPDS Score</span>
                <span className="text-xl font-bold">{total}<span className="text-xs text-muted-foreground font-normal">/30</span></span>
              </div>
              <p className={`text-xs font-semibold ${interp.color}`}>{interp.label}</p>
              <p className="text-[10px] text-muted-foreground">≥10: Consider further evaluation · ≥13: Likely depression · Q10 &gt;0: Always discuss with provider</p>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            © Cox JL et al. (1987). Edinburgh Postnatal Depression Scale. British Journal of Psychiatry, 150, 782–786. For clinical use only.
          </p>
        </div>
      )}
    </div>
  );
}