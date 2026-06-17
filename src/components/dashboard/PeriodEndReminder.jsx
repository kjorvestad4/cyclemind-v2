import { useState } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PeriodEndReminder({ cycle, onDismiss }) {
  const [snoozing, setSnoozing] = useState(false);

  const startDate = new Date(cycle.start_date);
  const expectedEndDate = addDays(startDate, 5);
  const today = new Date();
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const daysOverdue = Math.floor((today - expectedEndDate) / (1000 * 60 * 60 * 24));

  const handleSnooze = (days) => {
    const snoozeUntil = addDays(today, days);
    localStorage.setItem("dismissed-period-end-reminder", cycle.id);
    localStorage.setItem(`period-end-snooze-${cycle.id}`, snoozeUntil.toISOString());
    toast.success(`Reminder snoozed for ${days} day${days > 1 ? 's' : ''}`);
    onDismiss();
  };

  const handleMarkComplete = () => {
    localStorage.setItem("dismissed-period-end-reminder", cycle.id);
    toast.success("Period marked as ended");
    onDismiss();
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Period End Check-in
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            {daysOverdue >= 0 
              ? `Your period started ${daysSinceStart} days ago. Typical periods last 3-7 days.`
              : `Your period started ${daysSinceStart} days ago. Expected to end in ${Math.abs(daysOverdue)} day${Math.abs(daysOverdue) !== 1 ? 's' : ''}.`}
          </p>
          
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              size="sm"
              variant="default"
              className="h-8 text-xs gap-1.5"
              onClick={handleMarkComplete}
            >
              <Check className="w-3.5 h-3.5" />
              Mark as Ended
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