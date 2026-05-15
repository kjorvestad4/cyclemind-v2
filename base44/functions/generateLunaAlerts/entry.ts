import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format, addDays, differenceInDays } from 'npm:date-fns@4.1.0';

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
    const entries = await base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 60);
    
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayEntry = entries.find(e => e.date === todayStr);
    const latestCycle = cycles.length > 0 ? cycles[0] : null;
    
    // Clear old alerts from previous cycles
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
    
    // Helper: expires 7 days AFTER creation (fixed: addDays, not subDays)
    const createAlert = (type, title, message, severity = "medium") => ({
      user_id: user.id,
      alert_type: type,
      title,
      message,
      severity,
      created_date: todayStr,
      expires_date: format(addDays(new Date(), 7), "yyyy-MM-dd")
    });

    // 1. Luteal Phase Support Alert
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
          "🌙 Luteal Phase Support Alert",
          `You're in your luteal phase (days ${lutealStart}–${cycleLength}). This is when many women notice PMDD symptoms intensify. Your period is expected in about ${daysUntilPeriod} days. Gentle self-care and close mood tracking can help — I'm here with you.`,
          "high"
        ));
      }
    }

    // 2. Symptom Check-In (3+ days of severe symptoms)
    const recentEntries = entries.slice(0, 7);
    const severeSymptomDays = recentEntries.filter(e => {
      const severeKeys = ["s_depression", "s_anxiety", "s_irritability", "s_overwhelmed"];
      return severeKeys.some(k => (e[k] || 0) >= 5);
    });
    if (severeSymptomDays.length >= 3) {
      alerts.push(createAlert(
        "severe_symptoms",
        "⚠️ Symptom Check-In",
        `I've noticed ${severeSymptomDays.length} days of more intense symptoms this week (depression, anxiety, irritability, or feeling overwhelmed). This pattern is common with PMDD flares. Would you like me to generate a clinical report you can share with your doctor?`,
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
        "📝 Log Reminder",
        `You haven't logged in ${daysSinceLog} days. Consistent tracking really helps me spot your unique patterns and give you better support. It only takes a couple of minutes — want to log how you're feeling today?`,
        "low"
      ));
    }

    // 4. Pattern Insight (mood-cycle correlation, needs 60+ entries)
    if (entries.length >= 60) {
      const cycleLength = latestCycle?.cycle_length || 28;
      const lutealEntries = entries.filter(e => e.cycle_day && e.cycle_day >= (cycleLength - 14));
      const follicularEntries = entries.filter(e => e.cycle_day && e.cycle_day <= 14);
      
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
          `I've noticed your mood symptoms tend to feel stronger during your luteal phase (before your period). This is a common pattern with PMDD. Tracking it consistently can give your doctor helpful information.`,
          "medium"
        ));
      }
    }

    // 5. Fertile Window Alert
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
          `You're in your fertile window. Today and the next ${daysLeft} days are your most fertile time this cycle. If you're trying to conceive, this is a great window — I'm here to support you however you need.`,
          "high"
        ));
      }
    }

    // 6. Menopause Milestones
    if (latestCycle && (latestCycle.cycle_type === "menopause" || latestCycle.cycle_type === "perimenopause")) {
      const monthsSinceLastPeriod = latestCycle.start_date
        ? Math.floor(differenceInDays(new Date(), new Date(latestCycle.start_date)) / 30)
        : 0;
      
      if (monthsSinceLastPeriod === 12) {
        alerts.push(createAlert(
          "menopause_milestone",
          "🎯 12-Month Menopause Milestone",
          "You've now gone 12 months without a period — this often marks the official transition to postmenopause. Many women find this a good time to check in with your doctor about next steps and symptom management.",
          "medium"
        ));
      } else if (monthsSinceLastPeriod === 6) {
        alerts.push(createAlert(
          "menopause_milestone",
          "📊 6-Month Menopause Check-In",
          "You're now 6 months past your last period. How have you been feeling lately? This can be a helpful moment to review your symptoms and talk with your doctor about what's working well.",
          "low"
        ));
      }
    }

    // 7. Irregular Cycle Alert
    if (cycles.length >= 2 && latestCycle && latestCycle.cycle_type === "menstrual") {
      const prevCycles = cycles.slice(1, 4).filter(c => c.cycle_length);
      if (prevCycles.length >= 1 && latestCycle.cycle_length) {
        const avgPrevLength = prevCycles.reduce((s, c) => s + c.cycle_length, 0) / prevCycles.length;
        const deviation = Math.abs(latestCycle.cycle_length - avgPrevLength);
        if (deviation >= 7) {
          alerts.push(createAlert(
            "irregular_cycle",
            "🔄 Irregular Cycle Alert",
            `I noticed your recent cycle was ${latestCycle.cycle_length} days, which is a bit outside your usual range. Cycles can vary with stress, PMDD, or perimenopause — it's worth tracking. Would you like me to add this to a clinical report for your doctor?`,
            "medium"
          ));
        }
      }
    }

    // 8. Positive Progress Alert
    if (entries.length >= 30) {
      const recentMonth = entries.slice(0, 30);
      const prevMonth = entries.slice(30, 60);
      
      if (prevMonth.length >= 15) {
        const moodKeys = ["s_depression", "s_anxiety", "s_irritability", "s_overwhelmed"];
        const recentAvg = recentMonth.reduce((sum, e) => 
          sum + moodKeys.reduce((s, k) => s + (e[k] || 0), 0), 0
        ) / (recentMonth.length * moodKeys.length);
        const prevAvg = prevMonth.reduce((sum, e) => 
          sum + moodKeys.reduce((s, k) => s + (e[k] || 0), 0), 0
        ) / (prevMonth.length * moodKeys.length);
        
        if (prevAvg - recentAvg >= 0.5) {
          alerts.push(createAlert(
            "positive_progress",
            "🌟 Positive Progress Alert",
            "Great news — I'm seeing some positive shifts in your symptoms or mood compared to last month. Small improvements add up and show your body is responding to your care. You're doing an amazing job — keep going!",
            "low"
          ));
        }
      }
    }

    // Store new alerts (avoid duplicates by type)
    const existingAlerts = await base44.entities.LunaAlert.filter({ 
      created_by: user.email,
      is_read: false
    });
    const existingTypes = new Set(existingAlerts.map(a => a.alert_type));
    const newAlerts = alerts.filter(a => !existingTypes.has(a.alert_type));
    
    if (newAlerts.length > 0) {
      await base44.entities.LunaAlert.bulkCreate(newAlerts);
    }

    // Return sorted unread alerts
    const updatedAlerts = await base44.entities.LunaAlert.filter({ 
      created_by: user.email,
      is_read: false
    });

    const severityOrder = { high: 0, medium: 1, low: 2 };
    return Response.json({ 
      unreadCount: updatedAlerts.length,
      alerts: updatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    });
  } catch (error) {
    console.error('Luna alerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});