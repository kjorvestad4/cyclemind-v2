/**
 * Shared configuration for the Cycle Profile Settings screen.
 * Phase colors, presets, regularity options, and educational tooltips.
 */

export const PHASE_COLORS = {
  menstrual: "#f43f5e",
  follicular: "#10b981",
  ovulation: "#eab308",
  luteal: "#8b5cf6",
};

export const PHASE_LABELS = {
  menstrual: "Period",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

export const PMDD_WINDOW_COLOR = "#7c3aed";

export const REGULARITY_OPTIONS = [
  { value: "regular", label: "Regular", desc: "Cycles vary by ≤2 days" },
  { value: "somewhat_variable", label: "Somewhat variable", desc: "Cycles vary by 3–7 days" },
  { value: "irregular", label: "Irregular", desc: "Cycles vary by 8+ days" },
  { value: "perimenopause", label: "Perimenopause", desc: "Transitioning — irregular & changing" },
  { value: "on_bc", label: "On hormonal BC", desc: "Withdrawal bleeds on schedule" },
];

export const REGULARITY_VARIANCE = {
  regular: { icon: "▬▬", color: "#10b981", text: "Very consistent" },
  somewhat_variable: { icon: "▬▬▬", color: "#eab308", text: "Mild variation" },
  irregular: { icon: "▬▬▬▬", color: "#f43f5e", text: "Highly variable" },
  perimenopause: { icon: "〰️", color: "#f97316", text: "Shifting pattern" },
  on_bc: { icon: "💊", color: "#3b82f6", text: "Pill-controlled" },
};

export const QUICK_PRESETS = [
  {
    id: "standard_28",
    label: "Standard 28d",
    desc: "28-day cycle, 14-day luteal",
    values: { cycleLength: 28, periodLength: 5, lutealLength: 14, pmddWindowDays: 10 },
  },
  {
    id: "short_luteal",
    label: "Short Luteal (PMDD)",
    desc: "10-day luteal — common in PMDD",
    values: { cycleLength: 26, periodLength: 5, lutealLength: 10, pmddWindowDays: 8 },
  },
  {
    id: "long_follicular",
    label: "Long Follicular",
    desc: "35-day cycle with extended follicular",
    values: { cycleLength: 35, periodLength: 4, lutealLength: 14, pmddWindowDays: 10 },
  },
  {
    id: "highly_variable",
    label: "Highly Variable",
    desc: "Irregular — wider PMDD window",
    values: { cycleLength: 30, periodLength: 5, lutealLength: 12, pmddWindowDays: 14 },
  },
  {
    id: "perimenopause",
    label: "Perimenopause",
    desc: "Shorter luteal, irregular",
    values: { cycleLength: 24, periodLength: 4, lutealLength: 10, pmddWindowDays: 12 },
  },
];

export const OVULATION_MARKER_CONFIG = [
  { key: "track_ovulation_opk", label: "OPK (Ovulation Predictor Kits)", desc: "Urine LH test strips" },
  { key: "track_ovulation_bbt", label: "Basal Body Temperature", desc: "Morning temp tracking" },
  { key: "track_ovulation_mucus", label: "Cervical Mucus", desc: "Fertile mucus observation" },
  { key: "track_ovulation_pain", label: "Mid-Cycle Pain", desc: "Mittelschmerz (ovulation pain)" },
];

export const EDUCATIONAL_TOOLTIPS = {
  cycleLength: "Your cycle length is counted from the first day of bleeding (Day 1) to the day before your next period starts. The average is 28 days, but anything from 21–35 days is normal.",
  periodLength: "This is how many days you typically bleed. Most people bleed 3–7 days. Heavier flows often last longer.",
  regularity: "Cycle regularity helps Luna predict your next period and identify when something's off. 'Regular' means your cycles vary by 2 days or less.",
  lutealPhase: "The luteal phase runs from ovulation to your next period. It's the most consistent phase of your cycle — typically 12–14 days. A luteal phase under 10 days can affect fertility and PMDD symptoms. This is the phase where PMDD symptoms appear.",
  ovulationDay: "Ovulation usually happens 14 days before your next period. If your cycle is 28 days, ovulation is around Day 14. Tracking ovulation helps pinpoint your fertile window and luteal phase start.",
  pmddWindow: "The PMDD symptom window is the last 7–14 days of your luteal phase, when PMDD symptoms typically peak. Luna uses this to flag high-risk days and correlate your symptom logs with cycle timing.",
  ovulationMarkers: "Tracking ovulation markers helps Luna pinpoint your actual ovulation date, improving luteal phase accuracy. OPKs detect the LH surge 24–36h before ovulation. BBT rises after ovulation. Cervical mucus becomes clear and stretchy around ovulation.",
  visualEditor: "Drag the dividers to adjust each phase. The luteal phase auto-calculates from your ovulation day. The purple overlay shows your PMDD symptom window.",
  learnedFromLogs: "Luna analyzes your last 6 logged cycles to calculate this average automatically.",
};

/**
 * Calculate phase boundaries from cycle profile values.
 */
export function calculatePhases({ cycleLength, periodLength, lutealLength, pmddWindowDays }) {
  const cl = cycleLength || 28;
  const pl = periodLength || 5;
  const ll = lutealLength || 14;
  const pw = pmddWindowDays || 10;

  const ovulationDay = Math.max(pl + 1, cl - ll);
  const follicularLength = Math.max(1, ovulationDay - pl - 1);
  const pmddWindowStart = cl - pw + 1;

  return {
    cycleLength: cl,
    periodLength: pl,
    ovulationDay,
    follicularLength,
    lutealLength: ll,
    pmddWindowDays: pw,
    pmddWindowStart,
    pmddWindowEnd: cl,
  };
}