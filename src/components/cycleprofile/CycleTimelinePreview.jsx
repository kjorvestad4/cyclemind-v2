import { PHASE_COLORS, PHASE_LABELS, PMDD_WINDOW_COLOR, calculatePhases } from "@/lib/cycleProfileConfig";
import InfoTooltip from "@/components/cycleprofile/InfoTooltip";

/**
 * Live preview pane: horizontal timeline bar + circular cycle wheel.
 * Updates in real-time as the user changes values.
 */
export default function CycleTimelinePreview({ profile, currentDay, transitionMode }) {
  const phases = calculatePhases(profile);
  const {
    cycleLength, periodLength, ovulationDay,
    follicularLength, lutealLength, pmddWindowDays, pmddWindowStart,
  } = phases;

  // Conic gradient for the cycle wheel
  const periodPct = (periodLength / cycleLength) * 100;
  const ovulationPct = (ovulationDay / cycleLength) * 100;
  const pmddStartPct = ((pmddWindowStart - 1) / cycleLength) * 100;

  const wheelGradient = `conic-gradient(
    ${PHASE_COLORS.menstrual} 0% ${periodPct}%,
    ${PHASE_COLORS.follicular} ${periodPct}% ${ovulationPct - 0.5}%,
    ${PHASE_COLORS.ovulation} ${ovulationPct - 0.5}% ${ovulationPct + 0.5}%,
    ${PHASE_COLORS.luteal} ${ovulationPct + 0.5}% 100%
  )`;

  // PMDD window arc on the wheel (outer ring)
  const pmddArcDeg = (pmddWindowDays / cycleLength) * 360;
  const pmddStartDeg = ((pmddWindowStart - 1) / cycleLength) * 360;

  // Current day marker on wheel
  const currentDayDeg = currentDay ? ((currentDay - 1) / cycleLength) * 360 : null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Preview</p>
        <InfoTooltip text="This preview updates as you change values. The timeline shows your cycle phases and PMDD symptom window." />
      </div>

      {/* Transition mode notice */}
      {transitionMode && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-sm">🔄</span>
          <p className="text-[11px] text-foreground font-medium">Return Window — periods may take weeks or months to resume</p>
        </div>
      )}

      {/* Horizontal timeline bar */}
      <div className={`space-y-2 ${transitionMode ? "opacity-40" : ""}`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Day 1</span>
          <div className="flex-1 relative h-10 rounded-xl overflow-hidden shadow-sm">
            {/* Phase segments */}
            <div className="absolute inset-0 flex">
              <div
                style={{ width: `${periodPct}%`, background: PHASE_COLORS.menstrual }}
                title={`${PHASE_LABELS.menstrual} (${periodLength}d)`}
              />
              <div
                style={{ width: `${(follicularLength / cycleLength) * 100}%`, background: PHASE_COLORS.follicular }}
                title={`${PHASE_LABELS.follicular} (${follicularLength}d)`}
              />
              <div
                style={{ width: `${(1 / cycleLength) * 100}%`, background: PHASE_COLORS.ovulation }}
                title={PHASE_LABELS.ovulation}
              />
              <div
                style={{ width: `${(lutealLength / cycleLength) * 100}%`, background: PHASE_COLORS.luteal }}
                title={`${PHASE_LABELS.luteal} (${lutealLength}d)`}
              />
            </div>

            {/* PMDD window overlay */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: `${pmddStartPct}%`,
                width: `${(pmddWindowDays / cycleLength) * 100}%`,
                background: `${PMDD_WINDOW_COLOR}33`,
                borderTop: `2px solid ${PMDD_WINDOW_COLOR}`,
                borderBottom: `2px solid ${PMDD_WINDOW_COLOR}`,
              }}
            />

            {/* Current day marker */}
            {currentDay && currentDay <= cycleLength && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md pointer-events-none"
                style={{ left: `${((currentDay - 1) / cycleLength) * 100}%` }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary shadow" />
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Day {cycleLength}</span>
        </div>

        {/* Phase labels */}
        <div className="flex flex-wrap gap-3 text-[10px]">
          {[
            { color: PHASE_COLORS.menstrual, label: `${PHASE_LABELS.menstrual} ${periodLength}d` },
            { color: PHASE_COLORS.follicular, label: `${PHASE_LABELS.follicular} ${follicularLength}d` },
            { color: PHASE_COLORS.ovulation, label: `${PHASE_LABELS.ovulation} Day ${ovulationDay}` },
            { color: PHASE_COLORS.luteal, label: `${PHASE_LABELS.luteal} ${lutealLength}d` },
          ].map((seg) => (
            <div key={seg.label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
              <span className="text-muted-foreground">{seg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm border-2" style={{ borderColor: PMDD_WINDOW_COLOR, background: `${PMDD_WINDOW_COLOR}33` }} />
            <span className="text-muted-foreground font-medium">PMDD Window ({pmddWindowDays}d)</span>
          </div>
        </div>
      </div>

      {/* Cycle wheel */}
      <div className={`flex items-center justify-center pt-1 ${transitionMode ? "opacity-40" : ""}`}>
        <div className="relative" style={{ width: 130, height: 130 }}>
          {/* Main wheel */}
          <div
            className="absolute inset-0 rounded-full shadow-md"
            style={{ background: wheelGradient }}
          />
          {/* PMDD window ring */}
          <svg className="absolute inset-0" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="50" cy="50" r="48"
              fill="none"
              stroke={PMDD_WINDOW_COLOR}
              strokeWidth="4"
              strokeDasharray={`${(pmddArcDeg / 360) * 2 * Math.PI * 48} ${2 * Math.PI * 48}`}
              strokeDashoffset={`-${(pmddStartDeg / 360) * 2 * Math.PI * 48}`}
              opacity="0.7"
            />
          </svg>
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-card shadow-inner flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-foreground">{cycleLength}</span>
              <span className="text-[9px] text-muted-foreground -mt-0.5">day cycle</span>
            </div>
          </div>
          {/* Current day marker dot */}
          {currentDayDeg !== null && (
            <div
              className="absolute w-3 h-3 rounded-full bg-white border-2 border-primary shadow-md"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${currentDayDeg}deg) translateX(60px) translate(-50%, -50%)`,
                transformOrigin: "0 0",
              }}
            />
          )}
        </div>
      </div>

      {transitionMode ? (
        <p className="text-center text-[11px] text-muted-foreground italic">
          <strong className="text-foreground">Waiting for cycle to return</strong> — keep logging symptoms
        </p>
      ) : currentDay && (
        <p className="text-center text-[11px] text-muted-foreground">
          You're on <strong className="text-foreground">Day {currentDay}</strong> — {(() => {
            if (currentDay <= periodLength) return "Menstrual phase";
            if (currentDay < ovulationDay) return "Follicular phase";
            if (currentDay === ovulationDay) return "Ovulation day";
            return currentDay >= pmddWindowStart ? "Luteal · PMDD window" : "Luteal phase";
          })()}
        </p>
      )}
    </div>
  );
}