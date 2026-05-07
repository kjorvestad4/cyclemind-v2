import { format } from "date-fns";
import { calculateEDD, getPregnancyWeek } from "@/lib/eddCalculation";
import { Calendar, AlertCircle } from "lucide-react";

export default function EDDDisplay({ lmp, ovulationDate, estimatedDueDate, pregnancyWeek }) {
  if (!lmp && !ovulationDate && !estimatedDueDate) return null;

  // Calculate EDD if not provided (ovulation takes priority)
  let eddData = null;
  let displayWeek = pregnancyWeek;

  if (!estimatedDueDate && (lmp || ovulationDate)) {
    eddData = calculateEDD(ovulationDate, lmp);
    const baselineDate = ovulationDate || lmp;
    displayWeek = getPregnancyWeek(baselineDate, new Date());
  }

  const edd = estimatedDueDate || eddData?.edd;
  const method = eddData?.method || (ovulationDate ? "ovulation" : "lmp");

  if (!edd) return null;

  const trimesterMap = {
    1: "first",
    2: "second",
    3: "third",
  };

  const getTrimester = (week) => {
    if (!week) return null;
    if (week <= 12) return "first";
    if (week <= 27) return "second";
    return "third";
  };

  const trimester = getTrimesterName(getTrimester(displayWeek));

  return (
    <div className="rounded-2xl border-2 border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-pink-600 dark:text-pink-300 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          {/* EDD */}
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Estimated Due Date
            </p>
            <p className="text-lg font-bold text-pink-700 dark:text-pink-200">
              {format(new Date(edd), "MMMM d, yyyy")}
            </p>
            <p className="text-[11px] text-pink-600 dark:text-pink-300 mt-0.5">
              Based on {method === "ovulation" ? "ovulation date" : "LMP"}
              {ovulationDate && lmp && method === "ovulation" && " (LMP also on file)"}
            </p>
          </div>

          {/* Week and Trimester */}
          {displayWeek && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pink-200 dark:border-pink-800">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Current Week</p>
                <p className="text-base font-bold text-pink-700 dark:text-pink-200">Week {displayWeek}</p>
              </div>
              {trimester && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Trimester</p>
                  <p className="text-base font-bold text-pink-700 dark:text-pink-200 capitalize">
                    {trimester}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Helpful note */}
          <p className="text-[10px] text-muted-foreground italic pt-2">
            💡 Standard calculation: 280 days from LMP, or 266 days from ovulation. Consult your healthcare provider for personalized dating.
          </p>
        </div>
      </div>
    </div>
  );
}

function getTrimesterName(trimester) {
  const names = { first: "First", second: "Second", third: "Third" };
  return names[trimester] || null;
}