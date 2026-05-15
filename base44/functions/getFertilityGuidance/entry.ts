import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { differenceInDays, addDays, format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's cycles
    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    
    if (!cycles || cycles.length === 0) {
      return Response.json({ 
        error: 'No cycle data available. Please log at least one cycle to enable fertility tracking.',
        status: 400 
      });
    }

    // Sort cycles by date
    const sortedCycles = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    const latestCycle = sortedCycles[0];
    
    // Calculate cycle parameters
    const cycleLength = latestCycle.cycle_length || 28;
    const cycleStart = new Date(latestCycle.last_menstrual_period || latestCycle.start_date);
    const today = new Date();
    const cycleDay = Math.floor(differenceInDays(today, cycleStart)) + 1;
    
    // Calculate ovulation day (typically 14 days before next period)
    const ovulationDay = Math.max(10, cycleLength - 14);
    const predictedOvulation = addDays(cycleStart, ovulationDay - 1);
    
    // Fertility window: 5 days before ovulation + ovulation day (sperm survives 5 days, egg survives 12-24h)
    const fertilityWindowStart = addDays(predictedOvulation, -5);
    const fertilityWindowEnd = addDays(predictedOvulation, 1);
    
    // Calculate conception probability
    const daysUntilOvulation = differenceInDays(predictedOvulation, today);
    const isInFertilityWindow = today >= fertilityWindowStart && today <= fertilityWindowEnd;
    
    // Probability based on cycle day (peak on ovulation day and 2 days before)
    let conceptionProbability = 0;
    if (daysUntilOvulation === 0 || daysUntilOvulation === -1) {
      conceptionProbability = 30; // Peak: 30% chance
    } else if (daysUntilOvulation === 1 || daysUntilOvulation === 2) {
      conceptionProbability = 20; // High: 20% chance
    } else if (daysUntilOvulation >= 3 && daysUntilOvulation <= 5) {
      conceptionProbability = 10; // Moderate: 10% chance
    } else if (daysUntilOvulation >= -1 && daysUntilOvulation <= -3) {
      conceptionProbability = 5; // Low (post-ovulation)
    }

    // Get evidence-based tips based on cycle phase
    const tips = [];
    
    if (isInFertilityWindow) {
      tips.push({
        category: "timing",
        priority: "high",
        text: "You're in your fertility window! Intercourse today or tomorrow maximizes conception chances. The egg survives 12-24 hours after ovulation."
      });
      tips.push({
        category: "lifestyle",
        priority: "medium",
        text: "Avoid NSAIDs (ibuprofen, naproxen) around ovulation - they may interfere with follicle rupture. Use acetaminophen if needed."
      });
    } else if (daysUntilOvulation <= 5 && daysUntilOvulation > 0) {
      tips.push({
        category: "timing",
        priority: "high",
        text: `Your fertility window opens in ${daysUntilOvulation} days. Plan intercourse every 1-2 days starting ${format(addDays(today, daysUntilOvulation - 2), 'MMM d')}.`
      });
    } else {
      tips.push({
        category: "preparation",
        priority: "medium",
        text: "Track ovulation signs: cervical mucus becomes clear/stretchy (egg-white), basal body temperature rises 0.5-1°F after ovulation, LH surge 24-36h before ovulation."
      });
    }

    // Preconception health tips (always shown)
    tips.push({
      category: "nutrition",
      priority: "high",
      text: "Take 400-800 mcg folic acid daily to prevent neural tube defects. Start at least 1 month before conception."
    });
    tips.push({
      category: "lifestyle",
      priority: "medium",
      text: "Limit caffeine to <200mg/day (1-2 cups coffee), avoid alcohol and smoking, maintain healthy weight (BMI 18.5-24.9)."
    });

    // PMDD-specific guidance if applicable
    const entries = await base44.entities.DailyEntry.filter({});
    const recentEntries = entries.filter(e => {
      const entryDate = new Date(e.date);
      return differenceInDays(today, entryDate) <= 90;
    });

    const lutealSymptoms = recentEntries.filter(e => {
      const cd = e.cycle_day || 1;
      return cd > ovulationDay && cd <= cycleLength;
    });

    const avgLutealAnxiety = lutealSymptoms.reduce((sum, e) => sum + (e.s_anxiety || 0), 0) / lutealSymptoms.length || 0;
    
    if (avgLutealAnxiety >= 4) {
      tips.push({
        category: "pmdd",
        priority: "high",
        text: "Your data shows elevated luteal anxiety. Discuss with your psychiatrist: some SSRIs are safe while trying to conceive, or consider luteal-phase only dosing."
      });
    }

    return Response.json({
      success: true,
      fertilityData: {
        cycleDay,
        cycleLength,
        predictedOvulation: format(predictedOvulation, 'yyyy-MM-dd'),
        fertilityWindowStart: format(fertilityWindowStart, 'yyyy-MM-dd'),
        fertilityWindowEnd: format(fertilityWindowEnd, 'yyyy-MM-dd'),
        daysUntilOvulation,
        isInFertilityWindow,
        conceptionProbability,
        tips,
        disclaimer: "This is AI-generated pattern recognition and not a substitute for professional medical advice. Consult your healthcare provider for personalized fertility guidance."
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});