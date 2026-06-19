import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, FileText, AlertTriangle, Calculator } from "lucide-react";
import { QUICK_PRESETS, OVULATION_MARKER_CONFIG, EDUCATIONAL_TOOLTIPS } from "@/lib/cycleProfileConfig";
import InfoTooltip from "@/components/cycleprofile/InfoTooltip";
import VisualEditor from "@/components/cycleprofile/VisualEditor";
import PremiumGate from "@/components/cycleprofile/PremiumGate";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 flex items-center ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

/**
 * Advanced PMDD Power Tab — Premium & Premium+ only.
 * Luteal phase, ovulation markers, visual editor, per-cycle overrides.
 */
export default function AdvancedTab({
  profile,
  setProfile,
  isPremium,
  onPreviewReport,
  onReset,
  cycles,
  excludedIds,
  onToggleExclude,
}) {
  const [useOvulationDay, setUseOvulationDay] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const update = (key, val) => setProfile(prev => ({ ...prev, [key]: val }));

  const handleLutealChange = (val) => {
    const ll = Math.min(18, Math.max(10, val || 14));
    update("lutealLength", ll);
    // Sync: ovulationDay = cycleLength - lutealLength
    update("ovulationDay", profile.cycleLength - ll);
  };

  const applyPreset = (preset) => {
    setProfile(prev => ({
      ...prev,
      cycleLength: preset.values.cycleLength,
      periodLength: preset.values.periodLength,
      lutealLength: preset.values.lutealLength,
      ovulationDay: preset.values.cycleLength - preset.values.lutealLength,
      pmddWindowDays: preset.values.pmddWindowDays,
    }));
  };

  const handleOvulationDayChange = (val) => {
    const od = Math.max(profile.periodLength + 2, Math.min(profile.cycleLength - 8, val || 14));
    update("ovulationDay", od);
    update("lutealLength", profile.cycleLength - od);
  };

  const lutealWarning = profile.lutealLength < 10 || profile.lutealLength > 18;

  // Locked state
  if (!isPremium) {
    return <PremiumGate feature="Unlock luteal phase customization, full visual editor, PMDD window tracking, and per-cycle overrides." />;
  }

  return (
    <div className="space-y-5">
      {/* Luteal Phase Length */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium">Avg Luteal Phase Length</Label>
          <InfoTooltip text={EDUCATIONAL_TOOLTIPS.lutealPhase} label="Luteal phase info" />
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={10}
            max={18}
            value={profile.lutealLength}
            onChange={(e) => handleLutealChange(parseInt(e.target.value) || 14)}
            className={`w-20 h-10 text-center text-lg font-bold ${lutealWarning ? "border-amber-400" : ""}`}
          />
          <span className="text-sm text-muted-foreground">days</span>
          <input
            type="range"
            min={10}
            max={18}
            value={profile.lutealLength}
            onChange={(e) => handleLutealChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#8b5cf6" }}
          />
        </div>
        {lutealWarning && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
              A luteal phase {profile.lutealLength < 10 ? "under 10 days" : "over 18 days"} is unusual. Consider discussing this with your healthcare provider.
            </p>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground italic">
          Luteal is the most consistent phase and critical for PMDD tracking.
        </p>
      </div>

      {/* Calculate by Ovulation Day toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Calculate by Ovulation Day instead</p>
            <p className="text-[10px] text-muted-foreground">Syncs luteal length from your ovulation day</p>
          </div>
        </div>
        <Toggle checked={useOvulationDay} onChange={setUseOvulationDay} />
      </div>

      {useOvulationDay && (
        <div className="space-y-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
          <Label className="text-sm font-medium">Ovulation Day</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={profile.periodLength + 2}
              max={profile.cycleLength - 8}
              value={profile.ovulationDay}
              onChange={(e) => handleOvulationDayChange(parseInt(e.target.value) || 14)}
              className="w-20 h-10 text-center text-lg font-bold"
            />
            <span className="text-xs text-muted-foreground">→ Luteal: {profile.cycleLength - profile.ovulationDay} days</span>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors text-left"
            >
              <p className="text-xs font-semibold text-foreground">{preset.label}</p>
              <p className="text-[9px] text-muted-foreground">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Ovulation Markers */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Track Ovulation Markers?</p>
          <InfoTooltip text={EDUCATIONAL_TOOLTIPS.ovulationMarkers} label="Ovulation markers info" />
        </div>
        <div className="space-y-1">
          {OVULATION_MARKER_CONFIG.map(marker => (
            <div key={marker.key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <p className="text-sm font-medium">{marker.label}</p>
                <p className="text-[10px] text-muted-foreground">{marker.desc}</p>
              </div>
              <Toggle
                checked={!!profile[marker.key]}
                onChange={(val) => update(marker.key, val)}
              />
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Add "Mark Ovulation" button to daily log</p>
              <p className="text-[10px] text-muted-foreground">Quick-tap button on logging screen</p>
            </div>
            <Toggle
              checked={!!profile.add_mark_ovulation_button}
              onChange={(val) => update("add_mark_ovulation_button", val)}
            />
          </div>
        </div>
      </div>

      {/* Full Visual Editor */}
      <div className="pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full Visual Editor</p>
          <InfoTooltip text={EDUCATIONAL_TOOLTIPS.visualEditor} label="Visual editor info" />
        </div>
        <VisualEditor profile={profile} setProfile={setProfile} />
      </div>

      {/* Per-cycle overrides */}
      <div className="pt-2 border-t border-border/40 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Per-Cycle Overrides</p>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[11px] text-primary font-medium hover:underline"
          >
            {showHistory ? "Hide" : "Show"} ({cycles.length})
          </button>
        </div>
        {showHistory && (
          <div className="rounded-xl border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground mb-2">Exclude cycles with irregular data from your averages.</p>
            <CycleHistoryList cycles={cycles} excludedIds={excludedIds} onToggleExclude={onToggleExclude} />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-border/40">
        <Button
          variant="outline"
          className="flex-1 h-10 rounded-xl gap-2"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
          Reset to learned averages
        </Button>
        <Button
          variant="secondary"
          className="flex-1 h-10 rounded-xl gap-2"
          onClick={onPreviewReport}
        >
          <FileText className="w-4 h-4" />
          Preview in Clinical Report
        </Button>
      </div>
    </div>
  );
}

function CycleHistoryList({ cycles, excludedIds, onToggleExclude }) {
  if (!cycles || cycles.length === 0) {
    return <p className="text-[11px] text-muted-foreground text-center py-3">No cycles logged.</p>;
  }
  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).slice(0, 10);
  return (
    <div className="space-y-1 max-h-40 overflow-y-auto">
      {sorted.map(cycle => {
        const excluded = excludedIds.includes(cycle.id);
        return (
          <div key={cycle.id} className={`flex items-center justify-between p-1.5 rounded-lg ${excluded ? "opacity-50" : ""}`}>
            <span className="text-[11px] text-foreground">
              {new Date(cycle.start_date).toLocaleDateString()} · {cycle.cycle_length || "?"}d
            </span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={!excluded}
                onChange={() => onToggleExclude(cycle.id)}
                className="w-3.5 h-3.5 accent-primary"
              />
              <span className="text-[10px] text-muted-foreground">{excluded ? "Excluded" : "Included"}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}