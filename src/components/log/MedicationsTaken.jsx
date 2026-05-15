import { useState } from "react";
import { X, Plus, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
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
  "Desipramine (Norpramin)",
  // MAOIs
  "Phenelzine (Nardil)",
  "Tranylcypromine (Parnate)",
  "Selegiline (Emsam)",
  // Other
  "Nefazodone (Serzone)",
  "Gepirone (Exxua)",
];

const MOOD_STABILIZERS = [
  "Lithium (Lithobid)",
  "Valproate (Depakote)",
  "Lamotrigine (Lamictal)",
  "Carbamazepine (Tegretol)",
  "Oxcarbazepine (Trileptal)",
  "Gabapentin (Neurontin)",
  "Topiramate (Topamax)",
];

const ANTIPSYCHOTICS = [
  // Atypical (2nd gen)
  "Aripiprazole (Abilify)",
  "Quetiapine (Seroquel)",
  "Olanzapine (Zyprexa)",
  "Risperidone (Risperdal)",
  "Lurasidone (Latuda)",
  "Ziprasidone (Geodon)",
  "Clozapine (Clozaril)",
  "Asenapine (Saphris)",
  "Iloperidone (Fanapt)",
  "Cariprazine (Vraylar)",
  "Brexpiprazole (Rexulti)",
  "Paliperidone (Invega)",
  // Typical (1st gen)
  "Haloperidol (Haldol)",
  "Chlorpromazine (Thorazine)",
  "Perphenazine (Trilafon)",
  "Fluphenazine (Prolixin)",
  "Thioridazine (Mellaril)",
];

const GLP1S = [
  "Semaglutide (Ozempic / Wegovy)",
  "Liraglutide (Victoza / Saxenda)",
  "Dulaglutide (Trulicity)",
  "Exenatide (Byetta / Bydureon)",
  "Tirzepatide (Mounjaro / Zepbound)",
  "Albiglutide (Tanzeum)",
  "Lixisenatide (Adlyxin)",
];

const SUGGESTED_MEDS = [
  "Prenatal Vitamin",
  "Antidepressant",
  "Mood Stabilizer",
  "Antipsychotic",
  "Metformin",
  "GLP-1",
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

const DROPDOWN_MEDS = ["Antidepressant", "Mood Stabilizer", "Antipsychotic", "GLP-1"];
const ALL_KNOWN_MEDS = [...SUGGESTED_MEDS, ...ANTIDEPRESSANTS, ...MOOD_STABILIZERS, ...ANTIPSYCHOTICS, ...GLP1S];

function SubList({ title, items, value, onToggle }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button key={item} onClick={() => onToggle(item)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all active:scale-95 ${
              value.includes(item) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MedicationsTaken({ value = [], onChange, previousDayMeds = [] }) {
  const [custom, setCustom] = useState("");
  const [showAntidepressants, setShowAntidepressants] = useState(false);
  const [showMoodStabilizers, setShowMoodStabilizers] = useState(false);
  const [showAntipsychotics, setShowAntipsychotics] = useState(false);
  const [showGlp1, setShowGlp1] = useState(false);

  const toggle = (med) => {
    if (value.includes(med)) onChange(value.filter((m) => m !== med));
    else onChange([...value, med]);
  };

  const copyFromPreviousDay = () => {
    if (!previousDayMeds.length) return;
    const merged = [...new Set([...value, ...previousDayMeds])];
    onChange(merged);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setCustom("");
  };

  const hasAnyAntidepressant = value.some((m) => ANTIDEPRESSANTS.includes(m));
  const hasAnyMoodStabilizer = value.some((m) => MOOD_STABILIZERS.includes(m));
  const hasAnyAntipsychotic = value.some((m) => ANTIPSYCHOTICS.includes(m));
  const hasAnyGlp1 = value.some((m) => GLP1S.includes(m));

  const customEntries = value.filter((m) => !ALL_KNOWN_MEDS.includes(m));
  const sublistSelected = value.filter((m) =>
    ANTIDEPRESSANTS.includes(m) || MOOD_STABILIZERS.includes(m) || ANTIPSYCHOTICS.includes(m) || GLP1S.includes(m)
  );

  return (
    <div className="space-y-3">

      {/* Continue from previous day */}
      {previousDayMeds.length > 0 && (
        <button
          onClick={copyFromPreviousDay}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Continue from previous day ({previousDayMeds.length} medication{previousDayMeds.length > 1 ? "s" : ""})
        </button>
      )}

      {/* Main buttons */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_MEDS.map((med) => {
          if (med === "Antidepressant") {
            return (
              <button key={med} onClick={() => setShowAntidepressants(p => !p)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 flex items-center gap-1 ${hasAnyAntidepressant ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
                Antidepressant {showAntidepressants ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            );
          }
          if (med === "Mood Stabilizer") {
            return (
              <button key={med} onClick={() => setShowMoodStabilizers(p => !p)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 flex items-center gap-1 ${hasAnyMoodStabilizer ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
                Mood Stabilizer {showMoodStabilizers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            );
          }
          if (med === "Antipsychotic") {
            return (
              <button key={med} onClick={() => setShowAntipsychotics(p => !p)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 flex items-center gap-1 ${hasAnyAntipsychotic ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
                Antipsychotic {showAntipsychotics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            );
          }
          if (med === "GLP-1") {
            return (
              <button key={med} onClick={() => setShowGlp1(p => !p)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 flex items-center gap-1 ${hasAnyGlp1 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
                GLP-1 {showGlp1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            );
          }
          return (
            <button key={med} onClick={() => toggle(med)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 ${value.includes(med) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
              {med}
            </button>
          );
        })}
      </div>

      {/* Sublists */}
      {showAntidepressants && <SubList title="Select antidepressant(s)" items={ANTIDEPRESSANTS} value={value} onToggle={toggle} />}
      {showMoodStabilizers && <SubList title="Select mood stabilizer(s)" items={MOOD_STABILIZERS} value={value} onToggle={toggle} />}
      {showAntipsychotics && <SubList title="Select antipsychotic(s)" items={ANTIPSYCHOTICS} value={value} onToggle={toggle} />}
      {showGlp1 && <SubList title="Select GLP-1 medication" items={GLP1S} value={value} onToggle={toggle} />}

      {/* Selected sublist items */}
      {sublistSelected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sublistSelected.map((med) => (
            <span key={med} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground">
              {med}
              <button onClick={() => toggle(med)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Custom entries */}
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
        <button onClick={addCustom} className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}