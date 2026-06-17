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
        
        const reminders = [];
        
        for (const cycle of cycles) {
            // Skip if cycle already has an end date
            if (cycle.end_date) continue;
            
            // Only check menstrual cycles
            if (cycle.cycle_type !== 'menstrual') continue;
            
            const startDate = parseISO(cycle.start_date);
            const cycleLength = cycle.cycle_length || 28;
            const typicalPeriodDuration = 5; // Average period lasts 5 days
            
            // Expected end date = start date + typical period duration
            const expectedEndDate = addDays(startDate, typicalPeriodDuration);
            const daysSinceStart = differenceInDays(today, startDate);
            const daysUntilExpected = differenceInDays(expectedEndDate, today);
            
            // Only send reminder if period is still ongoing (not yet ended, and within reasonable window)
            if (daysSinceStart > 0 && daysSinceStart <= 10) {
                const isOverdue = daysUntilExpected < 0;
                
                // Create or update alert
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
                    is_overdue: isOverdue
                });
            }
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