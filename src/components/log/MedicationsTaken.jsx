import { useState } from "react";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const ANTIDEPRESSANTS = [
  // SSRIs
  "Sertraline (Zoloft)",
  "Fluoxetine (Prozac)",
  "Escitalopram (Lexapro)",
  "Citalopram (Celexa)",
  "Paroxetine (Paxil)",
  "Fluvoxamine (Luvox)",
  // SNRIs
  "Venlafaxine (Effexor)",
  "Desvenlafaxine (Pristiq)",
  "Duloxetine (Cymbalta)",
  "Levomilnacipran (Fetzima)",
  // Atypicals
  "Bupropion (Wellbutrin)",
  "Mirtazapine (Remeron)",
  "Trazodone (Desyrel)",
  "Vilazodone (Viibryd)",
  "Vortioxetine (Trintellix)",
  // TCAs
  "Amitriptyline (Elavil)",
  "Nortriptyline (Pamelor)",
  "Imipramine (Tofranil)",
  "Clomipramine (Anafranil)",
  // MAOIs
  "Phenelzine (Nardil)",
  "Tranylcypromine (Parnate)",
  "Selegiline (Emsam)",
];

const SUGGESTED_MEDS = [
  "Prenatal Vitamin",
  "Antidepressant",
  "Hormonal Birth Control",
  "Hormone Replacement Therapy",
  "NSAIDs/Pain Relief",
  "Calcium",
  "Vitamin B6",
  "Magnesium",
  "Vitamin D",
  "Melatonin",
  "Spironolactone",
  "Other Supplement",
];

export default function MedicationsTaken({ value = [], onChange }) {
  const [custom, setCustom] = useState("");
  const [showAntidepressants, setShowAntidepressants] = useState(false);

  const toggle = (med) => {
    if (value.includes(med)) {
      onChange(value.filter((m) => m !== med));
    } else {
      onChange([...value, med]);
    }
  };

  const hasAnyAntidepressant = value.some((m) => ANTIDEPRESSANTS.includes(m));

  const handleAntidepressantClick = () => {
    setShowAntidepressants((prev) => !prev);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setCustom("");
  };

  const allKnownMeds = [...SUGGESTED_MEDS, ...ANTIDEPRESSANTS];
  const customEntries = value.filter((m) => !allKnownMeds.includes(m));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_MEDS.map((med) => {
          if (med === "Antidepressant") {
            return (
              <button
                key={med}
                onClick={handleAntidepressantClick}
                className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 flex items-center gap-1 ${
                  hasAnyAntidepressant
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Antidepressant
                {showAntidepressants ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            );
          }
          return (
            <button
              key={med}
              onClick={() => toggle(med)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 ${
                value.includes(med)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {med}
            </button>
          );
        })}
      </div>

      {/* Antidepressant sublist */}
      {showAntidepressants && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Select antidepressant(s)</p>
          <div className="flex flex-wrap gap-1.5">
            {ANTIDEPRESSANTS.map((ad) => (
              <button
                key={ad}
                onClick={() => toggle(ad)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all active:scale-95 ${
                  value.includes(ad)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {ad}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected antidepressants summary */}
      {value.filter((m) => ANTIDEPRESSANTS.includes(m)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.filter((m) => ANTIDEPRESSANTS.includes(m)).map((med) => (
            <span key={med} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground">
              {med}
              <button onClick={() => toggle(med)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {customEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customEntries.map((med) => (
            <span key={med} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground">
              {med}
              <button onClick={() => toggle(med)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Add custom medication..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          className="h-10 text-sm"
        />
        <button
          onClick={addCustom}
          className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}