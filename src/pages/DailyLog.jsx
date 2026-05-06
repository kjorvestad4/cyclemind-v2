import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Check, Notebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SymptomCategory from "@/components/log/SymptomCategory";
import MenstrualFlowPicker from "@/components/log/MenstrualFlowPicker";
import { SYMPTOM_CATEGORIES, ALL_SYMPTOMS, getCycleDay, calculateDayTotal } from "@/lib/symptoms";

export default function DailyLog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const initialDate = urlParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [scores, setScores] = useState({});
  const [flow, setFlow] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-start_date", 50),
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.DailyEntry.list("-date", 200),
  });

  const existingEntry = entries.find((e) => e.date === selectedDate);
  const cycleDay = getCycleDay(selectedDate, cycles);

  // Load existing entry when date changes
  useEffect(() => {
    if (existingEntry) {
      const newScores = {};
      ALL_SYMPTOMS.forEach((s) => {
        if (existingEntry[s.key]) newScores[s.key] = existingEntry[s.key];
      });
      setScores(newScores);
      setFlow(existingEntry.menstrual_flow || "");
      setNotes(existingEntry.notes || "");
    } else {
      setScores({});
      setFlow("");
      setNotes("");
    }
    setHasUnsavedChanges(false);
  }, [selectedDate, existingEntry?.id]);

  const handleScoreChange = useCallback((key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        date: selectedDate,
        cycle_day: cycleDay || undefined,
        menstrual_flow: flow || undefined,
        notes: notes || undefined,
      };
      ALL_SYMPTOMS.forEach((s) => {
        data[s.key] = scores[s.key] || 0;
      });

      if (existingEntry) {
        await base44.entities.DailyEntry.update(existingEntry.id, data);
      } else {
        await base44.entities.DailyEntry.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setHasUnsavedChanges(false);
      toast.success("Entry saved! Keep it up 💜");
    },
  });

  const filledCount = ALL_SYMPTOMS.filter((s) => scores[s.key] > 0).length;
  const totalScore = calculateDayTotal({ ...scores });
  const progress = Math.round((filledCount / ALL_SYMPTOMS.length) * 100);

  const changeDate = (dir) => {
    const d = dir === "prev" ? subDays(new Date(selectedDate), 1) : addDays(new Date(selectedDate), 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  return (
    <div className="space-y-5">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => changeDate("prev")}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="text-lg font-semibold">{format(new Date(selectedDate), "EEEE, MMM d")}</p>
          {cycleDay && (
            <p className="text-xs text-muted-foreground">Cycle Day {cycleDay}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => changeDate("next")}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-xl border border-border/50 p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {filledCount} of {ALL_SYMPTOMS.length} symptoms rated
          </span>
          <span className="font-semibold text-foreground">Score: {totalScore}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Menstrual Flow */}
      <MenstrualFlowPicker value={flow} onChange={(v) => { setFlow(v); setHasUnsavedChanges(true); }} />

      {/* Symptom Categories */}
      {SYMPTOM_CATEGORIES.map((cat) => (
        <SymptomCategory
          key={cat.label}
          category={cat}
          scores={scores}
          onChange={handleScoreChange}
        />
      ))}

      {/* Notes */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <Notebook className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Notes</span>
        </button>
        {showNotes && (
          <div className="px-4 pb-4">
            <Textarea
              placeholder="How are you feeling today? Any observations..."
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setHasUnsavedChanges(true); }}
              className="min-h-[80px] resize-none"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="sticky bottom-20 z-30">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full h-12 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20"
        >
          {saveMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : hasUnsavedChanges ? (
            <Save className="w-5 h-5" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          {hasUnsavedChanges ? "Save Entry" : "Saved"}
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center pb-4">
        This app is not a substitute for professional medical advice. Always consult your doctor.
      </p>
    </div>
  );
}