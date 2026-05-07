import { format, addDays, differenceInDays } from "date-fns";

/**
 * Calculate Estimated Due Date (EDD)
 * Prioritizes ovulation-based calculation (38 weeks from ovulation)
 * Falls back to LMP-based (40 weeks from LMP)
 * Returns { edd, baselineDate, method } where method is "ovulation" or "lmp"
 */
export function calculateEDD(ovulationDate, lmpDate) {
  if (!ovulationDate && !lmpDate) return null;

  // Ovulation-based: EDD = ovulation date + 266 days (38 weeks)
  if (ovulationDate) {
    const eddDate = addDays(new Date(ovulationDate), 266);
    return {
      edd: format(eddDate, "yyyy-MM-dd"),
      baselineDate: ovulationDate,
      method: "ovulation",
    };
  }

  // LMP-based: EDD = LMP + 280 days (40 weeks, Naegele's rule)
  if (lmpDate) {
    const eddDate = addDays(new Date(lmpDate), 280);
    return {
      edd: format(eddDate, "yyyy-MM-dd"),
      baselineDate: lmpDate,
      method: "lmp",
    };
  }

  return null;
}

/**
 * Get pregnancy week from LMP or ovulation date
 */
export function getPregnancyWeek(baselineDate, currentDate = new Date()) {
  if (!baselineDate) return null;
  const weeks = Math.floor(differenceInDays(currentDate, new Date(baselineDate)) / 7);
  return weeks < 0 ? 0 : weeks;
}

/**
 * Format EDD with method notation for display
 * e.g., "May 1, 2026 (based on ovulation)" or "May 1, 2026 (based on LMP)"
 */
export function formatEDDWithMethod(eddData) {
  if (!eddData) return null;
  const eddDate = format(new Date(eddData.edd), "MMM d, yyyy");
  const method = eddData.method === "ovulation" ? "based on ovulation" : "based on LMP";
  return `${eddDate} (${method})`;
}