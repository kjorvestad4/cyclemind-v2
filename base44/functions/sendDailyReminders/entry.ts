import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { format, differenceInDays, addDays, parseISO } from 'npm:date-fns@4.1.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // For manual invocation (non-automation), verify admin
    let isAutomated = false;
    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch {
      isAutomated = true; // No user session — scheduled automation run
    }

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Get all onboarded users (paginate)
    const allUsers = await sr.entities.User.list('-created_date', 500);

    let emailsSent = 0;
    let alertsCreated = 0;
    let usersProcessed = 0;
    let usersSkipped = 0;

    for (const user of allUsers) {
      // Skip users who haven't onboarded
      if (!user.onboarded) { usersSkipped++; continue; }

      const wantsDaily = user.notif_daily !== false; // default true
      const wantsMode = user.notif_mode !== false;     // default true

      if (!wantsDaily && !wantsMode) { usersSkipped++; continue; }

      // Skip if already alerted today (dedup)
      const todaysAlerts = await sr.entities.LunaAlert.filter({
        user_id: user.id,
        created_date: todayStr
      });
      if (todaysAlerts.length > 0) { usersSkipped++; continue; }

      // Get user's latest cycle and recent entries
      const cycles = await sr.entities.Cycle.filter({ created_by_id: user.id }, '-start_date', 5);
      const latestCycle = cycles[0];
      const entries = await sr.entities.DailyEntry.filter({ created_by_id: user.id }, '-date', 60);
      const todayEntry = entries.find(e => e.date === todayStr);

      let alertData = null;

      // Priority 1: Luteal phase support (notif_mode)
      if (wantsMode && latestCycle && latestCycle.cycle_type === 'menstrual') {
        const cycleDay = latestCycle.start_date
          ? differenceInDays(today, parseISO(latestCycle.start_date)) + 1
          : null;
        const cycleLength = latestCycle.cycle_length || user.cycle_length || 28;
        const lutealStart = cycleLength - 14;

        if (cycleDay && cycleDay >= lutealStart && cycleDay <= cycleLength) {
          const daysUntilPeriod = cycleLength - cycleDay;
          alertData = {
            type: 'luteal_phase',
            title: '🌙 Luteal Phase Support',
            message: `You're in your luteal phase — your period is expected in about ${daysUntilPeriod} day${daysUntilPeriod !== 1 ? 's' : ''}. This is when PMDD symptoms can intensify. Take a moment to log how you're feeling today.`,
            severity: 'high'
          };
        }
      }

      // Priority 2: Period end check-in (notif_mode)
      if (!alertData && wantsMode && latestCycle && latestCycle.cycle_type === 'menstrual' && !latestCycle.end_date) {
        const daysSinceStart = differenceInDays(today, parseISO(latestCycle.start_date));
        const menstruationLength = user.menstruation_length || 5;
        if (daysSinceStart >= menstruationLength && daysSinceStart <= 10) {
          alertData = {
            type: 'log_reminder',
            title: 'Period Ending Soon?',
            message: `Your period started ${daysSinceStart} days ago. Is it still ongoing? Remember to log when it ends in the app.`,
            severity: 'medium'
          };
        }
      }

      // Priority 3: Fertility window (notif_mode + fertility_mode)
      if (!alertData && wantsMode && latestCycle && latestCycle.cycle_type === 'menstrual' && user.fertility_mode) {
        const cycleDay = latestCycle.start_date
          ? differenceInDays(today, parseISO(latestCycle.start_date)) + 1
          : null;
        const cycleLength = latestCycle.cycle_length || user.cycle_length || 28;
        const ovulationDay = cycleLength - 14;
        const fertileStart = ovulationDay - 5;
        const fertileEnd = ovulationDay + 1;

        if (cycleDay && cycleDay >= fertileStart && cycleDay <= fertileEnd) {
          alertData = {
            type: 'fertility_window',
            title: '🌸 Fertile Window',
            message: `You're in your fertile window. If you're tracking for conception, this is a key time. Log your symptoms to keep your data complete.`,
            severity: 'medium'
          };
        }
      }

      // Priority 4: Daily log reminder (notif_daily)
      if (!alertData && wantsDaily && !todayEntry) {
        const lastEntryDate = entries.length > 0 ? entries[0].date : null;
        const daysSinceLog = lastEntryDate ? differenceInDays(today, parseISO(lastEntryDate)) : 999;
        if (daysSinceLog >= 1) {
          alertData = {
            type: 'log_reminder',
            title: '📝 Daily Check-In',
            message: daysSinceLog >= 3
              ? `You haven't logged in ${daysSinceLog} days. Consistent tracking helps spot patterns — take 2 minutes to log today.`
              : 'Take a moment to log your symptoms and mood for today.',
            severity: 'low'
          };
        }
      }

      if (!alertData) { usersSkipped++; continue; }

      usersProcessed++;

      // Create in-app LunaAlert
      try {
        await sr.entities.LunaAlert.create({
          user_id: user.id,
          alert_type: alertData.type,
          title: alertData.title,
          message: alertData.message,
          severity: alertData.severity,
          created_date: todayStr,
          expires_date: format(addDays(today, 7), 'yyyy-MM-dd')
        });
        alertsCreated++;
      } catch (e) {
        console.error(`Alert create failed for ${user.email}:`, e.message);
      }

      // Send email notification
      try {
        await sr.integrations.Core.SendEmail({
          to: user.email,
          subject: alertData.title,
          body: `${alertData.message}\n\nOpen CycleMind to log your symptoms.\n\n— Luna 🌙\n\nCycleMind is not a substitute for professional medical advice.`
        });
        emailsSent++;
      } catch (e) {
        console.error(`Email send failed for ${user.email}:`, e.message);
      }
    }

    return Response.json({
      automated: isAutomated,
      date: todayStr,
      totalUsers: allUsers.length,
      processed: usersProcessed,
      skipped: usersSkipped,
      emailsSent,
      alertsCreated
    });
  } catch (error) {
    console.error('sendDailyReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});