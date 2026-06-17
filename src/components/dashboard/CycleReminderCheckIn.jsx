import { useState } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Clock, Droplet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CycleReminderCheckIn({ alert, onDismiss }) {
  const navigate = useNavigate();
  const [snoozing, setSnoozing] = useState(false);

  const today = new Date();
  const reminderType = alert.metadata?.reminder_type;
  const daysSinceStart = alert.metadata?.days_since_start;
  const daysLate = alert.metadata?.days_late;

  const handleSnooze = (days) => {
    const snoozeUntil = addDays(today, days);
    localStorage.setItem("dismissed-cycle-reminder", alert.id);
    localStorage.setItem(`cycle-reminder-snooze-${alert.id}`, snoozeUntil.toISOString());
    toast.success(`Reminder snoozed for ${days} day${days > 1 ? 's' : ''}`);
    onDismiss();
  };

  const handleLogPeriod = () => {
    navigate("/log");
    onDismiss();
  };

  // SCENARIO: No period logged, at/beyond cycle end
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Cycle Reminder Check-In
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            {alert.message}
          </p>
          
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              size="sm"
              variant="default"
              className="h-8 text-xs gap-1.5"
              onClick={handleLogPeriod}
            >
              <Droplet className="w-3.5 h-3.5" />
              Log Period
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => handleSnooze(1)}
              disabled={snoozing}
            >
              <Clock className="w-3.5 h-3.5" />
              Remind Tomorrow
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => handleSnooze(7)}
              disabled={snoozing}
            >
              <Clock className="w-3.5 h-3.5" />
              Remind in 1 Week
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}