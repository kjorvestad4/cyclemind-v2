import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format, subDays, differenceInDays } from 'npm:date-fns@4.1.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Luna notifications enabled
    if (user.luna_notifications === false) {
      return Response.json({ 
        unreadCount: 0,
        alerts: [],
        message: 'Luna notifications are disabled'
      });
    }

    // Get recent data
    const cycles = await base44.entities.Cycle.filter({ created_by: user.email }, "-start_date", 10);
    const entries = await base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 30);
    
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayEntry = entries.find(e => e.date === todayStr);
    const latestCycle = cycles.length > 0 ? cycles[0] : null;
    
    // Clear old alerts from previous cycles (keep only current cycle alerts)
    if (latestCycle) {
      const allAlerts = await base44.entities.LunaAlert.filter({ created_by: user.email });
      const alertsToDelete = allAlerts.filter(alert => {
        const alertDate = new Date(alert.created_date);
        return alertDate < new Date(latestCycle.start_date);
      });
      
      if (alertsToDelete.length > 0) {
        for (const alert of alertsToDelete) {
          await base44.entities.LunaAlert.delete(alert.id);
        }
      }
    }
    
    const alerts = [];
    
    // Helper to create alert
    const createAlert = (type, title, message, severity = "medium") => {
      const expiresDate = format(subDays(new Date(), -7), "yyyy-MM-dd");
      return {
        user_id: user.id,
        alert_type: type,
        title,
        message,
        severity,
        created_date: todayStr,
        expires_date: expiresDate
      };
    };

    // 1. Luteal Phase Alert (high PMDD risk window)
    if (latestCycle && latestCycle.cycle_type === "menstrual") {
      const cycleDay = latestCycle.start_date 
        ? Math.max(1, differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1)
        : null;
      
      const cycleLength = latestCycle.cycle_length || user.cycle_length || 28;
      const lutealStart = cycleLength - 14;
      
      if (cycleDay && cycleDay >= lutealStart && cycleDay <= cycleLength) {
        const daysUntilPeriod = cycleLength - cycleDay;
        alerts.push(createAlert(
          "luteal_phase",
          "🌙 High-Risk Phase Alert",
          `You're in your luteal phase (days ${lutealStart}-${cycleLength}). PMDD symptoms often peak now. Your period is expected in ${daysUntilPeriod} days. Consider extra self-care and tracking mood closely.`,
          "high"
        ));
      }
    }

    // 2. Severe Symptoms Alert (3+ days of severe symptoms)
    const recentEntries = entries.slice(0, 7);
    const severeSymptomDays = recentEntries.filter(e => {
      const severeKeys = ["s_depression", "s_anxiety", "s_irritability", "s_overwhelmed"];
      return severeKeys.some(k => (e[k] || 0) >= 5);
    });
    
    if (severeSymptomDays.length >= 3) {
      alerts.push(createAlert(
        "severe_symptoms",
        "⚠️ Symptom Check-In",
        `I've noticed ${severeSymptomDays.length} days of severe symptoms this week. This might indicate PMDD flare-ups or other concerns. Would you like to generate a clinical report to share with your doctor?`,
        "high"
      ));
    }

    // 3. Log Reminder (no entry in 2+ days)
    const lastEntryDate = entries.length > 0 ? entries[0].date : null;
    const daysSinceLog = lastEntryDate 
      ? differenceInDays(new Date(), new Date(lastEntryDate))
      : 999;
    
    if (daysSinceLog >= 2 && !todayEntry) {
      alerts.push(createAlert(
        "log_reminder",
        "📝 Missing Your Data",
        `You haven't logged in ${daysSinceLog} days. Consistent tracking helps me spot patterns and support you better. Tap to log today's symptoms — it only takes 2 minutes!`,
        "low"
      ));
    }

    // 4. Pattern Insight (mood-cycle correlation)
    if (entries.length >= 60) {
      const lutealEntries = entries.filter(e => {
        const entryCycleDay = e.cycle_day;
        const cycleLength = latestCycle?.cycle_length || 28;
        return entryCycleDay && entryCycleDay >= (cycleLength - 14);
      });
      
      const follicularEntries = entries.filter(e => {
        const entryCycleDay = e.cycle_day;
        return entryCycleDay && entryCycleDay <= 14;
      });
      
      const lutealMoodAvg = lutealEntries.reduce((sum, e) => 
        sum + (e.s_depression || 0) + (e.s_anxiety || 0) + (e.s_irritability || 0), 0
      ) / (lutealEntries.length || 1);
      
      const follicularMoodAvg = follicularEntries.reduce((sum, e) => 
        sum + (e.s_depression || 0) + (e.s_anxiety || 0) + (e.s_irritability || 0), 0
      ) / (follicularEntries.length || 1);
      
      if (lutealMoodAvg > follicularMoodAvg + 2) {
        alerts.push(createAlert(
          "pattern_insight",
          "💡 Pattern Detected",
          `I notice your mood symptoms tend to worsen during your luteal phase (before your period). This pattern is common with PMDD. Tracking this can help your doctor provide better support.`,
          "medium"
        ));
      }
    }

    // 5. Fertility Window Alert
    if (latestCycle && latestCycle.cycle_type === "menstrual" && user.fertility_mode) {
      const cycleDay = latestCycle.start_date 
        ? Math.max(1, differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1)
        : null;
      
      const cycleLength = latestCycle.cycle_length || user.cycle_length || 28;
      const ovulationDay = cycleLength - 14;
      const fertileWindowStart = ovulationDay - 5;
      const fertileWindowEnd = ovulationDay + 1;
      
      if (cycleDay && cycleDay >= fertileWindowStart && cycleDay <= fertileWindowEnd) {
        const daysLeft = fertileWindowEnd - cycleDay;
        alerts.push(createAlert(
          "fertility_window",
          "🌸 Fertile Window Alert",
          `You're in your fertile window! Today is one of your ${daysLeft + 1} most fertile days this cycle. Best time for conception is today and the next ${daysLeft} days.`,
          "high"
        ));
      }
    }

    // 6. Menopause Milestone Alert
    if (latestCycle && (latestCycle.cycle_type === "menopause" || latestCycle.cycle_type === "perimenopause")) {
      const monthsSinceLastPeriod = latestCycle.start_date
        ? Math.floor(differenceInDays(new Date(), new Date(latestCycle.start_date)) / 30)
        : 0;
      
      if (monthsSinceLastPeriod === 12) {
        alerts.push(createAlert(
          "menopause_milestone",
          "🎯 Milestone Reached",
          "You've reached 12 months without a period — this typically marks the transition to postmenopause. Consider scheduling a check-in with your healthcare provider to discuss next steps.",
          "medium"
        ));
      } else if (monthsSinceLastPeriod === 6) {
        alerts.push(createAlert(
          "menopause_milestone",
          "📊 6-Month Check-In",
          "You're 6 months past your last period. How are you feeling? This is a good time to review your symptom patterns and HRT effectiveness with your doctor.",
          "low"
        ));
      }
    }

    // Store alerts (avoid duplicates)
    const existingAlerts = await base44.entities.LunaAlert.filter({ 
      created_by: user.email,
      is_read: false
    });
    
    const existingTypes = new Set(existingAlerts.map(a => a.alert_type));
    const newAlerts = alerts.filter(a => !existingTypes.has(a.alert_type));
    
    if (newAlerts.length > 0) {
      await base44.entities.LunaAlert.bulkCreate(newAlerts);
    }

    // Return unread count
    const updatedAlerts = await base44.entities.LunaAlert.filter({ 
      created_by: user.email,
      is_read: false
    });

    return Response.json({ 
      unreadCount: updatedAlerts.length,
      alerts: updatedAlerts.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
    });
  } catch (error) {
    console.error('Luna alerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});