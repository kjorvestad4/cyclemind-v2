import { Trophy, Target, Flame } from "lucide-react";

export default function ProgressCelebration({ cyclesCount, entriesCount }) {
  if (cyclesCount === 0 && entriesCount === 0) return null;

  const getMilestone = () => {
    if (cyclesCount >= 6) return { emoji: "🏆", label: "6+ cycles tracked", type: "major" };
    if (cyclesCount >= 3) return { emoji: "🎯", label: "3 cycles tracked", type: "major" };
    if (entriesCount >= 30) return { emoji: "🔥", label: `${entriesCount} days logged`, type: "minor" };
    if (entriesCount >= 7) return { emoji: "✨", label: `${entriesCount} days logged`, type: "minor" };
    return null;
  };

  const milestone = getMilestone();
  if (!milestone) return null;

  return (
    <div className={`rounded-2xl border p-3 flex items-center gap-3 ${
      milestone.type === "major"
        ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20"
        : "bg-muted/40 border-border/50"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${
        milestone.type === "major" ? "bg-primary/10" : "bg-muted"
      }`}>
        {milestone.emoji}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Great progress!</p>
        <p className="text-xs text-muted-foreground">{milestone.label} — you're building a valuable clinical picture</p>
      </div>
    </div>
  );
}