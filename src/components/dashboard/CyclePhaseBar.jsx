export default function CyclePhaseBar({ cycleDay, latestCycle }) {
  if (!cycleDay) return null;

  const phase = cycleDay <= 5 ? "menstrual"
    : cycleDay <= 13 ? "follicular"
    : cycleDay <= 16 ? "ovulatory"
    : "luteal";

  const phases = ["menstrual", "follicular", "ovulatory", "luteal"];
  const phaseColorActive = { menstrual: "#f43f5e", follicular: "#10b981", ovulatory: "#8b5cf6", luteal: "#3b82f6" };
  const phaseColorDim    = { menstrual: "#fda4af", follicular: "#6ee7b7", ovulatory: "#c4b5fd", luteal: "#93c5fd" };
  const phaseWidthPct    = { menstrual: "18%", follicular: "32%", ovulatory: "7%", luteal: "43%" };
  const phaseLabel       = { menstrual: "Menstrual", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cycle Phase</p>
      <div style={{ display: "flex", gap: "3px", height: "12px", borderRadius: "99px", overflow: "hidden" }}>
        {phases.map((p) => (
          <div
            key={p}
            style={{
              width: phaseWidthPct[p],
              background: phase === p ? phaseColorActive[p] : phaseColorDim[p],
              borderRadius: "4px",
              transition: "background 0.3s ease",
              boxShadow: phase === p ? `0 0 0 2px ${phaseColorActive[phase]}44` : "none",
            }}
          />
        ))}
      </div>
      {phase && (
        <p style={{ fontSize: "11px", fontWeight: 600, color: phaseColorActive[phase], margin: "4px 0 0" }}>
          ● {phaseLabel[phase]} — Day {cycleDay}
        </p>
      )}
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>Day 1</span><span>Day 14</span><span>Day {latestCycle?.cycle_length || 28}</span>
      </div>
      {latestCycle?.cycle_length && (
        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/30">
          <span className="text-muted-foreground">Last cycle length:</span>
          <span className="font-bold text-primary">{latestCycle.cycle_length} days</span>
        </div>
      )}
    </div>
  );
}