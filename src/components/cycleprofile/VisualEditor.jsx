import { useRef, useCallback } from "react";
import { PHASE_COLORS, PHASE_LABELS, PMDD_WINDOW_COLOR, calculatePhases } from "@/lib/cycleProfileConfig";

/**
 * Full Visual Editor — draggable phase timeline.
 * User drags dividers for Period / Follicular / Ovulation / Luteal.
 * Real-time recalculation of follicular length.
 * PMDD symptom window overlay slider.
 */
export default function VisualEditor({ profile, setProfile }) {
  const barRef = useRef(null);
  const phases = calculatePhases(profile);
  const { cycleLength, periodLength, ovulationDay, follicularLength, lutealLength, pmddWindowDays, pmddWindowStart } = phases;

  const pct = (day) => (day / cycleLength) * 100;

  const handleDrag = useCallback((e, divider) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dayPct = Math.max(0, Math.min(1, x / rect.width));
    const newDay = Math.round(dayPct * cycleLength);

    if (divider === "period") {
      const pl = Math.max(2, Math.min(newDay, ovulationDay - 2));
      setProfile(prev => ({ ...prev, periodLength: pl }));
    } else if (divider === "ovulation") {
      // ovulationDay must be after period + 1 and leave room for luteal
      const minDay = periodLength + 2;
      const maxDay = cycleLength - 7; // leave at least 7 days for luteal
      const od = Math.max(minDay, Math.min(newDay, maxDay));
      const newLuteal = cycleLength - od;
      setProfile(prev => ({ ...prev, lutealLength: newLuteal }));
    } else if (divider === "cycleEnd") {
      const cl = Math.max(ovulationDay + 8, Math.min(45, Math.max(21, newDay)));
      const newLuteal = cl - ovulationDay;
      setProfile(prev => ({ ...prev, cycleLength: cl, lutealLength: newLuteal }));
    }
  }, [barRef, cycleLength, periodLength, ovulationDay, setProfile]);

  const startDrag = (divider) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const onMove = (ev) => handleDrag(ev, divider);
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const handlePmddWindow = (val) => {
    const pw = Math.max(5, Math.min(14, val));
    setProfile(prev => ({ ...prev, pmddWindowDays: pw }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Visual Phase Editor</p>
        <span className="text-[10px] text-muted-foreground">Drag the handles →</span>
      </div>

      {/* Draggable timeline */}
      <div className="relative pt-2 pb-6">
        {/* Day markers */}
        <div className="flex justify-between text-[9px] text-muted-foreground mb-1 px-0.5">
          {Array.from({ length: 5 }, (_, i) => {
            const day = Math.round((i / 4) * cycleLength);
            return <span key={i}>D{day || 1}</span>;
          })}
        </div>

        <div
          ref={barRef}
          className="relative h-14 rounded-xl overflow-hidden shadow-sm cursor-default"
        >
          {/* Phase segments */}
          <div className="absolute inset-0 flex">
            <div style={{ width: `${pct(periodLength)}%`, background: PHASE_COLORS.menstrual }} />
            <div style={{ width: `${pct(follicularLength)}%`, background: PHASE_COLORS.follicular }} />
            <div style={{ width: `${pct(1)}%`, background: PHASE_COLORS.ovulation }} />
            <div style={{ width: `${pct(lutealLength)}%`, background: PHASE_COLORS.luteal }} />
          </div>

          {/* PMDD window overlay */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `${pct(pmddWindowStart - 1)}%`,
              width: `${pct(pmddWindowDays)}%`,
              background: `${PMDD_WINDOW_COLOR}30`,
              borderTop: `2px solid ${PMDD_WINDOW_COLOR}`,
              borderBottom: `2px solid ${PMDD_WINDOW_COLOR}`,
            }}
          />

          {/* Phase labels inside bar */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none text-[10px] font-semibold text-white/90">
            <span style={{ width: `${pct(periodLength)}%` }} className="text-center">{periodLength}d</span>
            <span style={{ width: `${pct(follicularLength)}%` }} className="text-center">{follicularLength}d</span>
            <span style={{ width: `${pct(1)}%` }} className="text-center">●</span>
            <span style={{ width: `${pct(lutealLength)}%` }} className="text-center">{lutealLength}d</span>
          </div>

          {/* Draggable divider: Period end */}
          <DragHandle
            positionPct={pct(periodLength)}
            onPointerDown={startDrag("period")}
            color={PHASE_COLORS.menstrual}
            label={`Period ends: Day ${periodLength}`}
          />
          {/* Draggable divider: Ovulation */}
          <DragHandle
            positionPct={pct(ovulationDay)}
            onPointerDown={startDrag("ovulation")}
            color={PHASE_COLORS.ovulation}
            label={`Ovulation: Day ${ovulationDay}`}
          />
          {/* Draggable divider: Cycle end */}
          <DragHandle
            positionPct={100}
            onPointerDown={startDrag("cycleEnd")}
            color={PHASE_COLORS.luteal}
            label={`Cycle end: Day ${cycleLength}`}
          />
        </div>

        {/* PMDD window label */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-2.5 h-2.5 rounded-sm border-2" style={{ borderColor: PMDD_WINDOW_COLOR, background: `${PMDD_WINDOW_COLOR}30` }} />
          <span className="text-[10px] text-muted-foreground">
            PMDD Window: Days {pmddWindowStart}–{cycleLength} ({pmddWindowDays}d)
          </span>
        </div>
      </div>

      {/* Phase summary cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: PHASE_LABELS.menstrual, days: periodLength, color: PHASE_COLORS.menstrual },
          { label: PHASE_LABELS.follicular, days: follicularLength, color: PHASE_COLORS.follicular },
          { label: PHASE_LABELS.ovulation, days: 1, color: PHASE_COLORS.ovulation },
          { label: PHASE_LABELS.luteal, days: lutealLength, color: PHASE_COLORS.luteal },
        ].map(p => (
          <div key={p.label} className="rounded-xl border border-border/50 p-2.5 text-center">
            <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: p.color }} />
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{p.label}</p>
            <p className="text-sm font-bold text-foreground">{p.days}d</p>
          </div>
        ))}
      </div>

      {/* PMDD window slider */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground">PMDD Symptom Window</label>
          <span className="text-xs font-bold text-primary">{pmddWindowDays} days</span>
        </div>
        <input
          type="range"
          min={5}
          max={14}
          value={pmddWindowDays}
          onChange={(e) => handlePmddWindow(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: PMDD_WINDOW_COLOR }}
        />
        <p className="text-[10px] text-muted-foreground">
          Last {pmddWindowDays} days of luteal phase — when PMDD symptoms typically peak.
        </p>
      </div>
    </div>
  );
}

function DragHandle({ positionPct, onPointerDown, color, label }) {
  return (
    <div
      className="absolute top-0 bottom-0 z-10 cursor-ew-resize group"
      style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
      onPointerDown={onPointerDown}
    >
      {/* Visual handle */}
      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-9 rounded-full bg-white shadow-lg border-2 flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ borderColor: color }}
      >
        <div className="flex flex-col gap-0.5">
          <div className="w-2 h-0.5 rounded-full" style={{ background: color }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: color }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: color }} />
        </div>
      </div>
      {/* Label on hover */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold px-2 py-0.5 rounded-md bg-popover border border-border shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {label}
      </div>
    </div>
  );
}