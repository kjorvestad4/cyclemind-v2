import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Droplet, Heart, Sparkles, Loader2, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function QuickLogButtons({
  selectedDate,
  existingEntry,
  cycleType,
}) {
  const queryClient = useQueryClient();
  const [showIntimacyOptions, setShowIntimacyOptions] = useState(false);

  const isBleedingActive = (existingEntry?.bleeding_intensity || 0) > 0;
  const isIntimacyActive = !!existingEntry?.intimacy_logged;
  const intimacyProtected = existingEntry?.intimacy_protected;
  const isOvulationActive = !!(
    existingEntry?.ovulation_test === "LH Surge" ||
    existingEntry?.ovulation_test === "Positive"
  );

  const applyOptimisticUpdate = (updater) => {
    queryClient.cancelQueries({ queryKey: ["entries"] });
    const previousEntries = queryClient.getQueryData(["entries"]);
    queryClient.setQueryData(["entries"], (old) => {
      if (!old) return old;
      if (existingEntry?.id) {
        return old.map((e) => e.id === existingEntry.id ? { ...e, ...updater } : e);
      } else {
        // No existing entry — append a temporary optimistic record
        return [...old, { date: selectedDate, id: "__optimistic__", ...updater }];
      }
    });
    return { previousEntries };
  };

  const rollback = (context) => {
    if (context?.previousEntries) {
      queryClient.setQueryData(["entries"], context.previousEntries);
    }
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["entries"] });

  // Bleeding toggle
  const bleedingMutation = useMutation({
    mutationFn: async () => {
      const newIntensity = isBleedingActive ? 0 : 2;
      
      // If starting a new period (not clearing), check if we need to create a new cycle
      if (newIntensity === 2 && !isBleedingActive) {
        // Fetch all cycles to check if this is a new cycle start
        const allCycles = await base44.entities.Cycle.filter({ created_by: existingEntry?.created_by || (await base44.auth.me()).email }, "-start_date", 50);
        const latestCycle = allCycles.length > 0 ? [...allCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0] : null;
        
        // Only create new cycle if:
        // 1. No cycle exists, OR
        // 2. It's been 21+ days since last cycle start (typical cycle range is 21-35 days)
        const shouldCreateNewCycle = !latestCycle || 
          (new Date(selectedDate) - new Date(latestCycle.start_date)) >= (21 * 24 * 60 * 60 * 1000);
        
        if (shouldCreateNewCycle && latestCycle) {
          // Update the previous cycle's end_date to yesterday
          const yesterday = new Date(selectedDate);
          yesterday.setDate(yesterday.getDate() - 1);
          await base44.entities.Cycle.update(latestCycle.id, { 
            end_date: format(yesterday, 'yyyy-MM-dd'),
            cycle_length: Math.round((new Date(selectedDate) - new Date(latestCycle.start_date)) / (1000 * 60 * 60 * 24))
          });
        }
        
        if (shouldCreateNewCycle || !latestCycle) {
          // Create new cycle starting today
          await base44.entities.Cycle.create({
            start_date: selectedDate,
            cycle_type: cycleType || 'menstrual',
            phase: 'menstrual',
            last_menstrual_period: selectedDate
          });
        }
      }
      
      // Update/create daily entry with bleeding intensity
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { bleeding_intensity: newIntensity });
      } else {
        await base44.entities.DailyEntry.create({ date: selectedDate, bleeding_intensity: newIntensity });
      }
    },
    onMutate: () => applyOptimisticUpdate({ bleeding_intensity: isBleedingActive ? 0 : 2 }),
    onSuccess: (_data, _vars, context) => {
      const wasActive = isBleedingActive;
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success(wasActive ? "Period cleared ✓" : "Period logged ✓ New cycle started!");
    },
    onError: (_err, _vars, context) => { rollback(context); toast.error("Failed to save"); },
  });

  // Intimacy mutation
  const intimacyMutation = useMutation({
    mutationFn: async (protected_status) => {
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { intimacy_logged: true, intimacy_protected: protected_status });
      } else {
        await base44.entities.DailyEntry.create({ date: selectedDate, intimacy_logged: true, intimacy_protected: protected_status });
      }
    },
    onMutate: (protected_status) => applyOptimisticUpdate({ intimacy_logged: true, intimacy_protected: protected_status }),
    onSuccess: () => { invalidate(); setShowIntimacyOptions(false); toast.success("Intimacy logged ✓"); },
    onError: (_err, _vars, context) => { rollback(context); toast.error("Failed to save"); },
  });

  const clearIntimacyMutation = useMutation({
    mutationFn: async () => {
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { intimacy_logged: false, intimacy_protected: null });
      }
    },
    onMutate: () => applyOptimisticUpdate({ intimacy_logged: false, intimacy_protected: null }),
    onSuccess: () => { invalidate(); setShowIntimacyOptions(false); toast.success("Intimacy cleared ✓"); },
    onError: (_err, _vars, context) => { rollback(context); toast.error("Failed to save"); },
  });

  // Ovulation toggle
  const ovulationMutation = useMutation({
    mutationFn: async () => {
      const newTest = isOvulationActive ? "" : "Positive";
      const newDate = isOvulationActive ? "" : selectedDate;
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { ovulation_test: newTest, ovulation_date: newDate });
      } else {
        await base44.entities.DailyEntry.create({ date: selectedDate, ovulation_test: newTest, ovulation_date: newDate });
      }
    },
    onMutate: () => applyOptimisticUpdate({ ovulation_test: isOvulationActive ? "" : "Positive", ovulation_date: isOvulationActive ? "" : selectedDate }),
    onSuccess: (_data, _vars, context) => {
      const wasActive = isOvulationActive;
      invalidate();
      toast.success(wasActive ? "Ovulation cleared ✓" : "Ovulation logged ✓");
    },
    onError: (_err, _vars, context) => { rollback(context); toast.error("Failed to save"); },
  });

  if (!["menstrual", "perimenopause", "postpartum"].includes(cycleType)) return null;

  const parseLocalDate = (str) => { const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Quick Log for {format(parseLocalDate(selectedDate), "EEE, MMM d")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {/* Period / Bleeding Toggle */}
        <Button
          onClick={() => bleedingMutation.mutate()}
          disabled={bleedingMutation.isPending}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isBleedingActive
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-red-500/50"
          }`}
        >
          {bleedingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplet className="h-4 w-4" />}
          <span className="text-[11px]">{isBleedingActive ? "Period On" : "Period"}</span>
        </Button>

        {/* Intimacy Toggle */}
        <Button
          onClick={() => {
            if (isIntimacyActive) {
              clearIntimacyMutation.mutate();
            } else {
              setShowIntimacyOptions(!showIntimacyOptions);
            }
          }}
          disabled={clearIntimacyMutation.isPending || intimacyMutation.isPending}
          className={`h-14 gap-1 text-xs font-semibold transition-all active:scale-95 rounded-2xl flex-col ${
            isIntimacyActive
              ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-pink-500/50"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span className="text-[11px] leading-tight text-center">
            {isIntimacyActive
              ? intimacyProtected === true ? "Protected ♥" : intimacyProtected === false ? "Unprotected ♥" : "Logged ♥"
              : "Intimacy"}
          </span>
        </Button>

        {/* Ovulation Toggle */}
        <Button
          onClick={() => ovulationMutation.mutate()}
          disabled={ovulationMutation.isPending}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isOvulationActive
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-amber-500/50"
          }`}
        >
          {ovulationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span className="text-[11px]">{isOvulationActive ? "Detected" : "Ovulation"}</span>
        </Button>
      </div>

      {/* Intimacy options popup */}
      {showIntimacyOptions && !isIntimacyActive && (
        <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground font-semibold text-center">Select protection status</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => intimacyMutation.mutate(true)}
              disabled={intimacyMutation.isPending}
              className="h-10 gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Shield className="h-3.5 w-3.5" /> Protected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => intimacyMutation.mutate(false)}
              disabled={intimacyMutation.isPending}
              className="h-10 gap-1.5 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <ShieldOff className="h-3.5 w-3.5" /> Unprotected
            </Button>
          </div>
          <button
            onClick={() => setShowIntimacyOptions(false)}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground italic text-center">
        Tap to toggle. Changes save instantly. 💜
      </p>
    </div>
  );
}