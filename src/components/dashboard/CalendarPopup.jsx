import { useState } from "react";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Droplet, Heart, Sparkles, Baby, AlertCircle, Info } from "lucide-react";
import { calculateDayTotal } from "@/lib/symptoms";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CalendarPopup({ isOpen, onClose, entries, cycles, cycleType }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const queryClient = useQueryClient();

  // Quick logging mutation - must be at top level
  const quickLogMutation = useMutation({
    mutationFn: async ({ dateStr, field, value }) => {
      const entry = entryMap[dateStr];
      const data = { [field]: value };
      if (entry?.id) {
        await base44.entities.DailyEntry.update(entry.id, data);
      } else {
        await base44.entities.DailyEntry.create({ date: dateStr, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Updated!");
    },
  });

  if (!isOpen) return null;

  const now = new Date();
  const currentMonth = viewMonth.getMonth();
  const currentYear = viewMonth.getFullYear();
  const daysInMonth = getDaysInMonth(viewMonth);
  const firstDay = getDay(startOfMonth(viewMonth));

  // Map entries to dates for severity lookup
  const entryMap = {};
  entries.forEach((e) => {
    entryMap[e.date] = e;
  });

  // Calculate severity for a date based on cycle type
  const getSeverity = (dateStr) => {
    const entry = entryMap[dateStr];
    if (!entry) return null;

    if (cycleType === "postpartum") {
      return entry.epds_score ? Math.min(100, entry.epds_score / 30 * 100) : null;
    } else if (cycleType === "pregnancy") {
      const pregnancySymptoms = ["p_nausea", "p_vomiting", "p_fatigue", "p_mood_changes", "p_sleep_issues"];
      const avg = pregnancySymptoms.reduce((sum, key) => sum + (entry[key] || 0), 0) / pregnancySymptoms.length;
      return avg > 0 ? (avg / 6) * 100 : null;
    } else if (["perimenopause", "menopause"].includes(cycleType)) {
      const menopauseSymptoms = ["m_hot_flashes", "m_night_sweats", "m_vaginal_dryness", "m_mood_swings", "m_brain_fog"];
      const avg = menopauseSymptoms.reduce((sum, key) => sum + (entry[key] || 0), 0) / menopauseSymptoms.length;
      return avg > 0 ? (avg / 6) * 100 : null;
    } else {
      // Menstrual: use DRSP average
      return calculateDayTotal(entry) / 6 * 100;
    }
  };

  const getSeverityColor = (severity) => {
    if (!severity) return "bg-muted text-muted-foreground";
    if (severity < 25) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    if (severity < 50) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
    if (severity < 75) return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  };

  // Get phase info for menstrual cycle
  const getPhaseColor = (dateStr) => {
    const latestCycle = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
    if (!latestCycle || cycleType !== "menstrual") return null;

    const cycleStart = new Date(latestCycle.start_date);
    const dateObj = new Date(dateStr);
    const dayInCycle = Math.floor((dateObj - cycleStart) / 86400000) + 1;
    const cycleLength = latestCycle.cycle_length || 28;

    if (dayInCycle < 1 || dayInCycle > cycleLength) return null;

    if (dayInCycle <= 5) return "🌙"; // Menstrual
    if (dayInCycle <= 12) return "🌱"; // Follicular
    if (dayInCycle >= 12 && dayInCycle <= 16) return "💜"; // Ovulatory
    return "🌊"; // Luteal
  };

  // Extract key data from entry for rich markers
  const getEntryMarkers = (entry) => {
    if (!entry) return { bleedingIntensity: 0, hasOvulation: false, hasIntimacy: false };
    return {
      bleedingIntensity: entry.bleeding_intensity || 0,
      hasOvulation: !!(entry.ovulation_test === "LH Surge" || entry.ovulation_test === "Positive" || entry.ovulation_date),
      hasIntimacy: !!entry.intimacy_logged, // Assumes intimacy field exists
      moodLevel: !!(entry.s_mood_swings > 4 || entry.s_anxious > 4 || entry.s_depressed > 4),
    };
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const title = cycleType === "postpartum" ? "View History" : cycleType === "pregnancy" ? "View History" : "Cycle Calendar";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setViewMonth(new Date(currentYear, currentMonth - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <p className="text-sm font-semibold">{format(viewMonth, "MMMM yyyy")}</p>
          <Button variant="ghost" size="icon" onClick={() => setViewMonth(new Date(currentYear, currentMonth + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (!day) return <div key={idx} className="aspect-square" />;

              const dateStr = format(new Date(currentYear, currentMonth, day), "yyyy-MM-dd");
              const severity = getSeverity(dateStr);
              const entry = entryMap[dateStr];
              const markers = getEntryMarkers(entry);
              const phaseEmoji = getPhaseColor(dateStr);
              const severityColor = getSeverityColor(severity);

              return (
                <div key={idx} className="relative group">
                  <button
                     onClick={() => window.location.href = `/log?date=${dateStr}`}
                     className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-all active:scale-95 cursor-pointer relative overflow-hidden ${
                       severityColor || "bg-card border border-border hover:border-primary"
                     }`}
                     title={`${dateStr}${severity ? ` · Severity ${Math.round(severity)}%` : ""}`}
                   >
                     <span className="text-xs z-10 font-bold leading-none">{day}</span>
                     {phaseEmoji && <span className="text-[11px] z-10">{phaseEmoji}</span>}

                    {/* Rich markers overlay */}
                    {entry && (
                      <div className="absolute bottom-0.5 left-0 right-0 flex items-center justify-center gap-0.5 z-20">
                        {markers.bleedingIntensity > 0 && (
                          <Droplet className={`h-2 w-2 fill-red-500 text-red-500 ${markers.bleedingIntensity > 3 ? "h-3 w-3" : ""}`} />
                        )}
                        {markers.hasOvulation && (
                          <Sparkles className="h-2 w-2 text-amber-400" />
                        )}
                        {markers.hasIntimacy && (
                          <Heart className="h-2 w-2 text-pink-500 fill-pink-500" />
                        )}
                        {markers.moodLevel && severity > 50 && (
                          <AlertCircle className="h-2 w-2 text-orange-500" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Info button */}
                  {entry && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateInfo({ dateStr, entry, markers });
                      }}
                      className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-primary rounded-full p-0.5"
                    >
                      <Info className="h-2.5 w-2.5 text-primary-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Summary Popup */}
        {selectedDateInfo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedDateInfo(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              className="relative bg-background rounded-2xl border border-border shadow-xl p-4 max-w-xs w-full space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-semibold">
                  {format(new Date(selectedDateInfo.dateStr), "EEE, MMM d")}
                </h4>
                <button
                  onClick={() => setSelectedDateInfo(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                {/* Score */}
                {getSeverity(selectedDateInfo.dateStr) && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Overall Severity</span>
                    <span className="font-bold text-primary">{Math.round(getSeverity(selectedDateInfo.dateStr))}%</span>
                  </div>
                )}

                {/* Key symptoms */}
                {selectedDateInfo.entry && (
                  <>
                    {selectedDateInfo.entry.menstrual_flow && (
                      <div className="flex items-center gap-2 text-xs">
                        <Droplet className="h-3 w-3 text-red-500" />
                        <span>Flow: {selectedDateInfo.entry.menstrual_flow === "H" ? "Heavy" : selectedDateInfo.entry.menstrual_flow === "M" ? "Medium" : "Light"}</span>
                      </div>
                    )}
                    {selectedDateInfo.markers.hasOvulation && (
                      <div className="flex items-center gap-2 text-xs">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>Ovulation detected</span>
                      </div>
                    )}
                    {selectedDateInfo.entry.epds_score > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span>EPDS: {selectedDateInfo.entry.epds_score}</span>
                      </div>
                    )}
                    {selectedDateInfo.entry.journal_entry && (
                      <div className="text-xs p-2 rounded bg-muted italic text-muted-foreground line-clamp-2">
                        "{selectedDateInfo.entry.journal_entry}"
                      </div>
                    )}
                  </>
                )}

                <Button
                  onClick={() => {
                    window.location.href = `/log?date=${selectedDateInfo.dateStr}`;
                    setSelectedDateInfo(null);
                  }}
                  className="w-full h-9 text-xs gap-1"
                >
                  Edit Entry →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick logging buttons - Menstrual/Perimenopause modes */}
        {["menstrual", "perimenopause"].includes(cycleType) && (
          <div className="bg-muted/40 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Quick Log (Today)</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = format(new Date(), "yyyy-MM-dd");
                  quickLogMutation.mutate({ dateStr: today, field: "bleeding_intensity", value: 2 });
                }}
                disabled={quickLogMutation.isPending}
                className="flex-1 gap-1 text-xs h-9"
              >
                <Droplet className="h-3 w-3" /> Log Bleeding
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = format(new Date(), "yyyy-MM-dd");
                  quickLogMutation.mutate({ dateStr: today, field: "ovulation_test", value: "LH Surge" });
                }}
                disabled={quickLogMutation.isPending}
                className="flex-1 gap-1 text-xs h-9"
              >
                <Sparkles className="h-3 w-3" /> Ovulation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = format(new Date(), "yyyy-MM-dd");
                  quickLogMutation.mutate({ dateStr: today, field: "intimacy_logged", value: true });
                }}
                disabled={quickLogMutation.isPending}
                className="flex-1 gap-1 text-xs h-9"
              >
                <Heart className="h-3 w-3" /> Intimacy
              </Button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-muted/40 rounded-xl p-3 space-y-2 text-[10px]">
          <p className="font-semibold text-foreground">Severity Legend:</p>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950" />
              <span>Minimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-950" />
              <span>Mild</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-950" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950" />
              <span>Severe</span>
            </div>
          </div>

          {/* Marker icons legend */}
          <div className="pt-2 border-t border-border/40 space-y-1">
            <p className="font-semibold text-foreground">Markers:</p>
            <div className="grid grid-cols-2 gap-1 text-[9px]">
              <div className="flex items-center gap-1.5">
                <Droplet className="h-2.5 w-2.5 text-red-500 fill-red-500" /> Bleeding
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-2.5 w-2.5 text-amber-400" /> Ovulation
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-2.5 w-2.5 text-pink-500 fill-pink-500" /> Intimacy
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-2.5 w-2.5 text-orange-500" /> Mood/Anxiety
              </div>
            </div>
          </div>

          {cycleType === "menstrual" && (
            <div className="pt-2 border-t border-border/40 space-y-1">
              <p className="font-semibold text-foreground">Cycle Phase:</p>
              <div className="grid grid-cols-2 gap-1">
                <span>🌙 Menstrual</span>
                <span>🌱 Follicular</span>
                <span>💜 Ovulatory</span>
                <span>🌊 Luteal</span>
              </div>
            </div>
          )}
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}