import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all cycles for this user, sorted by start_date (newest first)
        const allCycles = await base44.entities.Cycle.filter({ created_by: user.email }, '-start_date', 100);

        if (allCycles.length === 0) {
            return Response.json({ message: 'No cycles found' });
        }

        // Keep only the most recent cycle (the one you actually logged)
        const latestCycle = allCycles[0];
        const cyclesToDelete = allCycles.slice(1); // All except the most recent

        // Delete older cycles
        for (const cycle of cyclesToDelete) {
            await base44.entities.Cycle.delete(cycle.id);
        }

        return Response.json({
            success: true,
            message: `Cleaned up cycle history. Kept your most recent cycle (${latestCycle.start_date}), deleted ${cyclesToDelete.length} older cycles.`,
            kept_cycle: {
                id: latestCycle.id,
                start_date: latestCycle.start_date,
                cycle_length: latestCycle.cycle_length
            },
            deleted_count: cyclesToDelete.length
        });

    } catch (error) {
        console.error('Error cleaning up cycles:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});