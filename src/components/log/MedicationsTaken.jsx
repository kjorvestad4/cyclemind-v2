import { useState } from "react";
import { X, Plus, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

const HORMONAL_BIRTH_CONTROLS = [
  // Combined oral
  "Combined Oral Contraceptive Pill (COC)",
  "Ethinyl Estradiol / Norethindrone (Loestrin)",
  "Ethinyl Estradiol / Levonorgestrel (Seasonique)",
  "Ethinyl Estradiol / Drospirenone (Yaz / Yasmin)",
  "Ethinyl Estradiol / Norgestimate (Ortho Tri-Cyclen)",
  // Progestin-only
  "Progestin-Only Pill (Mini-Pill)",
  "Norethindrone (Camila / Errin)",
  // IUDs
  "Hormonal IUD (Mirena / Kyleena / Liletta / Skyla)",
  // Injectables
  "Depo-Provera (Medroxyprogesterone injection)",
  // Implant
  "Nexplanon (Etonogestrel implant)",
  // Patch / Ring
  "Xulane (Contraceptive patch)",
  "NuvaRing (Etonogestrel / Ethinyl estradiol ring)",
  // Emergency
  "Plan B / Levonorgestrel (Emergency contraception)",
  "Ella (Ulipristal acetate)",
];

const HRTS = [
  // Estrogen-only
  "Estradiol patch (Vivelle-Dot / Climara)",
  "Estradiol gel (EstroGel / Divigel)",
  "Estradiol spray (Evamist)",
  "Oral Estradiol (Estrace)",
  "Conjugated Estrogens (Premarin)",
  // Combined E+P
  "Oral Estradiol / Norethindrone (Activella)",
  "Oral Conjugated Estrogens / Medroxyprogesterone (Prempro)",
  "Estradiol / Levonorgestrel patch (Climara Pro)",
  // Progesterone / Progestins
  "Oral Progesterone (Prometrium)",
  "Progesterone gel (Crinone / Prochieve)",
  "Medroxyprogesterone (Provera)",
  "Norethindrone acetate (Aygestin)",
  // Testosterone / DHEA / Tibolone
  "Testosterone (compounded cream / AndroGel)",
  "DHEA / Prasterone (Intrarosa)",
  "Tibolone (Livial)",
];

const NSAIDS = [
  // OTC
  "Ibuprofen (Advil / Motrin)",
  "Naproxen (Aleve)",
  "Aspirin",
  "Acetaminophen (Tylenol)",
  // Rx NSAIDs
  "Celecoxib (Celebrex)",
  "Meloxicam (Mobic)",
  "Diclofenac (Voltaren)",
  "Indomethacin (Indocin)",
  "Ketorolac (Toradol)",
  "Nabumetone (Relafen)",
  "Piroxicam (Feldene)",
  "Etodolac (Lodine)",
  // Prescription analgesics
  "Tramadol (Ultram)",
  "Cyclobenzaprine (Flexeril)",
];

const ANTIDEPRESSANTS = [
  "Sertraline (Zoloft)",
  "Fluoxetine (Prozac)",
  "Escitalopram (Lexapro)",
  "Citalopram (Celexa)",
  "Paroxetine (Paxil)",
  "Fluvoxamine (Luvox)",
  "Venlafaxine (Effexor)",
  "Desvenlafaxine (Pristiq)",
  "Duloxetine (Cymbalta)",
  "Levomilnacipran (Fetzima)",
  "Bupropion (Wellbutrin)",
  "Mirtazapine (Remeron)",
  "Trazodone (Desyrel)",
  "Vilazodone (Viibryd)",
  "Vortioxetine (Trintellix)",
  "Amitriptyline (Elavil)",
  "Nortriptyline (Pamelor)",
  "Imipramine (Tofranil)",
  "Clomipramine (Anafranil)",
  "Desipramine (Norpramin)",
  "Phenelzine (Nardil)",
  "Tranylcypromine (Parnate)",
  "Selegiline (Emsam)",
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

// New ordered list
const SUGGESTED_MEDS = [
  "Prenatal Vitamin",
  "Hormonal Birth Control",
  "Hormone Replacement Therapy",
  "NSAIDs/Pain Relief",
  "Antidepressant",
  "Mood Stabilizer",
  "Antipsychotic",
  "Metformin",
  "GLP-1",
  "Menopause Medications",
  "Calcium",
  "Vitamin B6",
  "Magnesium",
  "Vitamin D",
  "Melatonin",
  "Spironolactone",
  "Other Supplement",
];

const MENOPAUSE_MEDS = [
  // SSRIs/SNRIs for vasomotor (non-antidepressant use)
  "Paroxetine (Brisdelle) — for hot flashes",
  "Fezolinetant (Veozah) — non-hormonal hot flash treatment",
  // Vaginal estrogen (local, not systemic)
  "Vaginal Estradiol cream (Estrace cream)",
  "Vaginal Estradiol ring (Estring)",
  "Vaginal Estradiol tablet (Vagifem / Yuvafem)",
  "Ospemifene (Osphena) — for vaginal dryness/dyspareunia",
  "Prasterone / DHEA vaginal (Intrarosa)",
  // Bone health
  "Alendronate (Fosamax) — bisphosphonate",
  "Risedronate (Actonel) — bisphosphonate",
  "Ibandronate (Boniva) — bisphosphonate",
  "Zoledronic acid (Reclast) — bisphosphonate",
  "Denosumab (Prolia) — bone density",
  "Raloxifene (Evista) — SERM for bone/breast",
  // Cholesterol / cardiovascular
  "Statin (e.g. Atorvastatin / Rosuvastatin)",
  // Sleep
  "Zolpidem (Ambien)",
  "Eszopiclone (Lunesta)",
  "Suvorexant (Belsomra)",
  // Other
  "Clonidine — for hot flashes",
  "Gabapentin (Neurontin) — for hot flashes/sleep",
  "Black Cohosh supplement",
];

const ALL_KNOWN_MEDS = [
  ...SUGGESTED_MEDS,
  ...HORMONAL_BIRTH_CONTROLS,
  ...HRTS,
  ...NSAIDS,
  ...ANTIDEPRESSANTS,
  ...MOOD_STABILIZERS,
  ...ANTIPSYCHOTICS,
  ...GLP1S,
  ...MENOPAUSE_MEDS,
];

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
  const [showHBC, setShowHBC] = useState(false);
  const [showHRT, setShowHRT] = useState(false);
  const [showNSAIDs, setShowNSAIDs] = useState(false);
  const [showAntidepressants, setShowAntidepressants] = useState(false);
  const [showMoodStabilizers, setShowMoodStabilizers] = useState(false);
  const [showAntipsychotics, setShowAntipsychotics] = useState(false);
  const [showGlp1, setShowGlp1] = useState(false);
  const [showMenopause, setShowMenopause] = useState(false);

  const toggle = (med) => {
    if (value.includes(med)) onChange(value.filter((m) => m !== med));
    else onChange([...value, med]);
  };

  const copyFromPreviousDay = () => {
    if (!previousDayMeds.length) return;
    onChange([...new Set([...value, ...previousDayMeds])]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setCustom("");
  };

  const hasAnyHBC = value.some((m) => HORMONAL_BIRTH_CONTROLS.includes(m));
  const hasAnyHRT = value.some((m) => HRTS.includes(m));
  const hasAnyNSAID = value.some((m) => NSAIDS.includes(m));
  const hasAnyAntidepressant = value.some((m) => ANTIDEPRESSANTS.includes(m));
  const hasAnyMoodStabilizer = value.some((m) => MOOD_STABILIZERS.includes(m));
  const hasAnyAntipsychotic = value.some((m) => ANTIPSYCHOTICS.includes(m));
  const hasAnyGlp1 = value.some((m) => GLP1S.includes(m));
  const hasAnyMenopause = value.some((m) => MENOPAUSE_MEDS.includes(m));

  const customEntries = value.filter((m) => !ALL_KNOWN_MEDS.includes(m));
  const sublistSelected = value.filter((m) =>
    HORMONAL_BIRTH_CONTROLS.includes(m) || HRTS.includes(m) || NSAIDS.includes(m) ||
    HORMONAL_BIRTH_CONTROLS.includes(m) || HRTS.includes(m) || NSAIDS.includes(m) ||
    ANTIDEPRESSANTS.includes(m) || MOOD_STABILIZERS.includes(m) || ANTIPSYCHOTICS.includes(m) || GLP1S.includes(m) || MENOPAUSE_MEDS.includes(m)
  );

  const dropdownButton = (label, show, setShow, hasAny) => (
    <button key={label} onClick={() => setShow(p => !p)}
      className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 flex items-center gap-1 ${hasAny ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
      {label} {show ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
    </button>
  );

  return (
    <div className="space-y-3">

      {/* Continue from previous day */}
      {previousDayMeds.length > 0 && (
        <button onClick={copyFromPreviousDay}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-95">
          <RotateCcw className="w-3.5 h-3.5" />
          Continue from previous day ({previousDayMeds.length} medication{previousDayMeds.length > 1 ? "s" : ""})
        </button>
      )}

      {/* Main buttons */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_MEDS.map((med) => {
          if (med === "Hormonal Birth Control") return dropdownButton(med, showHBC, setShowHBC, hasAnyHBC);
          if (med === "Hormone Replacement Therapy") return dropdownButton(med, showHRT, setShowHRT, hasAnyHRT);
          if (med === "NSAIDs/Pain Relief") return dropdownButton(med, showNSAIDs, setShowNSAIDs, hasAnyNSAID);
          if (med === "Antidepressant") return dropdownButton(med, showAntidepressants, setShowAntidepressants, hasAnyAntidepressant);
          if (med === "Mood Stabilizer") return dropdownButton(med, showMoodStabilizers, setShowMoodStabilizers, hasAnyMoodStabilizer);
          if (med === "Antipsychotic") return dropdownButton(med, showAntipsychotics, setShowAntipsychotics, hasAnyAntipsychotic);
          if (med === "GLP-1") return dropdownButton(med, showGlp1, setShowGlp1, hasAnyGlp1);
          if (med === "Menopause Medications") return dropdownButton(med, showMenopause, setShowMenopause, hasAnyMenopause);
          return (
            <button key={med} onClick={() => toggle(med)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 ${value.includes(med) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
              {med}
            </button>
          );
        })}
      </div>

      {/* Sublists */}
      {showHBC && <SubList title="Select hormonal birth control" items={HORMONAL_BIRTH_CONTROLS} value={value} onToggle={toggle} />}
      {showHRT && <SubList title="Select hormone replacement therapy" items={HRTS} value={value} onToggle={toggle} />}
      {showNSAIDs && <SubList title="Select NSAID / pain relief" items={NSAIDS} value={value} onToggle={toggle} />}
      {showAntidepressants && <SubList title="Select antidepressant(s)" items={ANTIDEPRESSANTS} value={value} onToggle={toggle} />}
      {showMoodStabilizers && <SubList title="Select mood stabilizer(s)" items={MOOD_STABILIZERS} value={value} onToggle={toggle} />}
      {showAntipsychotics && <SubList title="Select antipsychotic(s)" items={ANTIPSYCHOTICS} value={value} onToggle={toggle} />}
      {showGlp1 && <SubList title="Select GLP-1 medication" items={GLP1S} value={value} onToggle={toggle} />}
      {showMenopause && <SubList title="Select menopause medication" items={MENOPAUSE_MEDS} value={value} onToggle={toggle} />}

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