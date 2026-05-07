import { Droplet, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function QuickLogButtons({
  selectedDate,
  existingEntry,
  onBleedingToggle,
  onIntimacyToggle,
  onOvulationToggle,
  isPending,
  cycleType,
}) {
  // Only show for menstrual/perimenopause modes
  if (!["menstrual", "perimenopause"].includes(cycleType)) return null;

  const isBleedingActive = existingEntry && (existingEntry.bleeding_intensity || 0) > 0;
  const isIntimacyActive = existingEntry && !!existingEntry.intimacy_logged;
  const isOvulationActive = existingEntry && !!(existingEntry.ovulation_test === "LH Surge" || existingEntry.ovulation_test === "Positive");

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quick Log for {format(new Date(selectedDate), "EEE, MMM d")}</p>
      <div className="grid grid-cols-3 gap-2">
        {/* Period / Bleeding Toggle */}
        <Button
          variant={isBleedingActive ? "default" : "outline"}
          onClick={() => onBleedingToggle()}
          disabled={isPending}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 ${
            isBleedingActive ? "shadow-lg shadow-red-500/30" : ""
          }`}
        >
          <Droplet className="h-4 w-4" />
          <span className="text-[11px]">{isBleedingActive ? "Period On" : "Period"}</span>
        </Button>

        {/* Intimacy / Sex Toggle */}
        <Button
          variant={isIntimacyActive ? "default" : "outline"}
          onClick={() => onIntimacyToggle()}
          disabled={isPending}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 ${
            isIntimacyActive ? "shadow-lg shadow-pink-500/30" : ""
          }`}
        >
          <Heart className="h-4 w-4" />
          <span className="text-[11px]">{isIntimacyActive ? "Logged ♥" : "Intimacy"}</span>
        </Button>

        {/* Ovulation Toggle */}
        <Button
          variant={isOvulationActive ? "default" : "outline"}
          onClick={() => onOvulationToggle()}
          disabled={isPending}
          className={`h-14 gap-2 text-xs font-semibold transition-all active:scale-95 ${
            isOvulationActive ? "shadow-lg shadow-amber-500/30" : ""
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-[11px]">{isOvulationActive ? "Detected" : "Ovulation"}</span>
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic text-center">
        Tap to toggle. Changes save instantly. 💜
      </p>
    </div>
  );
}