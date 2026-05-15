export const SYMPTOM_CATEGORIES = [
  {
    label: "Mood & Emotional",
    symptoms: [
      { key: "s_depressed", label: "Felt depressed, sad, down, or blue", shortLabel: "Depressed / Sad" },
      { key: "s_hopeless", label: "Felt hopeless", shortLabel: "Hopeless" },
      { key: "s_worthless", label: "Felt worthless or guilty", shortLabel: "Worthless / Guilty" },
      { key: "s_anxious", label: "Felt anxious, tense, keyed up, or on edge", shortLabel: "Anxious / Tense" },
      { key: "s_mood_swings", label: "Had mood swings (e.g., suddenly felt sad or tearful)", shortLabel: "Mood Swings" },
      { key: "s_sensitive", label: "Was more sensitive to rejection or feelings were more easily hurt", shortLabel: "Rejection Sensitive" },
      { key: "s_angry", label: "Felt angry, irritable", shortLabel: "Angry / Irritable" },
      { key: "s_conflicts", label: "Had conflicts or problems with people", shortLabel: "Conflicts with Others" },
    ]
  },
  {
    label: "Behavioral & Cognitive",
    symptoms: [
      { key: "s_less_interest", label: "Had less interest in usual activities (e.g., work, school, friends, hobbies)", shortLabel: "Less Interest" },
      { key: "s_concentration", label: "Had difficulty concentrating", shortLabel: "Brain Fog / Focus" },
      { key: "s_lethargic", label: "Felt lethargic, tired, fatigued, or had a lack of energy", shortLabel: "Fatigue / Low Energy" },
      { key: "s_overwhelmed", label: "Felt overwhelmed or that I could not cope", shortLabel: "Overwhelmed" },
      { key: "s_out_of_control", label: "Felt out of control", shortLabel: "Out of Control" },
    ]
  },
  {
    label: "Appetite & Sleep",
    symptoms: [
      { key: "s_appetite", label: "Had increased appetite or overate", shortLabel: "Overeating" },
      { key: "s_cravings", label: "Had cravings for specific foods", shortLabel: "Food Cravings" },
      { key: "s_hypersomnia", label: "Slept more, took naps, found it hard to get up when intended", shortLabel: "Sleeping Too Much" },
      { key: "s_insomnia", label: "Had trouble getting to sleep or staying asleep", shortLabel: "Insomnia" },
    ]
  },
  {
    label: "Physical",
    symptoms: [
      { key: "s_breast_tender", label: "Had breast tenderness", shortLabel: "Breast Tenderness" },
      { key: "s_bloating", label: "Had breast swelling, felt bloated, or had weight gain", shortLabel: "Bloating" },
      { key: "s_headache", label: "Had headache", shortLabel: "Headache" },
      { key: "s_pain", label: "Had joint or muscle pain", shortLabel: "Joint / Muscle Pain" },
    ]
  },
  {
    label: "Functional Impact",
    symptoms: [
      { key: "s_productivity", label: "Reduced productivity or inefficiency at work/home", shortLabel: "Reduced Productivity" },
      { key: "s_social", label: "Interfered with hobbies or social activities", shortLabel: "Social Withdrawal" },
      { key: "s_relationships", label: "Interfered with relationships with others", shortLabel: "Relationship Impact" },
    ]
  },
  {
    label: "Additional Items",
    symptoms: [
      { key: "s_impulsivity", label: "Impulsivity – Felt impulsive or acted on impulses", shortLabel: "Impulsivity" },
      { key: "s_decreased_sleep_need", label: "Decreased need for sleep (felt rested on little sleep)", shortLabel: "Less Sleep Needed" },
      { key: "s_elevated_mood", label: "Elevated mood – Experienced elevated mood, unusually energetic, or euphoric", shortLabel: "Elevated / Euphoric Mood" },
    ]
  }
];

export const ALL_SYMPTOMS = SYMPTOM_CATEGORIES.flatMap(c => c.symptoms);

export const SEVERITY_LABELS = {
  1: "Not at all",
  2: "Minimal",
  3: "Mild",
  4: "Moderate",
  5: "Severe",
  6: "Extreme"
};

export const SEVERITY_COLORS = {
  1: "bg-emerald-100 text-emerald-700 border-emerald-200",
  2: "bg-lime-100 text-lime-700 border-lime-200",
  3: "bg-yellow-100 text-yellow-700 border-yellow-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
  5: "bg-red-100 text-red-700 border-red-200",
  6: "bg-red-200 text-red-900 border-red-300"
};

export function calculateDayTotal(entry) {
  if (!entry) return 0;
  return ALL_SYMPTOMS.reduce((sum, s) => sum + (entry[s.key] || 0), 0);
}

// Parse "yyyy-MM-dd" as local date to avoid UTC timezone shift
function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getCycleDay(date, cycles) {
  if (!cycles || cycles.length === 0) return null;
  const sorted = [...cycles].sort((a, b) => parseLocalDate(b.start_date) - parseLocalDate(a.start_date));
  const target = parseLocalDate(typeof date === "string" ? date : date.toISOString().slice(0, 10));

  for (const cycle of sorted) {
    const start = parseLocalDate(cycle.start_date);
    if (!start) continue;
    if (target >= start) {
      const diffDays = Math.round((target - start) / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
  }
  return null;
}