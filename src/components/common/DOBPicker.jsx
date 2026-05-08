import { useState } from "react";
import { format, subYears, addYears } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, X } from "lucide-react";

export default function DOBPicker({ value, onChange, label = "Date of Birth", optional = false }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (value) return new Date(value);
    return subYears(new Date(), 30);
  });

  const handleDateSelect = (day) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const newDate = new Date(year, month, day);
    const isoString = format(newDate, "yyyy-MM-dd");
    onChange(isoString);
    setShowCalendar(false);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDayOfMonth = getFirstDayOfMonth(calendarMonth);
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const minDate = format(subYears(new Date(), 120), "yyyy-MM-dd");
  const maxDate = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {label}
        {optional && <span className="text-muted-foreground font-normal"> (optional)</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="YYYY-MM-DD"
          value={value || ""}
          onChange={(e) => {
            const val = e.target.value.trim();
            if (val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val)) {
              onChange(val);
            }
          }}
          className="h-10 text-base flex-1"
        />
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="h-10 px-3 rounded-md border border-input hover:bg-muted transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <Calendar className="w-4 h-4" />
          📅
        </button>
        {value && (
          <button
            onClick={() => onChange("")}
            className="h-10 px-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <div className="absolute z-50 bg-white dark:bg-slate-950 border border-border rounded-lg p-3 shadow-xl">
          <div className="w-80">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="px-2 py-1 hover:bg-muted rounded text-sm"
              >
                ← Prev
              </button>
              <div className="font-semibold text-center min-w-[120px]">
                {format(calendarMonth, "MMMM yyyy")}
              </div>
              <button
                onClick={handleNextMonth}
                className="px-2 py-1 hover:bg-muted rounded text-sm"
              >
                Next →
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-xs font-semibold text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} />;
                }
                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const dateStr = format(date, "yyyy-MM-dd");
                const isSelected = dateStr === value;
                const isDisabled = dateStr < minDate || dateStr > maxDate;

                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    disabled={isDisabled}
                    className={`
                      h-8 rounded text-sm font-medium transition-colors
                      ${isSelected
                        ? "bg-primary text-primary-foreground"
                        : isDisabled
                        ? "text-muted-foreground opacity-40 cursor-not-allowed"
                        : "hover:bg-muted"
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowCalendar(false)}
              className="w-full mt-3 px-2 py-1 text-sm font-medium rounded hover:bg-muted"
            >
              Close Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}