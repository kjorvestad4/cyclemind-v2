import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { addDays, format, differenceInDays, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        
        // Fetch all cycles for this user
        const cycles = await base44.entities.Cycle.filter({ created_by: user.email }, '-start_date', 50);
        
        // Fetch all daily entries for this user
        const allEntries = await base44.entities.DailyEntry.filter({ created_by: user.email }, '-date', 400);
        
        const reminders = [];
        const menstruationLength = user.menstruation_length || 5;
        
        for (const cycle of cycles) {
            // Skip if cycle already has an end date
            if (cycle.end_date) continue;
            
            // Only check menstrual cycles
            if (cycle.cycle_type !== 'menstrual') continue;
            
            const startDate = parseISO(cycle.start_date);
            const daysSinceStart = differenceInDays(today, startDate);
            
            // Only send reminder if period is still ongoing (not yet ended, and within reasonable window)
            if (daysSinceStart <= 0 || daysSinceStart > 10) continue;
            
            // Count bleeding days for this cycle (up to today)
            const bleedingDays = allEntries.filter(e => {
                if (!e.date) return false;
                const entryDate = parseISO(e.date);
                if (entryDate < startDate || entryDate > today) return false;
                return (e.bleeding_intensity && e.bleeding_intensity > 0) || (e.menstrual_flow && e.menstrual_flow !== '');
            });
            const bleedingDayCount = bleedingDays.length;
            
            // If user has logged any bleeding, don't show "late" reminder
            if (bleedingDayCount > 0) {
                // After expected end, if bleeding days differ from average, suggest updating
                if (daysSinceStart >= menstruationLength && bleedingDayCount !== menstruationLength) {
                    await base44.entities.LunaAlert.create({
                        user_id: user.id,
                        alert_type: 'irregular_cycle',
                        title: 'Menstruation Length Check-In',
                        message: `You logged ${bleedingDayCount} bleeding day${bleedingDayCount !== 1 ? 's' : ''} this cycle — your average is ${menstruationLength} days. Would you like to update your menstruation length?`,
                        severity: 'low',
                        created_date: todayStr,
                        expires_date: format(addDays(today, 7), 'yyyy-MM-dd')
                    });

                    reminders.push({
                        cycle_id: cycle.id,
                        days_since_start: daysSinceStart,
                        bleeding_day_count: bleedingDayCount,
                        menstruation_length: menstruationLength,
                        type: 'update_length'
                    });
                }
                continue;
            }
            
            // No bleeding logged — show original check-in
            const expectedEndDate = addDays(startDate, menstruationLength);
            const daysUntilExpected = differenceInDays(expectedEndDate, today);
            const isOverdue = daysUntilExpected < 0;
            
            await base44.entities.LunaAlert.create({
                user_id: user.id,
                alert_type: 'log_reminder',
                title: isOverdue ? 'Period Still Ongoing?' : 'Period Ending Soon',
                message: isOverdue
                    ? `Your period started ${daysSinceStart} days ago. Is it still ongoing? Update your cycle end date in the dashboard.`
                    : `Your period started on ${format(startDate, 'MMM d')}. Expected to end around ${format(expectedEndDate, 'MMM d')}. Remember to log when it ends!`,
                severity: isOverdue ? 'medium' : 'low',
                created_date: todayStr,
                expires_date: format(addDays(today, 7), 'yyyy-MM-dd')
            });

            reminders.push({
                cycle_id: cycle.id,
                expected_end_date: format(expectedEndDate, 'yyyy-MM-dd'),
                days_since_start: daysSinceStart,
                is_overdue: isOverdue,
                type: 'check_in'
            });
        }

        return Response.json({
            message: `Processed ${cycles.length} cycles`,
            reminders_sent: reminders.length,
            reminders
        });

    } catch (error) {
        console.error('Error in checkPeriodEndReminders:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});