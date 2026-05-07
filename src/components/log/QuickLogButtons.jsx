import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Droplet, Heart, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function QuickLogButtons({
  selectedDate,
  existingEntry,
  cycleType,
}) {
  const queryClient = useQueryClient();
  const [loadingState, setLoadingState] = useState({});

  const isBleedingActive = (existingEntry?.bleeding_intensity || 0) > 0;
  const isIntimacyActive = !!existingEntry?.intimacy_logged;
  const isOvulationActive = !!(
    existingEntry?.ovulation_test === "LH Surge" ||
    existingEntry?.ovulation_test === "Positive"
  );

  // Bleeding toggle mutation
  const bleedingMutation = useMutation({
    mutationFn: async () => {
      const newIntensity = isBleedingActive ? 0 : 2;
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, {
          bleeding_intensity: newIntensity,
        });
      } else {
        await base44.entities.DailyEntry.create({
          date: selectedDate,
          bleeding_intensity: newIntensity,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success(isBleedingActive ? "Period cleared ✓" : "Period logged ✓");
      setLoadingState((prev) => ({ ...prev, bleeding: false }));
    },
    onError: () => {
      toast.error("Failed to save");
      setLoadingState((prev) => ({ ...prev, bleeding: false }));
    },
  });

  // Intimacy toggle mutation
  const intimacyMutation = useMutation({
    mutationFn: async () => {
      const newValue = !isIntimacyActive;
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, {
          intimacy_logged: newValue,
        });
      } else {
        await base44.entities.DailyEntry.create({
          date: selectedDate,
          intimacy_logged: newValue,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success(isIntimacyActive ? "Intimacy cleared ✓" : "Intimacy logged ✓");
      setLoadingState((prev) => ({ ...prev, intimacy: false }));
    },
    onError: () => {
      toast.error("Failed to save");
      setLoadingState((prev) => ({ ...prev, intimacy: false }));
    },
  });

  // Ovulation toggle mutation
  const ovulationMutation = useMutation({
    mutationFn: async () => {
      const newTest = isOvulationActive ? "" : "Positive";
      const newDate = isOvulationActive ? "" : selectedDate;
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, {
          ovulation_test: newTest,
          ovulation_date: newDate,
        });
      } else {
        await base44.entities.DailyEntry.create({
          date: selectedDate,
          ovulation_test: newTest,
          ovulation_date: newDate,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success(isOvulationActive ? "Ovulation cleared ✓" : "Ovulation logged ✓");
      setLoadingState((prev) => ({ ...prev, ovulation: false }));
    },
    onError: () => {
      toast.error("Failed to save");
      setLoadingState((prev) => ({ ...prev, ovulation: false }));
    },
  });

  const handleBleedingClick = () => {
    setLoadingState((prev) => ({ ...prev, bleeding: true }));
    bleedingMutation.mutate();
  };

  const handleIntimacyClick = () => {
    setLoadingState((prev) => ({ ...prev, intimacy: true }));
    intimacyMutation.mutate();
  };

  const handleOvulationClick = () => {
    setLoadingState((prev) => ({ ...prev, ovulation: true }));
    ovulationMutation.mutate();
  };

  if (!["menstrual", "perimenopause"].includes(cycleType)) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Quick Log for {format(new Date(selectedDate), "EEE, MMM d")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {/* Period / Bleeding Toggle */}
        <Button
          onClick={handleBleedingClick}
          disabled={loadingState.bleeding}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isBleedingActive
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-red-500/50"
          }`}
        >
          {loadingState.bleeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Droplet className="h-4 w-4" />
          )}
          <span className="text-[11px]">{isBleedingActive ? "Period On" : "Period"}</span>
        </Button>

        {/* Intimacy / Sex Toggle */}
        <Button
          onClick={handleIntimacyClick}
          disabled={loadingState.intimacy}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isIntimacyActive
              ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-pink-500/50"
          }`}
        >
          {loadingState.intimacy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          <span className="text-[11px]">{isIntimacyActive ? "Logged ♥" : "Intimacy"}</span>
        </Button>

        {/* Ovulation Toggle */}
        <Button
          onClick={handleOvulationClick}
          disabled={loadingState.ovulation}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isOvulationActive
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-amber-500/50"
          }`}
        >
          {loadingState.ovulation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="text-[11px]">{isOvulationActive ? "Detected" : "Ovulation"}</span>
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic text-center">
        Tap to toggle. Changes save instantly. 💜
      </p>
    </div>
  );
}