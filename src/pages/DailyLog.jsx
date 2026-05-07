import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Check, Trash2, Mic, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SymptomGrid from "@/components/log/SymptomGrid";
import BleedingPicker from "@/components/log/BleedingPicker";
import MedicationsTaken from "@/components/log/MedicationsTaken";
import CustomSymptoms from "@/components/log/CustomSymptoms";
import QuickScreening from "@/components/log/QuickScreening";
import { SYMPTOM_CATEGORIES, ALL_SYMPTOMS, getCycleDay, calculateDayTotal } from "@/lib/symptoms";

const PHASE_LABELS = {
  menstrual: { label: "Menstrual", color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  follicular: { label: "Follicular", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  ovulatory: { label: "Ovulatory", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  luteal: { label: "Luteal", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
};

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-semibold">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function DailyLog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const initialDate = urlParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [scores, setScores] = useState({});
  const [flow, setFlow] = useState("");
  const [bleedingIntensity, setBleedingIntensity] = useState(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [medications, setMedications] = useState([]);
  const [customSymptoms, setCustomSymptoms] = useState([]);
  const [phq9Score, setPhq9Score] = useState(0);
  const [gad7Score, setGad7Score] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-start_date", 50),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.DailyEntry.list("-date", 200),
  });

  const existingEntry = entries.find((e) => e.date === selectedDate);
  const cycleDay = getCycleDay(selectedDate, cycles);

  const latestCycle = cycles.length > 0
    ? [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
    : null;
  const currentPhase = latestCycle?.phase || (cycleDay
    ? (cycleDay <= 5 ? "menstrual" : cycleDay <= 13 ? "follicular" : cycleDay === 14 ? "ovulatory" : "luteal")
    : null);
  const phaseInfo = currentPhase ? PHASE_LABELS[currentPhase] : null;

  useEffect(() => {
    if (existingEntry) {
      const newScores = {};
      ALL_SYMPTOMS.forEach((s) => {
        if (existingEntry[s.key]) newScores[s.key] = existingEntry[s.key];
      });
      setScores(newScores);
      setFlow(existingEntry.menstrual_flow || "");
      setBleedingIntensity(existingEntry.bleeding_intensity ?? null);
      setJournalEntry(existingEntry.journal_entry || existingEntry.notes || "");
      setMedications(existingEntry.medications_taken || []);
      setCustomSymptoms(existingEntry.custom_symptoms || []);
      setPhq9Score(existingEntry.phq9_score || 0);
      setGad7Score(existingEntry.gad7_score || 0);
    } else {
      setScores({});
      setFlow("");
      setBleedingIntensity(null);
      setJournalEntry("");
      setMedications([]);
      setCustomSymptoms([]);
      setPhq9Score(0);
      setGad7Score(0);
    }
    setHasUnsavedChanges(false);
  }, [selectedDate, existingEntry?.id]);

  const handleScoreChange = useCallback((key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const parseLocalDate = (str) => { const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };

  const buildPayload = () => {
    const data = {
      date: selectedDate,
      cycle_day: cycleDay || undefined,
      menstrual_flow: flow || undefined,
      bleeding_intensity: bleedingIntensity ?? undefined,
      journal_entry: journalEntry || undefined,
      medications_taken: medications.length ? medications : undefined,
      custom_symptoms: customSymptoms.length ? customSymptoms : undefined,
      phq9_score: phq9Score || undefined,
      gad7_score: gad7Score || undefined,
    };
    ALL_SYMPTOMS.forEach((s) => { data[s.key] = scores[s.key] || 0; });
    return data;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = buildPayload();
      if (existingEntry) {
        await base44.entities.DailyEntry.update(existingEntry.id, data);
      } else {
        await base44.entities.DailyEntry.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setHasUnsavedChanges(false);
      toast.success("Entry saved! 💜");
    },
  });

  const saveTomorrowMutation = useMutation({
    mutationFn: async () => {
      const data = buildPayload();
      if (existingEntry) {
        await base44.entities.DailyEntry.update(existingEntry.id, data);
      } else {
        await base44.entities.DailyEntry.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setHasUnsavedChanges(false);
      toast.success("Saved! See you tomorrow 🌙");
      const tomorrow = format(addDays(parseLocalDate(selectedDate), 1), "yyyy-MM-dd");
      setSelectedDate(tomorrow);
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => { await base44.entities.DailyEntry.delete(existingEntry.id); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setScores({}); setFlow(""); setBleedingIntensity(null); setJournalEntry("");
      setMedications([]); setCustomSymptoms([]); setHasUnsavedChanges(false);
      toast.success("Entry cleared.");
    },
  });

  const changeDate = (dir) => {
    const d = dir === "prev" ? subDays(parseLocalDate(selectedDate), 1) : addDays(parseLocalDate(selectedDate), 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  const filledCount = ALL_SYMPTOMS.filter((s) => scores[s.key] > 0).length;
  const totalScore = calculateDayTotal({ ...scores });
  const progress = Math.round((filledCount / ALL_SYMPTOMS.length) * 100);

  return (
    <div className="space-y-5 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => changeDate("prev")}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="text-lg font-bold">{format(parseLocalDate(selectedDate), "EEE, MMM d")}</p>
          <div className="flex items-center justify-center gap-2 mt-0.5 flex-wrap">
            {cycleDay && <span className="text-xs text-muted-foreground font-medium">Cycle Day {cycleDay}</span>}
            {phaseInfo && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${phaseInfo.color}`}>
                {phaseInfo.label}
              </span>
            )}
            {latestCycle?.is_pregnancy_mode && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-pink-100 text-pink-700">🤰 Pregnancy</span>
            )}
            {latestCycle?.is_menopause_mode && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-700">🔥 Menopause</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => changeDate("next")}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-2xl border border-border/50 p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{filledCount}/{ALL_SYMPTOMS.length} symptoms rated</span>
          <span className="font-bold text-foreground">Score: {totalScore}/{ALL_SYMPTOMS.length * 6}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground italic text-center">Rate how you felt today — be honest, there are no wrong answers.</p>
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">DRSP Symptoms · 1 = Not at all · 6 = Extreme</p>
        <SymptomGrid categories={SYMPTOM_CATEGORIES} scores={scores} onChange={handleScoreChange} />
      </div>

      {/* Bleeding */}
      <Section title="Bleeding & Flow" defaultOpen={true}>
        <div className="pt-1">
          <BleedingPicker value={bleedingIntensity} onChange={(v) => { setBleedingIntensity(v); setHasUnsavedChanges(true); }} />
        </div>
      </Section>

      {/* Mental Health Screening */}
      <QuickScreening
        phq9Score={phq9Score}
        gad7Score={gad7Score}
        onPHQ9Change={(v) => { setPhq9Score(v); setHasUnsavedChanges(true); }}
        onGAD7Change={(v) => { setGad7Score(v); setHasUnsavedChanges(true); }}
      />

      {/* Medications */}
      <Section title="Medications Taken Today">
        <div className="pt-1">
          <MedicationsTaken value={medications} onChange={(v) => { setMedications(v); setHasUnsavedChanges(true); }} />
        </div>
      </Section>

      {/* Custom Symptoms */}
      <Section title="Custom Symptoms">
        <div className="pt-1">
          <CustomSymptoms value={customSymptoms} onChange={(v) => { setCustomSymptoms(v); setHasUnsavedChanges(true); }} />
        </div>
      </Section>

      {/* Journal */}
      <Section title="Journal Entry">
        <div className="pt-1 space-y-3">
          <Textarea
            placeholder="How are you feeling today? Any patterns, triggers, or observations..."
            value={journalEntry}
            onChange={(e) => { setJournalEntry(e.target.value); setHasUnsavedChanges(true); }}
            className="min-h-[120px] resize-none text-sm"
          />
          <button
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => toast.info("Voice input coming soon!")}
          >
            <Mic className="w-4 h-4" /> Voice input (coming soon)
          </button>
        </div>
      </Section>

      {/* Save Buttons */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 max-w-lg mx-auto space-y-2">
        <div className="flex gap-2">
          {existingEntry && (
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex-1 h-12 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 text-base"
          >
            {saveMutation.isPending
              ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              : hasUnsavedChanges ? <Save className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            {hasUnsavedChanges ? "Save Daily Entry" : "Saved ✓"}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => saveTomorrowMutation.mutate()}
          disabled={saveTomorrowMutation.isPending}
          className="w-full h-11 rounded-2xl font-medium text-sm bg-card"
        >
          Save & Continue Tomorrow →
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center pb-2">
        CycleMind is not a substitute for professional medical advice. Consult your doctor.
      </p>
    </div>
  );
}