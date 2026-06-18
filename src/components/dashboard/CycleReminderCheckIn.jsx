import { useState } from "react";
import { addDays } from "date-fns";
import { Clock, Droplet, ChevronRight, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CycleReminderCheckIn({ alert, onDismiss }) {
  const navigate = useNavigate();
  const [snoozing, setSnoozing] = useState(false);
  const today = new Date();

  const handleSnooze = (days) => {
    const snoozeUntil = addDays(today, days);
    localStorage.setItem("dismissed-cycle-reminder", alert.id);
    localStorage.setItem(`cycle-reminder-snooze-${alert.id}`, snoozeUntil.toISOString());
    toast.success(`Reminder snoozed for ${days} day${days > 1 ? "s" : ""}`);
    onDismiss();
  };

  const handleLogPeriod = () => {
    navigate("/log");
    onDismiss();
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl px-4 py-3.5 space-y-3">
      {/* Header with accent bar */}
      <div className="flex items-start gap-3 pl-3 border-l-2 border-amber-400 dark:border-amber-500">
        <CalendarClock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground leading-snug">Cycle Check-In</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
        </div>
      </div>

      {/* Inline text actions */}
      <div className="flex items-center gap-2 flex-wrap pl-3">
        <button
          onClick={handleLogPeriod}
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          <Droplet className="w-3.5 h-3.5" />
          Log Period
          <ChevronRight className="w-3 h-3" />
        </button>

        <span className="text-muted-foreground/40 text-xs">·</span>

        <button
          onClick={() => handleSnooze(1)}
          disabled={snoozing}
          className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          Tomorrow
        </button>

        <span className="text-muted-foreground/40 text-xs">·</span>

        <button
          onClick={() => handleSnooze(7)}
          disabled={snoozing}
          className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          In 1 week
        </button>
      </div>
    </div>
  );
}