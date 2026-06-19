/**
 * TransitionQuickButtons — Shown in the Daily Log when user's current_situation
 * is "stopped_contraception". Provides quick actions for tracking cycle return.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Droplet, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TransitionQuickButtons({ selectedDate, existingEntry, cycleType }) {
  const queryClient = useQueryClient();

  const applyOptimisticUpdate = (updater) => {
    queryClient.cancelQueries({ queryKey: ["entries"] });
    const previousEntries = queryClient.getQueryData(["entries"]);
    queryClient.setQueryData(["entries"], (old) => {
      if (!old) return old;
      if (existingEntry?.id) {
        return old.map((e) => (e.id === existingEntry.id ? { ...e, ...updater } : e));
      }
      return [...old, { date: selectedDate, id: "__optimistic__", ...updater }];
    });
    return { previousEntries };
  };

  const rollback = (context) => {
    if (context?.previousEntries) {
      queryClient.setQueryData(["entries"], context.previousEntries);
    }
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["cycles"] });
  };

  // Log spotting
  const spottingMutation = useMutation({
    mutationFn: async () => {
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { bleeding_intensity: 1 });
      } else {
        await base44.entities.DailyEntry.create({ date: selectedDate, bleeding_intensity: 1 });
      }
    },
    onMutate: () => applyOptimisticUpdate({ bleeding_intensity: 1 }),
    onSuccess: () => { invalidate(); toast.success("Spotting logged ✓"); },
    onError: (_e, _v, ctx) => { rollback(ctx); toast.error("Failed to save"); },
  });

  // First real period — start a new natural cycle
  const firstPeriodMutation = useMutation({
    mutationFn: async () => {
      const me = await base44.auth.me();

      // Close out any existing active cycle
      const allCycles = await base44.entities.Cycle.filter({ created_by: me.email }, "-start_date", 50);
      const latestCycle = allCycles.length > 0
        ? [...allCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
        : null;

      if (latestCycle && !latestCycle.end_date) {
        const yesterday = new Date(selectedDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const actualLength = Math.round(
          (new Date(selectedDate) - new Date(latestCycle.start_date)) / (1000 * 60 * 60 * 24)
        );
        await base44.entities.Cycle.update(latestCycle.id, {
          end_date: format(yesterday, "yyyy-MM-dd"),
          cycle_length: actualLength > 0 ? actualLength : undefined,
        });
      }

      // Create new menstrual cycle
      await base44.entities.Cycle.create({
        start_date: selectedDate,
        cycle_type: "menstrual",
        phase: "menstrual",
        last_menstrual_period: selectedDate,
      });

      // Log the bleeding
      if (existingEntry?.id) {
        await base44.entities.DailyEntry.update(existingEntry.id, { bleeding_intensity: 2 });
      } else {
        await base44.entities.DailyEntry.create({ date: selectedDate, bleeding_intensity: 2 });
      }

      // Transition user back to natural tracking
      await base44.auth.updateMe({ current_situation: "natural_ttc" });
    },
    onMutate: () => applyOptimisticUpdate({ bleeding_intensity: 2 }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("First natural period logged! Cycle tracking re-baselined. 🌱", { duration: 5000 });
    },
    onError: (_e, _v, ctx) => { rollback(ctx); toast.error("Failed to save"); },
  });

  // Still no bleed — log a note
  const noBleedMutation = useMutation({
    mutationFn: async () => {
      const note = `[${format(new Date(), "MMM d")}] Still no bleed`;
      if (existingEntry?.id) {
        const existingNote = existingEntry.notes || "";
        await base44.entities.DailyEntry.update(existingEntry.id, {
          notes: existingNote ? `${existingNote}\n${note}` : note,
        });
      } else {
        await base44.entities.DailyEntry.create({ date: selectedDate, notes: note });
      }
    },
    onMutate: () => applyOptimisticUpdate({ notes: "Still no bleed" }),
    onSuccess: () => { invalidate(); toast.success("Logged — keep tracking symptoms! 💜"); },
    onError: (_e, _v, ctx) => { rollback(ctx); toast.error("Failed to save"); },
  });

  const isSpotting = (existingEntry?.bleeding_intensity || 0) === 1;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Cycle Return Tracking
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => spottingMutation.mutate()}
          disabled={spottingMutation.isPending}
          className={`h-16 flex-col gap-1 text-xs font-semibold transition-all active:scale-95 rounded-2xl ${
            isSpotting
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30"
              : "bg-card border-2 border-border text-muted-foreground hover:border-amber-500/50"
          }`}
        >
          {spottingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplet className="h-4 w-4" />}
          <span className="text-[11px] leading-tight text-center">Log Spotting</span>
        </Button>

        <Button
          onClick={() => firstPeriodMutation.mutate()}
          disabled={firstPeriodMutation.isPending}
          className="h-16 flex-col gap-1 text-xs font-semibold transition-all active:scale-95 rounded-2xl bg-card border-2 border-border text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-700"
        >
          {firstPeriodMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          <span className="text-[11px] leading-tight text-center">First Real Period</span>
        </Button>

        <Button
          onClick={() => noBleedMutation.mutate()}
          disabled={noBleedMutation.isPending}
          className="h-16 flex-col gap-1 text-xs font-semibold transition-all active:scale-95 rounded-2xl bg-card border-2 border-border text-muted-foreground hover:border-primary/50"
        >
          {noBleedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          <span className="text-[11px] leading-tight text-center">Still No Bleed</span>
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic text-center">
        It's common for periods to take weeks or months to return. Keep logging — it helps your doctor!
      </p>
    </div>
  );
}