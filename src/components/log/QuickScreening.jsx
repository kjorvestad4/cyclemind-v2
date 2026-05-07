import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const PHQ3 = [
  { key: "phq_interest", label: "Little interest or pleasure in doing things?" },
  { key: "phq_depressed", label: "Feeling down, depressed, or hopeless?" },
  { key: "phq_tired", label: "Feeling tired or having little energy?" },
];

const GAD3 = [
  { key: "gad_nervous", label: "Feeling nervous, anxious or on edge?" },
  { key: "gad_control", label: "Not being able to stop or control worrying?" },
  { key: "gad_worried", label: "Worrying too much about different things?" },
];

const OPTS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half" },
  { value: 3, label: "Nearly every day" },
];

function QuickScale({ questions, values, onChange }) {
  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <div key={q.key} className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">{q.label}</p>
          <div className="grid grid-cols-4 gap-1.5">
            {OPTS.map((o) => (
              <button
                key={o.value}
                onClick={() => onChange(q.key, values[q.key] === o.value ? null : o.value)}
                className={`py-2 rounded-xl text-[11px] font-medium border-2 transition-all active:scale-95 ${
                  values[q.key] === o.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuickScreening({ phq9Score, gad7Score, onPHQ9Change, onGAD7Change }) {
  const [open, setOpen] = useState(false);
  const [phqVals, setPhqVals] = useState({});
  const [gadVals, setGadVals] = useState({});

  const handlePHQ = (key, val) => {
    const updated = { ...phqVals, [key]: val };
    setPhqVals(updated);
    const total = Object.values(updated).reduce((a, b) => a + (b || 0), 0);
    onPHQ9Change(total);
  };

  const handleGAD = (key, val) => {
    const updated = { ...gadVals, [key]: val };
    setGadVals(updated);
    const total = Object.values(updated).reduce((a, b) => a + (b || 0), 0);
    onGAD7Change(total);
  };

  const phqTotal = Object.values(phqVals).reduce((a, b) => a + (b || 0), 0);
  const gadTotal = Object.values(gadVals).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Quick Mental Health Check</span>
          {(phqTotal > 0 || gadTotal > 0) && (
            <span className="text-xs text-muted-foreground">PHQ: {phqTotal} · GAD: {gadTotal}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-5">
          <p className="text-[11px] text-muted-foreground italic">Over the last 2 weeks, how often have you been bothered by...</p>
          <div>
            <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Depression (PHQ-3)</p>
            <QuickScale questions={PHQ3} values={phqVals} onChange={handlePHQ} />
            {phqTotal >= 5 && (
              <p className="text-[10px] text-amber-600 mt-2">⚠ Score {phqTotal}/9 — consider speaking with a healthcare provider.</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Anxiety (GAD-3)</p>
            <QuickScale questions={GAD3} values={gadVals} onChange={handleGAD} />
            {gadTotal >= 5 && (
              <p className="text-[10px] text-amber-600 mt-2">⚠ Score {gadTotal}/9 — consider speaking with a healthcare provider.</p>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">These are screening tools only, not a diagnosis. Always consult a licensed professional.</p>
        </div>
      )}
    </div>
  );
}