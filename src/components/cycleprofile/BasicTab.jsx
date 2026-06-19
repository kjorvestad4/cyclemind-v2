import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, History, TrendingUp } from "lucide-react";
import { REGULARITY_OPTIONS, REGULARITY_VARIANCE, EDUCATIONAL_TOOLTIPS } from "@/lib/cycleProfileConfig";
import InfoTooltip from "@/components/cycleprofile/InfoTooltip";

/**
 * Basic Tab — free for ALL users.
 * Cycle length, period length, regularity.
 */
export default function BasicTab({
  profile,
  setProfile,
  learnedCycleLength,
  onImprovePredictions,
  onViewHistory,
}) {
  const update = (key, val) => setProfile(prev => ({ ...prev, [key]: val }));

  const handleCycleLengthChange = (val) => {
    const cl = Math.min(45, Math.max(21, val || 28));
    update("cycleLength", cl);
    // Auto-sync ovulation day = cycleLength - lutealLength
    const ll = profile.lutealLength || 14;
    update("lutealLength", ll);
  };

  const handlePeriodLengthChange = (val) => {
    const pl = Math.min(10, Math.max(3, val || 5));
    update("periodLength", pl);
  };

  const regularityMeta = REGULARITY_VARIANCE[profile.cycleRegularity] || REGULARITY_VARIANCE.regular;

  return (
    <div className="space-y-5">
      {/* Avg Cycle Length */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Avg Cycle Length</Label>
          <InfoTooltip text={EDUCATIONAL_TOOLTIPS.cycleLength} label="Cycle length info" />
          {learnedCycleLength && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Learned from your logs (last 6 cycles): {learnedCycleLength}d
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={21}
            max={45}
            value={profile.cycleLength}
            onChange={(e) => handleCycleLengthChange(parseInt(e.target.value) || 28)}
            className="w-20 h-10 text-center text-lg font-bold"
          />
          <span className="text-sm text-muted-foreground">days</span>
          <input
            type="range"
            min={21}
            max={45}
            value={profile.cycleLength}
            onChange={(e) => handleCycleLengthChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Avg Period Length */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Avg Period Length</Label>
          <InfoTooltip text={EDUCATIONAL_TOOLTIPS.periodLength} label="Period length info" />
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={3}
            max={10}
            value={profile.periodLength}
            onChange={(e) => handlePeriodLengthChange(parseInt(e.target.value) || 5)}
            className="w-20 h-10 text-center text-lg font-bold"
          />
          <span className="text-sm text-muted-foreground">days</span>
          <input
            type="range"
            min={3}
            max={10}
            value={profile.periodLength}
            onChange={(e) => handlePeriodLengthChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Cycle Regularity */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Cycle Regularity</Label>
          <InfoTooltip text={EDUCATIONAL_TOOLTIPS.regularity} label="Regularity info" />
        </div>
        <select
          value={profile.cycleRegularity}
          onChange={(e) => update("cycleRegularity", e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {REGULARITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
          ))}
        </select>
        {/* Variance indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40">
          <span className="text-sm font-mono" style={{ color: regularityMeta.color }}>{regularityMeta.icon}</span>
          <span className="text-xs text-muted-foreground">{regularityMeta.text}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl gap-2"
          onClick={onImprovePredictions}
        >
          <TrendingUp className="w-4 h-4" />
          Improve predictions from my logs
        </Button>
        <Button
          variant="ghost"
          className="w-full h-11 rounded-xl gap-2 text-muted-foreground"
          onClick={onViewHistory}
        >
          <History className="w-4 h-4" />
          View / Edit my cycle history
        </Button>
      </div>
    </div>
  );
}