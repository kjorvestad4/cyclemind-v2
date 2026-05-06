export const SYMPTOM_CATEGORIES = [
  {
    label: "Mood & Emotional",
    symptoms: [
      { key: "s_depressed", label: "Felt depressed, sad, down, or blue" },
      { key: "s_hopeless", label: "Felt hopeless" },
      { key: "s_worthless", label: "Felt worthless or guilty" },
      { key: "s_anxious", label: "Felt anxious, tense, keyed up, or on edge" },
      { key: "s_mood_swings", label: "Had mood swings (e.g., suddenly felt sad or tearful)" },
      { key: "s_sensitive", label: "Was more sensitive to rejection or feelings were more easily hurt" },
      { key: "s_angry", label: "Felt angry, irritable" },
      { key: "s_conflicts", label: "Had conflicts or problems with people" },
    ]
  },
  {
    label: "Behavioral & Cognitive",
    symptoms: [
      { key: "s_less_interest", label: "Had less interest in usual activities (e.g., work, school, friends, hobbies)" },
      { key: "s_concentration", label: "Had difficulty concentrating" },
      { key: "s_lethargic", label: "Felt lethargic, tired, fatigued, or had a lack of energy" },
      { key: "s_overwhelmed", label: "Felt overwhelmed or that I could not cope" },
      { key: "s_out_of_control", label: "Felt out of control" },
    ]
  },
  {
    label: "Appetite & Sleep",
    symptoms: [
      { key: "s_appetite", label: "Had increased appetite or overate" },
      { key: "s_cravings", label: "Had cravings for specific foods" },
      { key: "s_hypersomnia", label: "Slept more, took naps, found it hard to get up when intended" },
      { key: "s_insomnia", label: "Had trouble getting to sleep or staying asleep" },
    ]
  },
  {
    label: "Physical",
    symptoms: [
      { key: "s_breast_tender", label: "Had breast tenderness" },
      { key: "s_bloating", label: "Had breast swelling, felt bloated, or had weight gain" },
      { key: "s_headache", label: "Had headache" },
      { key: "s_pain", label: "Had joint or muscle pain" },
    ]
  },
  {
    label: "Functional Impact",
    symptoms: [
      { key: "s_productivity", label: "At work, school, home, or in daily routine, at least one of the problems noted above caused reduced productivity or inefficiency" },
      { key: "s_social", label: "At least one of the problems noted above interfered with hobbies or social activities (e.g., avoided or did less)" },
      { key: "s_relationships", label: "At least one of the problems noted above interfered with relationships with others" },
    ]
  },
  {
    label: "Additional Items",
    symptoms: [
      { key: "s_impulsivity", label: "Impulsivity – Felt impulsive or acted on impulses" },
      { key: "s_decreased_sleep_need", label: "Decreased need for sleep – Had a decreased need for sleep (felt rested on little sleep)" },
      { key: "s_elevated_mood", label: "Elevated mood – Experienced elevated mood, unusually energetic, or euphoric" },
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

export function getCycleDay(date, cycles) {
  if (!cycles || cycles.length === 0) return null;
  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  
  for (const cycle of sorted) {
    const start = new Date(cycle.start_date);
    start.setHours(0, 0, 0, 0);
    if (target >= start) {
      const diffTime = target - start;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
  }
  return null;
}