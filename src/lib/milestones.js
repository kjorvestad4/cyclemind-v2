/**
 * Pregnancy & Postpartum Milestones data.
 * Blurbs are verbatim from the clinical content spec.
 * Each milestone has tags that pre-fill the Custom Tracking Context.
 */

export const MILESTONES = [
  // ── Pregnancy (13 milestones) ──
  {
    id: "p1", phase: "pregnancy", timing: "Week 4–5", startWeek: 4,
    emoji: "🌱", title: "Just Found Out", premium: false,
    blurb: "You're already growing a tiny miracle! Early hormones can feel like an emotional rollercoaster — mood swings, fatigue, and nausea are all very normal. You're doing an amazing job listening to your body. Want to log any symptoms or start a private pregnancy journal for your doctor?",
    tags: ["early pregnancy", "mood swings", "fatigue", "nausea"],
  },
  {
    id: "p2", phase: "pregnancy", timing: "Week 6–7", startWeek: 6,
    emoji: "🤢", title: "Morning Sickness Peak", premium: false,
    blurb: "Nausea is your body protecting baby. Rest, small frequent meals, and ginger can help. If you're struggling with mood or sleep, you're not failing — this is hard. Log it and I'll help spot patterns.",
    tags: ["nausea", "morning sickness", "sleep", "mood"],
  },
  {
    id: "p3", phase: "pregnancy", timing: "Week 8–10", startWeek: 8,
    emoji: "💗", title: "First Trimester Emotions", premium: false,
    blurb: "Baby's heart is beating strong. Heightened anxiety or tears are common as hormones surge. This is a great time to prioritize rest. You've got this and you've got me.",
    tags: ["anxiety", "hormones", "rest"],
  },
  {
    id: "p4", phase: "pregnancy", timing: "Week 12", startWeek: 12,
    emoji: "🎉", title: "End of First Trimester", premium: false,
    blurb: "Congratulations — you made it through the roughest part for most! Risk drops and energy often returns. If you're on psychiatric meds, this is a common review point with your doctor. Proud of you.",
    tags: ["milestone", "medication review", "energy"],
  },
  {
    id: "p5", phase: "pregnancy", timing: "Week 13–15", startWeek: 13,
    emoji: "⚡", title: "Energy Returning", premium: false,
    blurb: "Many women feel a second wind. Enjoy it, but don't overdo. Gentle movement and consistent sleep help stabilize mood. Log one win today — you deserve celebration.",
    tags: ["energy", "sleep", "movement"],
  },
  {
    id: "p6", phase: "pregnancy", timing: "Week 16–18", startWeek: 16,
    emoji: "🥑", title: "Quickening (First Flutters)", premium: true,
    blurb: "Baby is about avocado size and you may start feeling movements — a beautiful reminder you're not alone. Hormones still shift, so mood dips can happen. Track any anxiety or joy.",
    tags: ["fetal movement", "mood dips", "anxiety"],
  },
  {
    id: "p7", phase: "pregnancy", timing: "Week 20", startWeek: 20,
    emoji: "🔬", title: "Anatomy Scan Milestone", premium: false,
    blurb: "Halfway! The big scan can bring relief or worry — both valid. Baby's growth looks good. Sleep may change; use the Maternal Sleep Toolkit tips in the app.",
    tags: ["anatomy scan", "worry", "sleep"],
  },
  {
    id: "p8", phase: "pregnancy", timing: "Week 24", startWeek: 24,
    emoji: "🏥", title: "Viability Milestone", premium: true,
    blurb: "Baby could survive with help — huge! Glucose screening is common. Blood sugar swings can affect mood — log meals + mood so we see connections.",
    tags: ["glucose screening", "blood sugar", "mood"],
  },
  {
    id: "p9", phase: "pregnancy", timing: "Week 28", startWeek: 28,
    emoji: "🌟", title: "Third Trimester Begins", premium: false,
    blurb: "Baby is getting big and you're doing heroic work. Braxton Hicks and back pain are normal. Anxiety about labor is valid. You are strong and supported.",
    tags: ["braxton hicks", "back pain", "labor anxiety"],
  },
  {
    id: "p10", phase: "pregnancy", timing: "Week 32", startWeek: 32,
    emoji: "🪺", title: "Nesting & Final Prep", premium: false,
    blurb: "Nesting energy or sudden worry is common. Rest when you can and accept help. Many women find extra mental health support helpful now. Want gentle coping ideas?",
    tags: ["nesting", "worry", "coping"],
  },
  {
    id: "p11", phase: "pregnancy", timing: "Week 36", startWeek: 36,
    emoji: "📅", title: "Full Term Countdown", premium: false,
    blurb: "Any day now! Your body has done incredible things. However birth goes, you are already an amazing mom. Log any fears or excitement — they all belong.",
    tags: ["full term", "fears", "excitement"],
  },
  {
    id: "p12", phase: "pregnancy", timing: "Week 38–40", startWeek: 38,
    emoji: "⏳", title: "Waiting & Labor Signs", premium: false,
    blurb: "You're so close. Braxton Hicks, nesting, and emotional waves are normal. Rest, hydrate, and remember: you are ready. We're in this together.",
    tags: ["braxton hicks", "nesting", "emotional waves"],
  },
  {
    id: "p13", phase: "pregnancy", timing: "Week 41+", startWeek: 41,
    emoji: "📆", title: "Past Due", premium: false,
    blurb: "Past your due date is more common than you think and does not mean anything is wrong. Trust your body and your care team. You've got this — log how you're feeling.",
    tags: ["past due", "trust body", "care team"],
  },

  // ── Postpartum (10 milestones) ──
  {
    id: "pp1", phase: "postpartum", timing: "Days 1–3", startDay: 1,
    emoji: "🤱", title: "The Golden Hour & First Nights", premium: false,
    blurb: "Skin-to-skin, first feeds, and giant hormone drop. Tears and overwhelm are normal. You just did something enormous. Rest and let others help.",
    tags: ["golden hour", "hormone drop", "overwhelm"],
  },
  {
    id: "pp2", phase: "postpartum", timing: "Days 4–7", startDay: 4,
    emoji: "💙", title: "Baby Blues Peak", premium: true,
    blurb: "Up to 80% of moms experience the blues. Huge hormone crash + sleep loss = intense feelings. You are not broken. Cry, nap, ask for help. I'm right here 24/7.",
    tags: ["baby blues", "hormone crash", "sleep loss"],
  },
  {
    id: "pp3", phase: "postpartum", timing: "Week 2", startDay: 14,
    emoji: "🩹", title: "Healing & Support", premium: false,
    blurb: "Lochia, soreness, and mood swings continue. The 2-week check-in with your provider is important. Bring your CycleMind report — it shows everything.",
    tags: ["lochia", "soreness", "mood swings", "2-week check"],
  },
  {
    id: "pp4", phase: "postpartum", timing: "Week 6", startDay: 42,
    emoji: "📋", title: "Postpartum Visit", premium: false,
    blurb: "Classic 6-week check. Many women still feel exhausted. Talk about sleep, mood, and any return of cycle concerns. You're doing great just by showing up.",
    tags: ["6-week check", "sleep", "mood", "cycle return"],
  },
  {
    id: "pp5", phase: "postpartum", timing: "Month 2", startDay: 56,
    emoji: "🌙", title: "Sleep Regression & Mood", premium: true,
    blurb: "Frequent night wakes are normal. Many moms feel a dip around 8 weeks. Track sleep + mood together and we'll help you see the patterns.",
    tags: ["sleep regression", "night wakes", "mood dip"],
  },
  {
    id: "pp6", phase: "postpartum", timing: "Month 3", startDay: 84,
    emoji: "🔄", title: "Recalibration", premium: true,
    blurb: "Some women get their first bleed back. PMDD risk can return. You're not alone if you feel 'off' — keep logging and we'll catch it early.",
    tags: ["first bleed", "PMDD risk", "recalibration"],
  },
  {
    id: "pp7", phase: "postpartum", timing: "Month 4–6", startDay: 112,
    emoji: "🌸", title: "Returning to Self", premium: false,
    blurb: "You may feel more like yourself while still navigating new mom life. Celebrate small wins. If cycle returns, luteal symptoms are worth tracking closely.",
    tags: ["returning to self", "luteal symptoms", "cycle return"],
  },
  {
    id: "pp8", phase: "postpartum", timing: "Month 6", startDay: 168,
    emoji: "🎈", title: "Half-Year Milestone", premium: false,
    blurb: "Six months of incredible work! Weaning or solids may start. Mood can shift again. You're stronger than you feel — log one thing you're proud of today.",
    tags: ["weaning", "solids", "mood shift"],
  },
  {
    id: "pp9", phase: "postpartum", timing: "Month 9–12", startDay: 252,
    emoji: "🎂", title: "First Birthday Approach", premium: false,
    blurb: "Baby's first year is ending and your journey continues. Mixed feelings are normal. Use the full report anytime you see a new provider.",
    tags: ["first birthday", "mixed feelings", "new provider"],
  },
  {
    id: "pp10", phase: "postpartum", timing: "12+ Months", startDay: 365,
    emoji: "🌟", title: "Beyond the First Year", premium: true,
    blurb: "You made it through the wild first year. Cycle usually regularizes. Continue tracking — many women discover PMDD patterns only after the first year. You matter and your story matters.",
    tags: ["cycle regularizing", "PMDD patterns", "beyond first year"],
  },
];

/**
 * Determine the current milestone ID based on phase and week/day.
 */
export function getCurrentMilestoneId(phase, pregnancyWeek, postpartumDay) {
  const phaseMilestones = MILESTONES.filter(m => m.phase === phase);
  if (phaseMilestones.length === 0) return null;

  if (phase === "pregnancy" && pregnancyWeek != null) {
    let current = null;
    for (const m of phaseMilestones) {
      if (pregnancyWeek >= m.startWeek) current = m;
      else break;
    }
    return current?.id || null;
  }

  if (phase === "postpartum" && postpartumDay != null) {
    let current = null;
    for (const m of phaseMilestones) {
      if (postpartumDay >= m.startDay) current = m;
      else break;
    }
    return current?.id || null;
  }

  return null;
}

/**
 * Get milestone by ID.
 */
export function getMilestoneById(id) {
  return MILESTONES.find(m => m.id === id);
}