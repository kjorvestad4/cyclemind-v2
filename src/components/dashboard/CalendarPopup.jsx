import { useState } from "react";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Droplet, Heart, Sparkles, Baby, AlertCircle, Info } from "lucide-react";
import { calculateDayTotal } from "@/lib/symptoms";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CalendarPopup({ isOpen, onClose, entries, cycles, cycleType, cycleLength = 28, ovulationDay = 14, menstruationLength = 5 }) {
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

  // Toggleable quick log mutations - must be at top level before conditional return
  const toggleBleedingMutation = useMutation({
    mutationFn: async (dateStr) => {
      const entry = entries.find((e) => e.date === dateStr);
      const currentIntensity = entry?.bleeding_intensity || 0;
      const newIntensity = currentIntensity > 0 ? 0 : 2;
      const data = { bleeding_intensity: newIntensity };
      if (entry?.id) {
        await base44.entities.DailyEntry.update(entry.id, data);
      } else {
        await base44.entities.DailyEntry.create({ date: dateStr, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  const toggleOvulationMutation = useMutation({
    mutationFn: async (dateStr) => {
      const entry = entries.find((e) => e.date === dateStr);
      const hasOvulation = !!(entry?.ovulation_test === "LH Surge" || entry?.ovulation_test === "Positive");
      const data = {
        ovulation_test: hasOvulation ? "" : "LH Surge",
        ovulation_date: hasOvulation ? "" : dateStr,
      };
      if (entry?.id) {
        await base44.entities.DailyEntry.update(entry.id, data);
      } else {
        await base44.entities.DailyEntry.create({ date: dateStr, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  const toggleIntimacyMutation = useMutation({
    mutationFn: async (dateStr) => {
      const entry = entries.find((e) => e.date === dateStr);
      const hasIntimacy = !!entry?.intimacy_logged;
      const data = { intimacy_logged: !hasIntimacy };
      if (entry?.id) {
        await base44.entities.DailyEntry.update(entry.id, data);
      } else {
        await base44.entities.DailyEntry.create({ date: dateStr, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
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

  // Get phase info for menstrual cycle — projects 6+ cycles into the future
  const getPhaseColor = (dateStr) => {
    if (!["menstrual", "perimenopause"].includes(cycleType)) return null;
    const latestCycle = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
    if (!latestCycle) return null;

    const useCycleLength = cycleLength || latestCycle.cycle_length || 28;
    const lmpStr = latestCycle.last_menstrual_period || latestCycle.start_date;
    const lmp = new Date(lmpStr);
    const dateObj = new Date(dateStr);

    // Total days from LMP
    const totalDays = Math.floor((dateObj - lmp) / 86400000);
    if (totalDays < 0) return null;

    // Only show up to 6 full cycles ahead
    const maxDays = useCycleLength * 7;
    if (totalDays > maxDays) return null;

    // Day within the current projected cycle (1-based)
    const dayInCycle = (totalDays % useCycleLength) + 1;

    if (dayInCycle <= menstruationLength) return "🌙"; // Menstrual
    if (dayInCycle <= (ovulationDay - 3)) return "🌱"; // Follicular
    if (dayInCycle <= (ovulationDay + 3)) return "🌸"; // Fertility Window
    return "🍂"; // Luteal
  };

  // Extract key data from entry for rich markers
  const getEntryMarkers = (entry) => {
    if (!entry) return { bleedingIntensity: 0, hasOvulation: false, hasIntimacy: false };
    return {
      bleedingIntensity: entry.bleeding_intensity || 0,
      hasOvulation: !!(entry.ovulation_test === "LH Surge" || entry.ovulation_test === "Positive" || entry.ovulation_date),
      hasIntimacy: !!entry.intimacy_logged,
      moodLevel: !!(entry.s_mood_swings > 4 || entry.s_anxious > 4 || entry.s_depressed > 4),
    };
  };



  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const title = cycleType === "postpartum" ? "View History" : cycleType === "pregnancy" ? "View History" : "Cycle Calendar";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center" 
      onClick={onClose}
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
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
        <div className="flex items-center justify-between px-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMonth(new Date(currentYear, currentMonth - 1))}
            className="h-10 w-10 hover:bg-muted rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </Button>
          <p className="text-base font-bold text-center flex-1">{format(viewMonth, "MMMM yyyy")}</p>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMonth(new Date(currentYear, currentMonth + 1))}
            className="h-10 w-10 hover:bg-muted rounded-xl"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-3 bg-white dark:bg-slate-950/50 rounded-2xl p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-3 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest h-8 flex items-center justify-center">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-3">
            {days.map((day, idx) => {
              if (!day) return <div key={idx} className="h-16" />;

              const dateStr = format(new Date(currentYear, currentMonth, day), "yyyy-MM-dd");
              const isToday = dateStr === format(now, "yyyy-MM-dd");
              const severity = getSeverity(dateStr);
              const entry = entryMap[dateStr];
              const markers = getEntryMarkers(entry);
              const phaseEmoji = getPhaseColor(dateStr);
              const severityColor = getSeverityColor(severity);

              return (
                <div key={idx} className="relative group">
                  <button
                     onClick={() => setSelectedDateInfo({ dateStr, entry, markers })}
                     className={`h-16 w-full rounded-2xl p-2 flex flex-col items-center justify-between text-xs font-medium transition-all active:scale-95 cursor-pointer relative border-2 ${
                       isToday
                         ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                         : severityColor 
                         ? severityColor + " border-transparent"
                         : "bg-white dark:bg-slate-900 border-border hover:border-primary hover:shadow-sm"
                     }`}
                     title={`${dateStr}${severity ? ` · Severity ${Math.round(severity)}%` : ""}`}
                   >
                     <div className="flex flex-col items-center gap-0.5 flex-1 justify-start">
                       <span className={`text-lg font-bold leading-none ${isToday ? "text-primary" : ""}`}>{day}</span>
                     </div>

                     <div className="flex flex-col items-center gap-1 flex-1 justify-center">
                       {phaseEmoji && <span className="text-lg leading-none">{phaseEmoji}</span>}
                     </div>

                     {/* Rich markers at bottom */}
                     {entry && (
                       <div className="flex items-center justify-center gap-1 w-full mt-auto">
                         {markers.bleedingIntensity > 0 && (
                           <Droplet className={`fill-red-500 text-red-500 ${markers.bleedingIntensity > 3 ? "h-2.5 w-2.5" : "h-2 w-2"}`} />
                         )}
                         {markers.hasOvulation && (
                           <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                         )}
                         {markers.hasIntimacy && (
                           <Heart className="h-2.5 w-2.5 text-pink-500 fill-pink-500" />
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
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-primary rounded-full p-1 shadow-sm"
                    >
                      <Info className="h-3 w-3 text-primary-foreground" />
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
                {/* Clinical Scores */}
                  {selectedDateInfo.entry && (
                    <div className="space-y-1">
                      {cycleType === "menstrual" && (
                        <>
                          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">DRSP</span>
                            <span className="font-bold text-primary">{calculateDayTotal(selectedDateInfo.entry)}</span>
                          </div>
                          {selectedDateInfo.entry.phq9_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">PHQ-9</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.phq9_score} / 27</span>
                            </div>
                          )}
                          {selectedDateInfo.entry.gad7_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">GAD-7</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.gad7_score} / 21</span>
                            </div>
                          )}
                        </>
                      )}

                      {cycleType === "pregnancy" && (
                        <>
                          {(() => {
                            const pregnancySymptoms = ["p_nausea", "p_vomiting", "p_fatigue", "p_mood_changes", "p_sleep_issues"];
                            const total = pregnancySymptoms.reduce((sum, key) => sum + (selectedDateInfo.entry[key] || 0), 0);
                            return total > 0 ? (
                              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                                <span className="text-muted-foreground">Pregnancy Symptoms</span>
                                <span className="font-bold text-primary">{total}</span>
                              </div>
                            ) : null;
                          })()}
                          {selectedDateInfo.entry.epds_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">EPDS</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.epds_score} / 30</span>
                            </div>
                          )}
                          {selectedDateInfo.entry.phq9_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">PHQ-9</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.phq9_score} / 27</span>
                            </div>
                          )}
                          {selectedDateInfo.entry.gad7_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">GAD-7</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.gad7_score} / 21</span>
                            </div>
                          )}
                        </>
                      )}

                      {cycleType === "postpartum" && (
                        <>
                          {(() => {
                            const postpartumSymptoms = ["pp_lochiaBleeding", "pp_perinealPain", "pp_incisionPain", "pp_breastEngorgement", "pp_fatigue", "pp_moodChanges"];
                            const total = postpartumSymptoms.reduce((sum, key) => sum + (selectedDateInfo.entry[key] || 0), 0);
                            return total > 0 ? (
                              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                                <span className="text-muted-foreground">Postpartum Symptoms</span>
                                <span className="font-bold text-primary">{total}</span>
                              </div>
                            ) : null;
                          })()}
                          {selectedDateInfo.entry.epds_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">EPDS</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.epds_score} / 30</span>
                            </div>
                          )}
                          {selectedDateInfo.entry.phq9_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">PHQ-9</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.phq9_score} / 27</span>
                            </div>
                          )}
                          {selectedDateInfo.entry.gad7_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">GAD-7</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.gad7_score} / 21</span>
                            </div>
                          )}
                        </>
                      )}

                      {(cycleType === "menopause" || cycleType === "perimenopause") && (
                        <>
                          {selectedDateInfo.entry.m_hot_flashes > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">Hot Flashes</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.m_hot_flashes} / 6</span>
                            </div>
                          )}
                          {(() => {
                            const menopauseSymptoms = ["m_night_sweats", "m_vaginal_dryness", "m_mood_swings", "m_brain_fog", "m_fatigue"];
                            const total = menopauseSymptoms.reduce((sum, key) => sum + (selectedDateInfo.entry[key] || 0), 0);
                            return total > 0 ? (
                              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                                <span className="text-muted-foreground">Peri/Menopause Symptoms</span>
                                <span className="font-bold text-primary">{total}</span>
                              </div>
                            ) : null;
                          })()}
                          {selectedDateInfo.entry.phq9_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">PHQ-9</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.phq9_score} / 27</span>
                            </div>
                          )}
                          {selectedDateInfo.entry.gad7_score > 0 && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                              <span className="text-muted-foreground">GAD-7</span>
                              <span className="font-bold text-primary">{selectedDateInfo.entry.gad7_score} / 21</span>
                            </div>
                          )}
                        </>
                      )}
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

                    {selectedDateInfo.entry.journal_entry && (
                      <div className="text-xs p-2 rounded bg-muted italic text-muted-foreground line-clamp-2">
                        "{selectedDateInfo.entry.journal_entry}"
                      </div>
                    )}
                  </>
                )}

                {/* Quick toggle buttons */}
                {["menstrual", "perimenopause"].includes(cycleType) && (
                   <div className="space-y-2 pt-2 border-t border-border/40">
                    <Button
                      onClick={() => {
                        toggleBleedingMutation.mutate(selectedDateInfo.dateStr);
                        setSelectedDateInfo(null);
                      }}
                      disabled={toggleBleedingMutation.isPending}
                      className={`w-full h-8 gap-1.5 text-xs font-semibold transition-all rounded-lg ${
                        selectedDateInfo.markers.bleedingIntensity > 0
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-card border border-border text-muted-foreground hover:border-red-500/50"
                      }`}
                    >
                      <Droplet className="h-3 w-3" />
                      {selectedDateInfo.markers.bleedingIntensity > 0 ? "Remove" : "Add"} Bleeding
                    </Button>
                    <Button
                      onClick={() => {
                        toggleIntimacyMutation.mutate(selectedDateInfo.dateStr);
                        setSelectedDateInfo(null);
                      }}
                      disabled={toggleIntimacyMutation.isPending}
                      className={`w-full h-8 gap-1.5 text-xs font-semibold transition-all rounded-lg ${
                        selectedDateInfo.markers.hasIntimacy
                          ? "bg-pink-500 hover:bg-pink-600 text-white"
                          : "bg-card border border-border text-muted-foreground hover:border-pink-500/50"
                      }`}
                    >
                      <Heart className="h-3 w-3" />
                      {selectedDateInfo.markers.hasIntimacy ? "Remove" : "Add"} Intimacy
                    </Button>
                    <Button
                      onClick={() => {
                        toggleOvulationMutation.mutate(selectedDateInfo.dateStr);
                        setSelectedDateInfo(null);
                      }}
                      disabled={toggleOvulationMutation.isPending}
                      className={`w-full h-8 gap-1.5 text-xs font-semibold transition-all rounded-lg ${
                        selectedDateInfo.markers.hasOvulation
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-card border border-border text-muted-foreground hover:border-amber-500/50"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {selectedDateInfo.markers.hasOvulation ? "Remove" : "Add"} Ovulation
                    </Button>
                  </div>
                )}

                {/* User Input Data Display */}
                <div className="bg-muted/50 rounded-lg p-2.5 space-y-1.5 border border-border/40 my-2">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Logged Data</p>
                  <div className="space-y-1 text-[11px]">
                    {selectedDateInfo.entry?.bleeding_intensity > 0 && (
                      <div className="flex items-center gap-2">
                        <Droplet className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />
                        <span className="text-foreground">
                          Bleeding: {selectedDateInfo.entry.menstrual_flow === "H" ? "Heavy" : selectedDateInfo.entry.menstrual_flow === "M" ? "Medium" : selectedDateInfo.entry.menstrual_flow === "L" ? "Light" : `Intensity ${selectedDateInfo.entry.bleeding_intensity}`}
                        </span>
                      </div>
                    )}
                    {selectedDateInfo.entry?.intimacy_logged && (
                      <div className="flex items-center gap-2">
                        <Heart className="h-2.5 w-2.5 text-pink-500 fill-pink-500 flex-shrink-0" />
                        <span className="text-foreground">
                          Intimacy {selectedDateInfo.entry.intimacy_protected === false ? "• Unprotected" : selectedDateInfo.entry.intimacy_protected === true ? "• Protected" : ""}
                        </span>
                      </div>
                    )}
                    {selectedDateInfo.markers.hasOvulation && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-2.5 w-2.5 text-amber-400 flex-shrink-0" />
                        <span className="text-foreground">Ovulation: {selectedDateInfo.entry?.ovulation_test || "Detected"}</span>
                      </div>
                    )}
                    {selectedDateInfo.markers.moodLevel && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-2.5 w-2.5 text-orange-500 flex-shrink-0" />
                        <span className="text-foreground">Elevated mood/anxiety</span>
                      </div>
                    )}
                    {!selectedDateInfo.entry?.bleeding_intensity && !selectedDateInfo.entry?.intimacy_logged && !selectedDateInfo.markers.hasOvulation && !selectedDateInfo.markers.moodLevel && (
                      <span className="text-muted-foreground text-[11px]">No logged data</span>
                    )}
                  </div>
                </div>

                <Button
                   onClick={() => {
                     window.location.href = `/log?date=${selectedDateInfo.dateStr}`;
                     setSelectedDateInfo(null);
                   }}
                   className="w-full h-9 text-xs gap-1"
                 >
                   Go to Log Date →
                 </Button>
                 </div>
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

          {["menstrual", "perimenopause"].includes(cycleType) && (
            <div className="pt-2 border-t border-border/40 space-y-1">
              <p className="font-semibold text-foreground">Cycle Phase:</p>
              <div className="grid grid-cols-2 gap-1">
                <span>🌙 Menstrual</span>
                <span>🌱 Follicular</span>
                <span>🌸 Fertility Window</span>
                <span>🍂 Luteal</span>
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