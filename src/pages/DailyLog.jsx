import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, addDays, differenceInDays } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Check, Trash2, Mic, ChevronDown, ChevronUp, Settings, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { canAccessMode, canAccessScale, getUserTier, TIERS } from "@/lib/freemium";
import UpgradeBanner from "@/components/common/UpgradeBanner";
import PremiumBanner from "@/components/common/PremiumBanner";
import SymptomGrid from "@/components/log/SymptomGrid";
import BleedingPicker from "@/components/log/BleedingPicker";
import MedicationsTaken from "@/components/log/MedicationsTaken";
import CustomSymptoms from "@/components/log/CustomSymptoms";
import MoodScales from "@/components/log/MoodScales";
import EpdsScale from "@/components/log/EpdsScale";
import OvulationTracking from "@/components/log/OvulationTracking";
import PregnancySymptoms from "@/components/log/PregnancySymptoms";
import MenopauseSymptoms from "@/components/log/MenopauseSymptoms";
import PostpartumSymptoms, { PP_SYMPTOM_KEYS } from "@/components/log/PostpartumSymptoms";
import VitalsTracking from "@/components/log/VitalsTracking";
import QuickModeSwitcher from "@/components/log/QuickModeSwitcher";
import QuickLogButtons from "@/components/log/QuickLogButtons";
import CalendarPopup from "@/components/dashboard/CalendarPopup";
import EDDDisplay from "@/components/pregnancy/EDDDisplay";
import { SYMPTOM_CATEGORIES, ALL_SYMPTOMS, getCycleDay, calculateDayTotal } from "@/lib/symptoms";
import { calculateEDD } from "@/lib/eddCalculation";

const PREG_SYMPTOM_KEYS = ["p_nausea","p_vomiting","p_fatigue","p_mood_changes","p_sleep_issues","p_back_pain","p_braxton_hicks","p_heartburn","p_swelling","p_breast_changes"];
const MENO_SYMPTOM_KEYS = ["m_hot_flashes","m_night_sweats","m_vaginal_dryness","m_mood_swings","m_brain_fog","m_joint_pain","m_sleep_disturbance","m_fatigue","m_anxiety","m_depression","m_libido_changes","m_urinary_symptoms"];

const PHASE_LABELS = {
  menstrual: { label: "Menstrual", color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  follicular: { label: "Follicular", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  ovulatory: { label: "Ovulatory", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  luteal: { label: "Luteal", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
};

const CYCLE_TYPE_BADGES = {
  pregnancy: { label: "🤰 Pregnancy", color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" },
  postpartum: { label: "🍼 Postpartum", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  perimenopause: { label: "🌊 Perimenopause", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  menopause: { label: "🔥 Menopause", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
};

function getTrimester(week) {
  if (!week) return null;
  if (week <= 12) return "first";
  if (week <= 27) return "second";
  return "third";
}

function Section({ title, subtitle, children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
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

export default function DailyLog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const initialDate = urlParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [scores, setScores] = useState({});
  const [flow, setFlow] = useState("");
  const [bleedingIntensity, setBleedingIntensity] = useState(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [medications, setMedications] = useState([]);
  const [customSymptoms, setCustomSymptoms] = useState([]);
  const [phq9Score, setPhq9Score] = useState(0);
  const [gad7Score, setGad7Score] = useState(0);
  const [phq9Responses, setPhq9Responses] = useState({});
  const [gad7Responses, setGad7Responses] = useState({});
  const [epdsScore, setEpdsScore] = useState(0);
  const [epdsResponses, setEpdsResponses] = useState({});
  const [fetalMovementFelt, setFetalMovementFelt] = useState(false);
  const [fetalMovementCount, setFetalMovementCount] = useState(0);
  const [ovulationTest, setOvulationTest] = useState("");
  const [ovulationDate, setOvulationDate] = useState("");
  const [cervicalMucus, setCervicalMucus] = useState("");
  const [intimacyLogged, setIntimacyLogged] = useState(false);
  const [vitals, setVitals] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Cycle.filter({ created_by: user.email }, "-start_date", 50);
    },
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 200);
    },
  });

  const existingEntry = entries.find((e) => e.date === selectedDate);
  const cycleDay = getCycleDay(selectedDate, cycles);

  const latestCycle = cycles.length > 0
    ? [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
    : null;

  const cycleType = latestCycle?.cycle_type
    || (latestCycle?.is_pregnancy_mode ? "pregnancy" : latestCycle?.is_menopause_mode ? "menopause" : "menstrual");

  const isPregnancy = cycleType === "pregnancy";
  const isPostpartum = cycleType === "postpartum";
  const isPerinatal = isPregnancy || isPostpartum;
  const isMenopause = cycleType === "menopause" || cycleType === "perimenopause";
  const isMenstrual = !isPerinatal && !isMenopause;

  const pregnancyWeek = latestCycle?.pregnancy_week
    || (latestCycle?.last_menstrual_period
      ? Math.floor(differenceInDays(new Date(selectedDate), new Date(latestCycle.last_menstrual_period)) / 7)
      : null);
  const trimester = cycleType === "postpartum" ? "postpartum" : getTrimester(pregnancyWeek);

  const currentPhase = latestCycle?.phase || (cycleDay
    ? (cycleDay <= 5 ? "menstrual" : cycleDay <= 13 ? "follicular" : cycleDay === 14 ? "ovulatory" : "luteal")
    : null);
  const phaseInfo = isMenstrual && currentPhase ? PHASE_LABELS[currentPhase] : null;
  const cycleBadge = isPostpartum ? null : CYCLE_TYPE_BADGES[cycleType];

  useEffect(() => {
    if (existingEntry) {
      const newScores = {};
      ALL_SYMPTOMS.forEach((s) => { if (existingEntry[s.key]) newScores[s.key] = existingEntry[s.key]; });
      PREG_SYMPTOM_KEYS.forEach((k) => { if (existingEntry[k]) newScores[k] = existingEntry[k]; });
      PP_SYMPTOM_KEYS.forEach((k) => { if (existingEntry[k]) newScores[k] = existingEntry[k]; });
      MENO_SYMPTOM_KEYS.forEach((k) => { if (existingEntry[k]) newScores[k] = existingEntry[k]; });
      setScores(newScores);
      setFlow(existingEntry.menstrual_flow || "");
      setBleedingIntensity(existingEntry.bleeding_intensity ?? null);
      setJournalEntry(existingEntry.journal_entry || existingEntry.notes || "");
      setMedications(existingEntry.medications_taken || []);
      setCustomSymptoms(existingEntry.custom_symptoms || []);
      setPhq9Score(existingEntry.phq9_score || 0);
      setGad7Score(existingEntry.gad7_score || 0);
      setPhq9Responses(existingEntry.phq9_responses || {});
      setGad7Responses(existingEntry.gad7_responses || {});
      setEpdsScore(existingEntry.epds_score || 0);
      setEpdsResponses(existingEntry.epds_responses || {});
      setFetalMovementFelt(existingEntry.fetal_movement_felt || false);
      setFetalMovementCount(existingEntry.fetal_movement_count || 0);
      setIntimacyLogged(existingEntry.intimacy_logged || false);
      setVitals({
        heart_rate: existingEntry.heart_rate || "",
        systolic_bp: existingEntry.systolic_bp || "",
        diastolic_bp: existingEntry.diastolic_bp || "",
        respiratory_rate: existingEntry.respiratory_rate || "",
        basal_body_temp: existingEntry.basal_body_temp || "",
        weight: existingEntry.weight || "",
        height: existingEntry.height || "",
      });
    } else {
      setScores({});
      setFlow(""); setBleedingIntensity(null); setJournalEntry("");
      setMedications([]); setCustomSymptoms([]);
      setPhq9Score(0); setGad7Score(0); setPhq9Responses({}); setGad7Responses({});
      setEpdsScore(0); setEpdsResponses({});
      setFetalMovementFelt(false); setFetalMovementCount(0);
      setOvulationTest(""); setOvulationDate(""); setCervicalMucus("");
      setIntimacyLogged(false);
      setVitals({});
    }
    setHasUnsavedChanges(false);
  }, [selectedDate, existingEntry?.id]);

  // Auto-save: debounce 3s after any change
  const scheduleAutoSave = useCallback(() => {
    setAutoSaveTimer((prev) => {
      if (prev) clearTimeout(prev);
      return setTimeout(() => {
        // saveMutation.mutate() called via ref to avoid stale closure
        setAutoSaveTimer(null);
      }, 3000);
    });
  }, []);

  const handleScoreChange = useCallback((key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleFetalChange = useCallback((field, value) => {
    if (field === "felt") setFetalMovementFelt(value);
    else setFetalMovementCount(value);
    setHasUnsavedChanges(true);
  }, []);

  const handleOvulationChange = useCallback((field, value) => {
    if (field === "ovulation_test") setOvulationTest(value);
    else if (field === "ovulation_date") setOvulationDate(value);
    else if (field === "cervical_mucus") setCervicalMucus(value);
    setHasUnsavedChanges(true);
  }, []);

  const parseLocalDate = (str) => { const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };

  const buildPayload = () => {
    const data = {
      date: selectedDate,
      cycle_id: latestCycle?.id || undefined,
      cycle_day: cycleDay || undefined,
      cycle_type: cycleType,
      trimester: trimester || undefined,
      pregnancy_week: pregnancyWeek || undefined,
      menstrual_flow: flow || undefined,
      bleeding_intensity: bleedingIntensity ?? undefined,
      journal_entry: journalEntry || undefined,
      medications_taken: medications.length ? medications : undefined,
      custom_symptoms: customSymptoms.length ? customSymptoms : undefined,
      phq9_score: phq9Score || undefined,
      phq9_responses: Object.keys(phq9Responses).length ? phq9Responses : undefined,
      gad7_score: gad7Score || undefined,
      gad7_responses: Object.keys(gad7Responses).length ? gad7Responses : undefined,
      epds_score: epdsScore || undefined,
      epds_responses: Object.keys(epdsResponses).length ? epdsResponses : undefined,
      fetal_movement_felt: isPregnancy ? fetalMovementFelt : undefined,
      fetal_movement_count: isPregnancy && fetalMovementFelt ? fetalMovementCount : undefined,
      ovulation_test: (isMenstrual || cycleType === "perimenopause") ? ovulationTest || undefined : undefined,
      ovulation_date: (isMenstrual || cycleType === "perimenopause") ? ovulationDate || undefined : undefined,
      cervical_mucus: (isMenstrual || cycleType === "perimenopause") ? cervicalMucus || undefined : undefined,
      intimacy_logged: (isMenstrual || cycleType === "perimenopause") ? intimacyLogged : undefined,
      heart_rate: vitals.heart_rate || undefined,
      systolic_bp: vitals.systolic_bp || undefined,
      diastolic_bp: vitals.diastolic_bp || undefined,
      respiratory_rate: vitals.respiratory_rate || undefined,
      basal_body_temp: vitals.basal_body_temp || undefined,
      weight: vitals.weight || undefined,
      height: vitals.height || undefined,
      // isPostpartum uses pp_* keys (populated below via PP_SYMPTOM_KEYS loop)
    };
    ALL_SYMPTOMS.forEach((s) => { data[s.key] = scores[s.key] || 0; });
    PREG_SYMPTOM_KEYS.forEach((k) => { data[k] = scores[k] || 0; });
    PP_SYMPTOM_KEYS.forEach((k) => { data[k] = scores[k] || 0; });
    MENO_SYMPTOM_KEYS.forEach((k) => { data[k] = scores[k] || 0; });
    return data;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = buildPayload();
      if (existingEntry) await base44.entities.DailyEntry.update(existingEntry.id, data);
      else await base44.entities.DailyEntry.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      setHasUnsavedChanges(false);
      toast.success("Entry saved! 💜");
    },
  });

  const saveTomorrowMutation = useMutation({
    mutationFn: async () => {
      const data = buildPayload();
      if (existingEntry) await base44.entities.DailyEntry.update(existingEntry.id, data);
      else await base44.entities.DailyEntry.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      setHasUnsavedChanges(false);
      toast.success("Saved! See you tomorrow 🌙");
      setSelectedDate(format(addDays(parseLocalDate(selectedDate), 1), "yyyy-MM-dd"));
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

  const activeKeys = isPregnancy ? PREG_SYMPTOM_KEYS : isPostpartum ? PP_SYMPTOM_KEYS : isMenopause ? MENO_SYMPTOM_KEYS : ALL_SYMPTOMS.map(s => s.key);
  const filledCount = activeKeys.filter((k) => (scores[k] || 0) > 0).length;
  const totalScore = isMenstrual ? calculateDayTotal({ ...scores }) : activeKeys.reduce((s, k) => s + (scores[k] || 0), 0);
  const maxScore = activeKeys.length * 6;
  const progress = activeKeys.length > 0 ? Math.round((filledCount / activeKeys.length) * 100) : 0;

  return (
    <>
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        entries={entries}
        cycles={cycles}
        cycleType={cycleType}
        cycleLength={user?.cycle_length}
        ovulationDay={user?.ovulation_day}
        menstruationLength={user?.menstruation_length}
      />
    <div className="space-y-5 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => changeDate("prev")}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => setShowCalendar(true)}>
          <CalendarIcon className="w-5 h-5 text-primary" />
        </Button>
        <div className="text-center flex-1">
          <p className="text-lg font-bold">{format(parseLocalDate(selectedDate), "EEE, MMM d")}</p>
          <div className="flex items-center justify-center gap-2 mt-0.5 flex-wrap">
            {isMenstrual && cycleDay && (
              <span className="text-xs text-muted-foreground font-medium">Cycle Day {cycleDay}</span>
            )}
            {phaseInfo && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${phaseInfo.color}`}>
                {phaseInfo.label}
              </span>
            )}
            {cycleBadge && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${cycleBadge.color}`}>
                {cycleBadge.label}
              </span>
            )}
            {isPregnancy && pregnancyWeek && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300">
                Week {pregnancyWeek}{trimester ? ` · ${trimester.charAt(0).toUpperCase() + trimester.slice(1)}` : ""}
              </span>
            )}
            {isPostpartum && latestCycle?.start_date && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
                    Day {Math.max(1, Math.floor((new Date(selectedDate) - new Date(latestCycle.start_date)) / 86400000) + 1)}
                  </span>
                )}
              </div>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => changeDate("next")}>
              <ChevronRight className="w-5 h-5" />
              </Button>
              </div>

      {/* Mode Banner */}
      <div className={`rounded-2xl border-2 p-3.5 flex items-center justify-between gap-3 ${
        isPregnancy ? "border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950/30" :
        isPostpartum ? "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30" :
        isMenopause ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30" :
        "border-primary/20 bg-primary/5"
      }`}>
        <div>
          <p className="text-sm font-bold text-foreground">
            {isPostpartum && `🍼 Postpartum${latestCycle?.start_date ? ` · Day ${Math.max(1, Math.floor((new Date(selectedDate) - new Date(latestCycle.start_date)) / 86400000) + 1)}` : " Mode"}`}
            {isPregnancy && `🤰 Pregnancy${pregnancyWeek ? ` · Week ${pregnancyWeek}` : " Mode"}`}
            {isMenopause && cycleType === "perimenopause" && "🌊 Perimenopause Mode"}
            {isMenopause && cycleType === "menopause" && "🔥 Menopause Mode"}
            {isMenstrual && "🌙 Menstrual / PMDD Tracking"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isPregnancy && trimester && `${trimester.charAt(0).toUpperCase() + trimester.slice(1)} trimester${latestCycle?.estimated_due_date ? ` · Due ${format(new Date(latestCycle.estimated_due_date), "MMM d, yyyy")}` : ""}`}
            {isPostpartum && "Track recovery, mood, and postpartum wellbeing"}
            {isMenopause && latestCycle?.hrt_type && `HRT: ${latestCycle.hrt_type}`}
            {isMenstrual && cycleDay && `Cycle day ${cycleDay}${phaseInfo ? ` · ${phaseInfo.label} phase` : ""}`}
            {!isPerinatal && !isMenopause && !cycleDay && "Log your symptoms below"}
          </p>
        </div>
        <button
          onClick={() => setShowModeSwitcher(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
          Switch Mode
        </button>
      </div>

      {showModeSwitcher && (
       <QuickModeSwitcher
         currentCycleType={cycleType}
         latestCycle={latestCycle}
         onClose={() => setShowModeSwitcher(false)}
       />
      )}

      {/* Progress Bar */}
      <div className="bg-card rounded-2xl border border-border/50 p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{filledCount}/{activeKeys.length} symptoms rated</span>
          <span className="font-bold text-foreground">Score: {totalScore}/{maxScore}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground italic text-center">Rate how you felt today — be honest, there are no wrong answers.</p>
      </div>

      {/* Quick Log Buttons */}
      <QuickLogButtons
        selectedDate={selectedDate}
        existingEntry={existingEntry}
        cycleType={cycleType}
      />

      {/* Upgrade Banner for Restricted Mode */}
      {!canAccessMode(user, cycleType) && (
        <UpgradeBanner feature={`${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)} Tracking`} />
      )}

      {/* Premium Banner for Free Users */}
      {user && getUserTier(user) === TIERS.FREE && (
        <PremiumBanner />
      )}

      {/* MENSTRUAL MODE */}
      {isMenstrual && (
        <>
          <Section title="Bleeding & Flow" defaultOpen={true}>
            <div className="pt-1">
              <BleedingPicker value={bleedingIntensity} onChange={(v) => { setBleedingIntensity(v); setHasUnsavedChanges(true); }} />
            </div>
          </Section>
          <OvulationTracking
            ovulationTest={ovulationTest}
            ovulationDate={ovulationDate}
            cervicalMucus={cervicalMucus}
            onChange={handleOvulationChange}
          />
          {canAccessScale(user, "drsp") ? (
            <>
              <Section title="DRSP Symptoms" subtitle="PMDD symptom tracker · 1 = Not at all · 6 = Extreme" defaultOpen={true}>
                <div className="pt-2">
                  <SymptomGrid categories={SYMPTOM_CATEGORIES} scores={scores} onChange={handleScoreChange} />
                </div>
              </Section>
              <MoodScales
                phq9Responses={phq9Responses}
                gad7Responses={gad7Responses}
                onPHQ9Change={(total, responses) => { setPhq9Score(total); setPhq9Responses(responses); setHasUnsavedChanges(true); }}
                onGAD7Change={(total, responses) => { setGad7Score(total); setGad7Responses(responses); setHasUnsavedChanges(true); }}
              />
            </>
          ) : (
            <UpgradeBanner feature="Full DRSP & Mental Health Scales" />
          )}
        </>
      )}

      {/* PREGNANCY MODE */}
      {isPregnancy && (
        <>
          <EDDDisplay
            lmp={latestCycle?.last_menstrual_period}
            ovulationDate={latestCycle?.ovulation_date}
            estimatedDueDate={latestCycle?.estimated_due_date}
            pregnancyWeek={pregnancyWeek}
          />
          <Section
            title="Pregnancy Symptoms"
            subtitle={trimester ? `${trimester.charAt(0).toUpperCase() + trimester.slice(1)} trimester${pregnancyWeek ? ` · Week ${pregnancyWeek}` : ""}` : undefined}
            defaultOpen={true}
            badge={trimester ? trimester.charAt(0).toUpperCase() + trimester.slice(1) : undefined}
          >
            <div className="pt-2">
              <PregnancySymptoms
                scores={scores}
                onChange={handleScoreChange}
                trimester={trimester}
                pregnancyWeek={pregnancyWeek}
                fetalMovementFelt={fetalMovementFelt}
                fetalMovementCount={fetalMovementCount}
                onFetalChange={handleFetalChange}
              />
            </div>
          </Section>
          <EpdsScale
            responses={epdsResponses}
            isPostpartum={false}
            onComplete={(total, responses) => { setEpdsScore(total); setEpdsResponses(responses); setHasUnsavedChanges(true); }}
          />
          <MoodScales
            phq9Responses={phq9Responses}
            gad7Responses={gad7Responses}
            hidePhq9={true}
            onPHQ9Change={(total, responses) => { setPhq9Score(total); setPhq9Responses(responses); setHasUnsavedChanges(true); }}
            onGAD7Change={(total, responses) => { setGad7Score(total); setGad7Responses(responses); setHasUnsavedChanges(true); }}
          />
          <Section title="Spotting / Bleeding" subtitle="Note any spotting — always inform your healthcare provider if unexpected">
            <div className="pt-1">
              <BleedingPicker value={bleedingIntensity} onChange={(v) => { setBleedingIntensity(v); setHasUnsavedChanges(true); }} />
            </div>
          </Section>
          <Section title="DRSP Mood & Symptom Tracking" subtitle="Optional — track emotional wellbeing alongside pregnancy symptoms">
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground">Prenatal mood tracking can be valuable for your care team. Rate 1–6 if relevant.</p>
              <SymptomGrid categories={SYMPTOM_CATEGORIES} scores={scores} onChange={handleScoreChange} />
            </div>
          </Section>
        </>
      )}

      {/* POSTPARTUM MODE */}
      {isPostpartum && (
        <>
          <Section title="Postpartum Symptoms" subtitle="Rate physical recovery and emotional wellbeing" defaultOpen={true} badge="Postpartum">
            <div className="pt-2">
              <PostpartumSymptoms
                scores={scores}
                onChange={handleScoreChange}
                postpartumDay={latestCycle?.start_date ? Math.max(1, Math.floor((new Date(selectedDate) - new Date(latestCycle.start_date)) / 86400000) + 1) : null}
              />
            </div>
          </Section>
          <EpdsScale
            responses={epdsResponses}
            isPostpartum={true}
            onComplete={(total, responses) => { setEpdsScore(total); setEpdsResponses(responses); setHasUnsavedChanges(true); }}
          />
          <MoodScales
            phq9Responses={phq9Responses}
            gad7Responses={gad7Responses}
            hidePhq9={true}
            onPHQ9Change={(total, responses) => { setPhq9Score(total); setPhq9Responses(responses); setHasUnsavedChanges(true); }}
            onGAD7Change={(total, responses) => { setGad7Score(total); setGad7Responses(responses); setHasUnsavedChanges(true); }}
          />
          <Section title="DRSP Mood & Symptom Tracking" subtitle="Optional — classic mood/symptom grid for comparison">
            <div className="pt-2">
              <SymptomGrid categories={SYMPTOM_CATEGORIES} scores={scores} onChange={handleScoreChange} />
            </div>
          </Section>
        </>
      )}

      {/* MENOPAUSE MODE */}
      {isMenopause && (
        <>
          <Section
            title={cycleType === "perimenopause" ? "Perimenopause Symptoms" : "Menopause Symptoms"}
            subtitle="Track hot flashes, mood, sleep and more"
            defaultOpen={true}
            badge={cycleType === "perimenopause" ? "Peri" : "Meno"}
          >
            <div className="pt-2">
              <MenopauseSymptoms
                scores={scores}
                onChange={handleScoreChange}
                hrtType={latestCycle?.hrt_type}
                cycleType={cycleType}
              />
            </div>
          </Section>
          <MoodScales
            phq9Responses={phq9Responses}
            gad7Responses={gad7Responses}
            onPHQ9Change={(total, responses) => { setPhq9Score(total); setPhq9Responses(responses); setHasUnsavedChanges(true); }}
            onGAD7Change={(total, responses) => { setGad7Score(total); setGad7Responses(responses); setHasUnsavedChanges(true); }}
          />
          {cycleType === "perimenopause" && (
            <>
              <Section title="Bleeding / Spotting" subtitle="Irregular bleeding is common in perimenopause">
                <div className="pt-1">
                  <BleedingPicker value={bleedingIntensity} onChange={(v) => { setBleedingIntensity(v); setHasUnsavedChanges(true); }} />
                </div>
              </Section>
              <OvulationTracking
                ovulationTest={ovulationTest}
                ovulationDate={ovulationDate}
                cervicalMucus={cervicalMucus}
                onChange={handleOvulationChange}
              />
            </>
          )}

          {/* Collapsible DRSP for menopause — hidden by default */}
          <Section title="DRSP Mood & Symptom Tracking" subtitle="Optional — classic PMDD/PMS symptom grid for comparison">
            <div className="pt-2">
              <SymptomGrid categories={SYMPTOM_CATEGORIES} scores={scores} onChange={handleScoreChange} />
            </div>
          </Section>
        </>
      )}

      {/* SHARED SECTIONS */}
      <Section title="Medications Taken Today">
        <div className="pt-1">
          <MedicationsTaken value={medications} onChange={(v) => { setMedications(v); setHasUnsavedChanges(true); }} />
        </div>
      </Section>

      <VitalsTracking
        values={vitals}
        onChange={(v) => { setVitals(v); setHasUnsavedChanges(true); }}
      />

      <Section title="Custom Symptoms">
        <div className="pt-1">
          <CustomSymptoms value={customSymptoms} onChange={(v) => { setCustomSymptoms(v); setHasUnsavedChanges(true); }} />
        </div>
      </Section>

      <Section title="Journal Entry">
        <div className="pt-1 space-y-3">
          <Textarea
            placeholder={
              isPregnancy
                ? "How are you feeling today? Any movements, symptoms, or thoughts to remember..."
                : isPostpartum
                ? "How are you and baby doing today? Note recovery, feeding, sleep, and emotions..."
                : isMenopause
                ? "How was today? Note any hot flash triggers, sleep quality, or mood observations..."
                : "How are you feeling today? Any patterns, triggers, or observations..."
            }
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
    </>
  );
}