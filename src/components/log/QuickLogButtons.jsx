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
  const [loadingState, setLoadingState] = useState({});
  const [showIntimacyOptions, setShowIntimacyOptions] = useState(false);

  const isBleedingActive = (existingEntry?.bleeding_intensity || 0) > 0;
  const isIntimacyActive = !!existingEntry?.intimacy_logged;
  const intimacyProtected = existingEntry?.intimacy_protected;
  const isOvulationActive = !!(
    existingEntry?.ovulation_test === "LH Surge" ||
    existingEntry?.ovulation_test === "Positive"
  );

  // Bleeding toggle mutation with optimistic updates
  const bleedingMutation = useMutation({
    mutationFn: async () => {
      const newIntensity = isBleedingActive ? 0 : 2;
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { bleeding_intensity: newIntensity });
      } else {
        await base44.entities.DailyEntry.create({ date: selectedDate, bleeding_intensity: newIntensity });
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["entries"] });
      const previousEntries = queryClient.getQueryData(["entries"]);
      
      queryClient.setQueryData(["entries"], (old) => {
        if (!old) return old;
        const newIntensity = isBleedingActive ? 0 : 2;
        return old.map((e) =>
          e.id === existingEntry?.id
            ? { ...e, bleeding_intensity: newIntensity }
            : e.date === selectedDate && !existingEntry?.id
            ? { ...e, bleeding_intensity: newIntensity }
            : e
        );
      });

      return { previousEntries };
    },
    onSuccess: () => {
      toast.success(isBleedingActive ? "Period cleared ✓" : "Period logged ✓");
      setLoadingState((prev) => ({ ...prev, bleeding: false }));
    },
    onError: (err, vars, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["entries"], context.previousEntries);
      }
      toast.error("Failed to save");
      setLoadingState((prev) => ({ ...prev, bleeding: false }));
    },
  });

  // Intimacy mutation with optimistic updates
  const intimacyMutation = useMutation({
    mutationFn: async (protected_status) => {
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, {
          intimacy_logged: true,
          intimacy_protected: protected_status,
        });
      } else {
        await base44.entities.DailyEntry.create({
          date: selectedDate,
          intimacy_logged: true,
          intimacy_protected: protected_status,
        });
      }
    },
    onMutate: async (protected_status) => {
      await queryClient.cancelQueries({ queryKey: ["entries"] });
      const previousEntries = queryClient.getQueryData(["entries"]);

      queryClient.setQueryData(["entries"], (old) => {
        if (!old) return old;
        return old.map((e) =>
          e.id === existingEntry?.id
            ? { ...e, intimacy_logged: true, intimacy_protected: protected_status }
            : e.date === selectedDate && !existingEntry?.id
            ? { ...e, intimacy_logged: true, intimacy_protected: protected_status }
            : e
        );
      });

      return { previousEntries };
    },
    onSuccess: () => {
      toast.success("Intimacy logged ✓");
      setShowIntimacyOptions(false);
      setLoadingState((prev) => ({ ...prev, intimacy: false }));
    },
    onError: (err, vars, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["entries"], context.previousEntries);
      }
      toast.error("Failed to save");
      setLoadingState((prev) => ({ ...prev, intimacy: false }));
    },
  });

  const clearIntimacyMutation = useMutation({
    mutationFn: async () => {
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { intimacy_logged: false, intimacy_protected: null });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Intimacy cleared ✓");
      setShowIntimacyOptions(false);
    },
  });

  // Ovulation toggle mutation with optimistic updates
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["entries"] });
      const previousEntries = queryClient.getQueryData(["entries"]);

      queryClient.setQueryData(["entries"], (old) => {
        if (!old) return old;
        const newTest = isOvulationActive ? "" : "Positive";
        const newDate = isOvulationActive ? "" : selectedDate;
        return old.map((e) =>
          e.id === existingEntry?.id
            ? { ...e, ovulation_test: newTest, ovulation_date: newDate }
            : e.date === selectedDate && !existingEntry?.id
            ? { ...e, ovulation_test: newTest, ovulation_date: newDate }
            : e
        );
      });

      return { previousEntries };
    },
    onSuccess: () => {
      toast.success(isOvulationActive ? "Ovulation cleared ✓" : "Ovulation logged ✓");
      setLoadingState((prev) => ({ ...prev, ovulation: false }));
    },
    onError: (err, vars, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["entries"], context.previousEntries);
      }
      toast.error("Failed to save");
      setLoadingState((prev) => ({ ...prev, ovulation: false }));
    },
  });

  if (!["menstrual", "perimenopause", "postpartum"].includes(cycleType)) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Quick Log for {format(new Date(selectedDate), "EEE, MMM d")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {/* Period / Bleeding Toggle */}
        <Button
          onClick={() => { setLoadingState((prev) => ({ ...prev, bleeding: true })); bleedingMutation.mutate(); }}
          disabled={loadingState.bleeding}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isBleedingActive
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-red-500/50"
          }`}
        >
          {loadingState.bleeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplet className="h-4 w-4" />}
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
          disabled={clearIntimacyMutation.isPending}
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
          onClick={() => { setLoadingState((prev) => ({ ...prev, ovulation: true })); ovulationMutation.mutate(); }}
          disabled={loadingState.ovulation}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isOvulationActive
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-amber-500/50"
          }`}
        >
          {loadingState.ovulation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
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
              onClick={() => { setLoadingState((prev) => ({ ...prev, intimacy: true })); intimacyMutation.mutate(true); }}
              disabled={intimacyMutation.isPending}
              className="h-10 gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Shield className="h-3.5 w-3.5" /> Protected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setLoadingState((prev) => ({ ...prev, intimacy: true })); intimacyMutation.mutate(false); }}
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