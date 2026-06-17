import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { addDays, format } from 'npm:date-fns@4.1.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's cycles sorted by start date
        const cycles = await base44.entities.Cycle.filter({ 
            created_by: user.email 
        }, "-start_date", 50);

        if (cycles.length === 0) {
            return Response.json({ message: 'No cycles found' });
        }

        // Find the most recent cycle that doesn't have an end date
        const sortedCycles = [...cycles].sort((a, b) => 
            new Date(b.start_date) - new Date(a.start_date)
        );
        
        const activeCycle = sortedCycles.find(c => !c.end_date);
        
        if (!activeCycle) {
            return Response.json({ message: 'No active cycle to end' });
        }

        // Calculate average cycle length from historical data
        const completedCycles = sortedCycles.filter(c => c.end_date && c.cycle_length);
        const avgLength = completedCycles.length > 0
            ? Math.round(completedCycles.reduce((sum, c) => sum + c.cycle_length, 0) / completedCycles.length)
            : 28;

        // Calculate expected end date (typically period lasts 3-7 days, use 5 as default)
        const startDate = new Date(activeCycle.start_date);
        const expectedEndDate = addDays(startDate, 5);
        const today = new Date();
        
        // Check if we're at or past the expected end date
        const daysOverdue = Math.floor((today - expectedEndDate) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue < 0) {
            return Response.json({ 
                message: 'Not yet at expected end date',
                daysUntilExpected: Math.abs(daysOverdue)
            });
        }

        // Auto-end the cycle
        const endDate = format(today, 'yyyy-MM-dd');
        await base44.entities.Cycle.update(activeCycle.id, {
            end_date: endDate,
            cycle_length: avgLength
        });

        // Log the action
        await base44.entities.AuditLog.create({
            timestamp: new Date().toISOString(),
            user_id: user.id,
            action: 'update',
            table_affected: 'Cycle',
            record_id: activeCycle.id,
            details: JSON.stringify({
                reason: 'auto_ended_by_system',
                days_overdue: daysOverdue,
                expected_end_date: format(expectedEndDate, 'yyyy-MM-dd')
            })
        });

        return Response.json({
            message: 'Cycle auto-ended',
            cycle_id: activeCycle.id,
            end_date: endDate,
            days_overdue: daysOverdue
        });

    } catch (error) {
        console.error('Error in autoEndCycle:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});