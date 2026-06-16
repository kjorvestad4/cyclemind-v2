import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { subDays, format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        
        // Create 4 sample cycles spanning ~4 months
        const sampleCycles = [
            {
                start_date: format(subDays(today, 10), 'yyyy-MM-dd'), // Current cycle started 10 days ago
                end_date: null,
                cycle_length: 28,
                cycle_type: 'menstrual',
                phase: 'luteal',
            },
            {
                start_date: format(subDays(today, 38), 'yyyy-MM-dd'), // Last cycle (38 days ago)
                end_date: format(subDays(today, 33), 'yyyy-MM-dd'), // Lasted 5 days
                cycle_length: 28,
                cycle_type: 'menstrual',
                phase: 'menstrual',
            },
            {
                start_date: format(subDays(today, 66), 'yyyy-MM-dd'), // 2 cycles ago (66 days ago)
                end_date: format(subDays(today, 61), 'yyyy-MM-dd'),
                cycle_length: 28,
                cycle_type: 'menstrual',
                phase: 'menstrual',
            },
            {
                start_date: format(subDays(today, 94), 'yyyy-MM-dd'), // 3 cycles ago (94 days ago)
                end_date: format(subDays(today, 89), 'yyyy-MM-dd'),
                cycle_length: 28,
                cycle_type: 'menstrual',
                phase: 'menstrual',
            },
        ];

        // Check if cycles already exist to avoid duplicates
        const existingCycles = await base44.entities.Cycle.filter({ created_by: user.email }, '-start_date', 10);
        
        if (existingCycles.length > 0) {
            return Response.json({ 
                message: 'Cycle history already exists',
                existing_count: existingCycles.length
            });
        }

        // Create sample cycles
        const created = [];
        for (const cycle of sampleCycles) {
            const result = await base44.entities.Cycle.create({
                ...cycle,
                user_id: user.id,
            });
            created.push(result);
        }

        return Response.json({ 
            success: true,
            message: `Created ${created.length} sample cycles`,
            cycles: created
        });

    } catch (error) {
        console.error('Error seeding cycles:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});