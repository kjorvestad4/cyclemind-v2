import { useState } from "react";
import { format, subYears, parse, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function DOBPicker({ value, onChange, label = "Date of Birth", optional = false }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (value) return new Date(value);
    return subYears(new Date(), 30);
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

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
          placeholder="May 9, 2026 or 5/9/1991"
          value={isFocused ? inputValue : (value ? (() => {
            const [y, m, d] = value.split("-");
            return format(new Date(parseInt(y), parseInt(m) - 1, parseInt(d)), "MMMM d, yyyy");
          })() : "")}
          onFocus={() => {
            setIsFocused(true);
            if (value) {
              const [y, m, d] = value.split("-");
              setInputValue(format(new Date(parseInt(y), parseInt(m) - 1, parseInt(d)), "MMMM d, yyyy"));
            } else {
              setInputValue("");
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            const input = inputValue.trim();
            if (input === "") {
              onChange("");
            } else {
              let month, day, year;
              // Try M/d/yyyy or M-d-yyyy format
              const slashMatch = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
              if (slashMatch) {
                [, month, day, year] = slashMatch.map(x => parseInt(x, 10));
                onChange(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
                return;
              }
              // Try text formats (MMMM d, yyyy or MMM d, yyyy)
              const formats = ["MMMM d, yyyy", "MMM d, yyyy", "yyyy-MM-dd"];
              for (const fmt of formats) {
                const parsed = parse(input, fmt, new Date());
                if (isValid(parsed)) {
                  onChange(`${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`);
                  return;
                }
              }
            }
          }}
          onChange={(e) => setInputValue(e.target.value)}
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCalendar(false)} />
          <div className="relative bg-white dark:bg-slate-950 border border-border rounded-2xl md:rounded-lg p-4 shadow-xl max-h-[90vh] overflow-y-auto w-full md:w-80">
            {/* Month/Year Pickers */}
            {showMonthPicker ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-center">Select Month</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                    <button
                      key={m}
                      onClick={() => {
                        setCalendarMonth(new Date(calendarMonth.getFullYear(), i));
                        setShowMonthPicker(false);
                      }}
                      className={`py-2 px-2 rounded text-sm font-medium transition-colors ${
                        calendarMonth.getMonth() === i
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowMonthPicker(false)}
                  className="w-full py-2 text-sm font-medium hover:bg-muted rounded transition-colors"
                >
                  Back
                </button>
              </div>
            ) : showYearPicker ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-center">Select Year</p>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {Array.from({ length: 121 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <button
                      key={y}
                      onClick={() => {
                        setCalendarMonth(new Date(y, calendarMonth.getMonth()));
                        setShowYearPicker(false);
                      }}
                      className={`py-2 px-2 rounded text-sm font-medium transition-colors ${
                        calendarMonth.getFullYear() === y
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowYearPicker(false)}
                  className="w-full py-2 text-sm font-medium hover:bg-muted rounded transition-colors"
                >
                  Back
                </button>
              </div>
            ) : (
              <>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3 gap-1">
                  <button onClick={handlePrevMonth} className="px-2 py-1 hover:bg-muted rounded text-sm shrink-0">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 flex-1 justify-center">
                    <button
                      onClick={() => setShowMonthPicker(true)}
                      className="text-sm font-semibold bg-muted hover:bg-muted/80 rounded px-2 py-1 transition-colors"
                    >
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][calendarMonth.getMonth()]}
                    </button>
                    <button
                      onClick={() => setShowYearPicker(true)}
                      className="text-sm font-semibold bg-muted hover:bg-muted/80 rounded px-2 py-1 transition-colors"
                    >
                      {calendarMonth.getFullYear()}
                    </button>
                  </div>
                  <button onClick={handleNextMonth} className="px-2 py-1 hover:bg-muted rounded text-sm shrink-0">
                    <ChevronRight className="w-4 h-4" />
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}