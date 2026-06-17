import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { addDays, format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cycle_id, snooze_days } = await req.json();
        
        if (!cycle_id || !snooze_days) {
            return Response.json({ error: 'Missing cycle_id or snooze_days' }, { status: 400 });
        }

        const validSnoozeDays = [1, 7];
        if (!validSnoozeDays.includes(snooze_days)) {
            return Response.json({ error: 'Invalid snooze_days. Must be 1 or 7.' }, { status: 400 });
        }

        const snoozeUntil = addDays(new Date(), snooze_days);
        const reminderKey = `period_end_reminder_${cycle_id}`;
        
        // Update user with snooze date
        await base44.auth.updateMe({
            [reminderKey]: format(snoozeUntil, 'yyyy-MM-dd')
        });

        return Response.json({
            message: `Reminder snoozed for ${snooze_days} day${snooze_days > 1 ? 's' : ''}`,
            snooze_until: format(snoozeUntil, 'yyyy-MM-dd')
        });

    } catch (error) {
        console.error('Error in snoozePeriodEndReminder:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});